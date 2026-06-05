# Future Plans & Next Steps

**Optimization Phase:**
- Quantize Qwen-VL:2B (INT8) for faster inference
- Fine-tune embeddings on clothing domain
- Add hybrid search (semantic + filter)
- Cache agent responses for repeated queries

**Scalability Phase:**
- Deploy to AWS ECS (FastAPI, VLM, MongoDB Atlas)
- Use Redis for session/embedding cache
- Implement rate limiting + API keys
- A/B test agent prompts

**Product Phase:**
- Add real product data (web scraping or CSV import)
- Implement user accounts + purchase history
- Analytics dashboard (search queries, conversion funnel)
- Admin panel for product curation
