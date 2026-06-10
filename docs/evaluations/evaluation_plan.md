# OneProductIQ Evaluation Plan

This document outlines a structured approach to evaluate the end-to-end multimodal retrieval pipeline of OneProductIQ, utilizing the 750+ ingested products, the `data/eval_dataset/` images, and the ground-truth metadata in `styles.csv`.

Based on the [Confident AI LLM Evaluation Guide](https://www.confident-ai.com/blog/llm-evaluation-metrics-everything-you-need-for-llm-evaluation), we will break down the evaluation into four core components: **VLM (Ingestion)**, **RAG (Retrieval)**, **LLM (Generation)**, and **Agents (Orchestration)**.

---

## 1. VLM Pipeline Evaluation (Data Ingestion)
The goal here is to evaluate how accurately `Qwen3-VL` extracts metadata from the product images compared to the Ground Truth (GT) in `styles.csv`.

**Dataset:** `data/eval_dataset/test_samples/` (Images) mapped to their corresponding `id` rows in `styles.csv`.
**Evaluation Approach:** Exact Match & Semantic Scoring

*   **Categorization Accuracy (Exact/Semantic Match):**
    *   Compare VLM extracted `product_type` against GT `articleType` and `subCategory`.
    *   *Metric:* Exact match ratio (or semantic similarity using a fast embedder if synonyms like "Tshirt" vs "T-shirt" occur).
*   **Attribute Correctness (Exact/Semantic Match):**
    *   Compare VLM extracted `primary_color` against GT `baseColour`.
    *   Compare VLM extracted `occasions` against GT `usage` and `season`.
    *   *Metric:* F1-Score for attribute extraction.

---

## 2. RAG Evaluation (Retriever Efficiency)
This evaluates the ChromaDB vector search performance. When a user uploads an image or searches text, does the retriever fetch the most relevant products?

**Dataset Generation:** We will generate synthetic test queries based on the `styles.csv` metadata (e.g., "Show me blue casual shirts for men" -> Target ID: 15970).
**Evaluation Approach:** QAG (Question Answer Generation) Scorers & Ranking Metrics

*   **Contextual Precision:** 
    *   *Definition:* Evaluates if the exact ground-truth product (or highly similar ones) are ranked at the very top of the retrieved list.
    *   *Metric calculation:* Mean Average Precision (mAP) or traditional Contextual Precision using an LLM-as-a-judge.
*   **Contextual Recall:**
    *   *Definition:* Given a query like "Red Puma T-shirts", did the retriever successfully pull *all* matching products from the 750 DB entries?
*   **Contextual Relevancy:**
    *   *Definition:* Calculates the proportion of retrieved items that actually match the user's query intent. 

---

## 3. LLM Pipeline Evaluation (Response Generation)
Once products are retrieved, how well does the LLM format the response and converse with the user?

**Evaluation Approach:** LLM-as-a-Judge (e.g., using DeepEval's G-Eval or QAG)

*   **Faithfulness (Hallucination Detection):**
    *   *Definition:* Does the LLM invent features about the retrieved products? (e.g., The DB says it's cotton, but the LLM says it's silk).
    *   *Metric:* Proportion of claims made in the LLM output that align factually with the retrieved ChromaDB chunks.
*   **Answer Relevancy:**
    *   *Definition:* Does the LLM actually answer the user's question, or does it ramble?
*   **Helpfulness (Custom G-Eval):**
    *   *Definition:* A custom subjective metric (1-5 scale) evaluating the tone, brand alignment, and UX value of the LLM's response.

---

## 4. Agent Efficiency Evaluation (Orchestration & Tools)
If OneProductIQ uses an Agentic workflow (e.g., ReAct) to route between Text Search, Visual Search, and Cart actions.

**Evaluation Approach:** Component-level execution tracing.

*   **Tool Correctness:**
    *   *Definition:* When a user says "Find pants similar to this image", did the Agent successfully trigger the `VisualSearchTool` instead of the `TextSearchTool`?
    *   *Metric:* Exact match between `expected_tools` and `tools_called`.
*   **Task Completion:**
    *   *Definition:* Did the multi-step interaction complete successfully? (e.g., User uploads image -> Agent extracts features -> Agent queries ChromaDB -> Agent formulates response).

---

## 5. Execution Strategy & Next Steps

1.  **Data Preparation Script:** Write a Python script to pair the images in `test_samples/` with their row in `styles.csv` based on the file name (`<id>.jpg`).
2.  **VLM Benchmark Run:** Pass the paired images through `Qwen3-VL` and log the output JSONs. Compare them against the CSV using a simple Python evaluation script.
3.  **Framework Setup:** Integrate an open-source evaluation framework like **DeepEval** or **Ragas** to automate the LLM/RAG metrics (Faithfulness, Contextual Relevancy, etc.).
4.  **Trace Logging:** Add tracing (via LangSmith or DeepEval traces) to the `backend/src/agent.py` to capture Agent trajectories for Tool Correctness evaluation.
