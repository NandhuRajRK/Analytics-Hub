#!/usr/bin/env python3
"""
Startup script for the Portfolio Dashboard LLM API
"""

import uvicorn
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

if __name__ == "__main__":
    print("🚀 Starting Portfolio Dashboard LLM API...")
    print("📍 Server will run on: http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    print("🔍 Health Check: http://localhost:8000/health")
    print("🤖 LLM Status:", "OpenAI Available" if os.getenv("OPENAI_API_KEY") else "Template System Only")
    print("-" * 50)
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
