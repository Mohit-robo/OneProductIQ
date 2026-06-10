import os
import sys
import pandas as pd
from pathlib import Path
from PIL import Image

# Setup path to import backend modules
ROOT_DIR = Path(__file__).parent.parent
sys.path.append(str(ROOT_DIR))

from vlm_wrapper import get_visual_description_from_image
from llm_wrapper import parse_metadata_from_vision, llm
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel

class EvalMatch(BaseModel):
    type_match: bool
    color_match: bool
    usage_match: bool
    reasoning: str

eval_llm = llm.with_structured_output(EvalMatch)

def evaluate_semantic_match(gt_type: str, gt_color: str, gt_usage: str, vlm_type: str, vlm_color: str, vlm_usage: str) -> EvalMatch:
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
    chain = prompt | eval_llm
    return chain.invoke({
        "gt_type": gt_type, "vlm_type": vlm_type,
        "gt_color": gt_color, "vlm_color": vlm_color,
        "gt_usage": gt_usage, "vlm_usage": vlm_usage
    })

def evaluate_vlm_pipeline(dataset_dir: str, csv_path: str, num_samples: int = 10):
    """
    Evaluates the VLM (Qwen3-VL) + LLM (Gemini) metadata extraction pipeline against styles.csv
    """
    if not os.path.exists(csv_path):
        print(f"Error: Could not find ground truth file at {csv_path}")
        return

    print("Loading ground truth dataset...")
    try:
        df = pd.read_csv(csv_path, on_bad_lines='skip')
    except TypeError:
        # Fallback for older pandas versions
        df = pd.read_csv(csv_path, error_bad_lines=False)
    df['id'] = df['id'].astype(str)
    
    dataset_path = Path(dataset_dir)
    image_files = list(dataset_path.glob("*.jpg"))[:num_samples]
    
    if not image_files:
        print(f"Error: No images found in {dataset_dir}")
        return

    results = []
    print(f"Starting evaluation on {len(image_files)} samples...")
    
    for img_path in image_files:
        product_id = img_path.stem
        
        # Get ground truth
        gt_row = df[df['id'] == product_id]
        if gt_row.empty:
            print(f"Warning: No ground truth for {product_id}, skipping.")
            continue
            
        gt_data = gt_row.iloc[0]
        print(f"\nProcessing Product ID: {product_id}")
        
        try:
            pil_img = Image.open(img_path)
            
            # 1. Qwen-VL Visual Description
            visual_desc = get_visual_description_from_image(pil_img)
            
            # 2. Gemini Structural Parsing
            parsed_metadata = parse_metadata_from_vision(f"Visual Description: {visual_desc}")
            metadata = parsed_metadata.model_dump()
            
            # 3. Compare with Ground Truth via LLM Judge
            vlm_type = metadata.get('product_type', '').lower()
            gt_type = str(gt_data['articleType']).lower()
            
            vlm_color = metadata.get('primary_color', '').lower()
            gt_color = str(gt_data['baseColour']).lower()
            
            vlm_usage = ", ".join(metadata.get('occasions', [])).lower()
            gt_usage = str(gt_data['usage']).lower()
            
            # Use LLM to judge semantic match
            match_result = evaluate_semantic_match(gt_type, gt_color, gt_usage, vlm_type, vlm_color, vlm_usage)
            
            results.append({
                'id': product_id,
                'gt_type': gt_type,
                'vlm_type': vlm_type,
                'type_match': match_result.type_match,
                'gt_color': gt_color,
                'vlm_color': vlm_color,
                'color_match': match_result.color_match,
                'gt_usage': gt_usage,
                'vlm_usage': vlm_usage,
                'usage_match': match_result.usage_match,
                'reasoning': match_result.reasoning
            })
            
            print(f"  Type Match: {match_result.type_match}  (GT: '{gt_type}' | VLM: '{vlm_type}')")
            print(f"  Color Match: {match_result.color_match} (GT: '{gt_color}' | VLM: '{vlm_color}')")
            print(f"  Usage Match: {match_result.usage_match} (GT: '{gt_usage}' | VLM: '{vlm_usage}')")
            print(f"  Reasoning: {match_result.reasoning}")
            
        except Exception as e:
            print(f"Error processing {product_id}: {e}")
            
    # Calculate metrics
    if results:
        df_results = pd.DataFrame(results)
        type_acc = df_results['type_match'].mean() * 100
        color_acc = df_results['color_match'].mean() * 100
        usage_acc = df_results['usage_match'].mean() * 100
        
        print("\n===============================")
        print("      EVALUATION RESULTS       ")
        print("===============================")
        print(f"Samples Evaluated: {len(results)}")
        print(f"Product Type Accuracy: {type_acc:.2f}%")
        print(f"Primary Color Accuracy: {color_acc:.2f}%")
        print(f"Usage/Occasion Accuracy: {usage_acc:.2f}%")
        print("===============================")

if __name__ == "__main__":
    # For Docker: paths mapped via docker-compose
    docker_dataset = "/data/eval_dataset/test_samples"
    docker_csv = "/data/eval_dataset/styles.csv"
    
    # For Local execution: relative to backend/src/eval
    local_dataset = "../../../data/eval_dataset/test_samples"
    local_csv = "../../../data/eval_dataset/styles.csv"
    
    if os.path.exists("/.dockerenv"):
        dataset_dir = docker_dataset
        csv_path = docker_csv
    else:
        dataset_dir = local_dataset
        csv_path = local_csv
        
    evaluate_vlm_pipeline(dataset_dir, csv_path, num_samples=100)
