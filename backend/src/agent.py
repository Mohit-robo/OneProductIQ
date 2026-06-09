from typing import Annotated, TypedDict, List
from langchain_core.messages import BaseMessage, SystemMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langchain.chat_models import init_chat_model
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver

from src.tools import get_tools
from src.config import Settings

settings = Settings()

import os
from dotenv import load_dotenv
load_dotenv()

os.environ["GOOGLE_API_KEY"]=os.getenv("GEMINI_API_KEY", "")
os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY", "")

# 1. Define the Agent State
class AgentState(TypedDict):
    """
    State representing the agent's memory and working context.
    - messages: Conversation history (Human, AI, and Tool messages).
    - cart: A list of SKUs currently added to the user's cart.
    - recommendations: Last generated product recommendations to display on the frontend.
    """
    messages: Annotated[list[BaseMessage], add_messages]
    cart: List[str]
    recommendations: List[dict]


# 2. Setup the LLM and Bind Tools
# We use Gemini as our primary reasoning engine for the ReAct loop
_llm_with_tools = None
_tools = None

def get_llm_with_tools():
    global _llm_with_tools, _tools
    if _llm_with_tools is None:
        llm = init_chat_model(model=settings.gemini_model_name)
        _tools = get_tools()
        _llm_with_tools = llm.bind_tools(_tools)
    return _llm_with_tools, _tools

# 3. Define the Nodes
def agent_node(state: AgentState):
    """
    The main reasoning node. Injects system instructions and calls the LLM.
    """
    messages = state.get("messages", [])
    
    # Core system prompt controlling agent behavior and guardrails
    sys_prompt = SystemMessage(content=(
        "You are the OneProductIQ virtual shopping assistant. Your goal is to help users find clothes, answer questions, and manage their cart.\n"
        "Guidelines:\n"
        "1. Always use the `search_store` tool when a user asks for products. Do not guess.\n"
        "2. If a user wants to buy something, verify it's in stock using `get_inventory` and then use `add_to_cart`.\n"
        "3. Base your product descriptions exclusively on the search results provided. Never hallucinate details or invent SKUs.\n"
        "4. Be concise, polite, patient and helpful."
    ))
    
    # Ensure system prompt is the first message
    if not messages or not isinstance(messages[0], SystemMessage):
        messages = [sys_prompt] + messages
        
    llm_with_tools, _ = get_llm_with_tools()
    response = llm_with_tools.invoke(messages)
    
    # We return the delta (the new message) which `add_messages` will append to the state
    return {"messages": [response]}


def state_update_node(state: AgentState):
    """
    A simple node that scans recent tool executions to update the specific `cart` 
    or `recommendations` state variables without needing the LLM to rewrite them.
    """
    # For now, we will just return empty updates to let the state persist.
    # In a fully fleshed out iteration, we'd extract the SKU from the add_to_cart ToolMessage 
    # and append it to state["cart"].
    return {}

def build_agent_graph():

    llm_with_tools, tools = get_llm_with_tools()

    # 4. Build the Graph Workflow
    workflow = StateGraph(AgentState)

    # Add our nodes
    workflow.add_node("agent", agent_node)
    workflow.add_node("tools", ToolNode(tools))
    workflow.add_node("state_updater", state_update_node)

    # Define the flow
    workflow.add_edge(START, "agent")

    # Conditional routing: If LLM output has tool calls -> 'tools', else -> END
    workflow.add_conditional_edges("agent", tools_condition, {"tools": "tools", "__end__": END})

    # After tools run, update state, then loop back to the agent
    workflow.add_edge("tools", "state_updater")
    workflow.add_edge("state_updater", "agent")

    # Compile the graph into an executable application with in-memory checkpointer
    memory = MemorySaver()
    app = workflow.compile(checkpointer=memory)

    return app

if __name__ == "__main__":
    agent_app = build_agent_graph()
    print("Agent graph built successfully")