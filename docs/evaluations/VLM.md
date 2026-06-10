

LLM as a Judge

    ## judge prompt used:
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are an AI judge evaluating a multimodal cataloging pipeline. Your job is to determine if the VLM's extracted values semantically match the Ground Truth (GT) values. 
        
        MATCHING RULES:
        1. Categorical fields: Accept synonyms and generalizations (e.g., 't-shirt' matches 'tshirts', 'navy blue' matches 'blue')
        2. List fields: Match if ANY item in VLM list relates to GT list
        3. Text fields: Match if core concepts align (exact wording not required)
        4. Contradictions: Return False only for entirely opposite values (e.g., 'pants' vs 'shirt').
        Briefly explain your reasoning."""),
        
        ("user", "GT Type: {gt_type} | VLM Type: {vlm_type}\nGT Color: {gt_color} | VLM Color: {vlm_color}\nGT Usage: {gt_usage} | VLM Usage: {vlm_usage}")
    ])

    ## vlm prompt:

    prompt = (
        "You are an expert e-commerce fashion cataloger. "
        "Describe the visual appearance, color, pattern, and shape of this clothing item in a highly detailed paragraph. "
        "Focus purely on what you can see. Do not mention price, brand, or materials."
    )

Evaluation Results
===============================
      EVALUATION RESULTS       
===============================
Samples Evaluated: 100
Product Type Accuracy: 88.00%
Primary Color Accuracy: 73.00%
Usage/Occasion Accuracy: 89.00%
===============================

**Tips**
1. Update the vlm prompt to generate better descriptions.
2. Update the vlm prompt from just an fashion cataloger to an expert in metadata extraction from general products as well.