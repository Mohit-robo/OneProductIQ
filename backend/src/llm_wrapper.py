import os
from langchain.chat_models import init_chat_model
from langchain_core.prompts import ChatPromptTemplate
from schemas import ProductMetadata

# Use the API key from environment, map it to GOOGLE_API_KEY as requested by the user
os.environ["GOOGLE_API_KEY"] = os.getenv("GEMINI_API_KEY", os.getenv("GOOGLE_API_KEY", ""))

# Using gemini-2.5-flash via init_chat_model
llm = init_chat_model("google_genai:gemini-2.5-flash")
structured_llm = llm.with_structured_output(ProductMetadata)

def parse_metadata_csv(csv_content: str) -> ProductMetadata:
    """
    Parses raw metadata.csv content using Gemini and returns a structured ProductMetadata object.
    """
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are an expert e-commerce cataloger. Extract product details from the given raw CSV content and populate the schema. Ensure fields like price are parsed as numbers. If some information is not in the CSV, make your best educated guess based on the title/description or leave it generic."),
        ("user", "CSV Content:\n{csv_content}")
    ])
    
    chain = prompt | structured_llm
    return chain.invoke({"csv_content": csv_content})

if __name__ == "__main__":
    csv_path = "/data/products/test/1/entry_1/metadata.csv"
    
    with open(csv_path, "r", encoding="utf-8") as f:
        csv_content = f.read()
    metadata = parse_metadata_csv(csv_content)
    
    print(metadata)