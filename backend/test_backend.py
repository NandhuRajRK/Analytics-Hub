#!/usr/bin/env python3
"""
Test script for the Portfolio Dashboard LLM API
"""

import requests
import json

def test_backend():
    base_url = "http://localhost:8000"
    
    print("🧪 Testing Portfolio Dashboard LLM API Backend...")
    print("=" * 50)
    
    # Test 1: Health Check
    print("\n1. Testing Health Check...")
    try:
        response = requests.get(f"{base_url}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health check passed: {data['status']}")
            print(f"   LLM Status: OpenAI={data['llm_status']['openai_available']}, Template={data['llm_status']['template_system']}")
        else:
            print(f"❌ Health check failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check error: {e}")
    
    # Test 2: Root endpoint
    print("\n2. Testing Root Endpoint...")
    try:
        response = requests.get(f"{base_url}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root endpoint: {data['message']}")
        else:
            print(f"❌ Root endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Root endpoint error: {e}")
    
    # Test 3: LLM Query with sample data
    print("\n3. Testing LLM Query...")
    
    sample_data = {
        "query": "What's the overall portfolio status?",
        "data_context": {
            "portfolios": [
                {"id": "Tech", "name": "Technology", "value": 5000000},
                {"id": "Finance", "name": "Finance", "value": 3000000}
            ],
            "programs": [
                {"id": "Dev", "name": "Development", "value": 2000000},
                {"id": "QA", "name": "Quality Assurance", "value": 1000000}
            ],
            "projects": [
                {"id": "proj1", "name": "Web App", "value": 1000000, "status": "On Track", "portfolio": "Tech", "program": "Dev"},
                {"id": "proj2", "name": "Mobile App", "value": 800000, "status": "Delayed", "portfolio": "Tech", "program": "Dev"},
                {"id": "proj3", "name": "Testing Suite", "value": 500000, "status": "Completed", "portfolio": "Tech", "program": "QA"}
            ],
            "budgets": [
                {"id": "proj1", "name": "Web App", "value": 1000000, "status": "On Track", "portfolio": "Tech", "program": "Dev"},
                {"id": "proj2", "name": "Mobile App", "value": 800000, "status": "Delayed", "portfolio": "Tech", "program": "Dev"},
                {"id": "proj3", "name": "Testing Suite", "value": 500000, "status": "Completed", "portfolio": "Tech", "program": "QA"}
            ],
            "timelines": [
                {"project": "Web App", "start": "2024-01-01", "end": "2024-06-30", "status": "On Track"},
                {"project": "Mobile App", "start": "2024-02-01", "end": "2024-07-31", "status": "Delayed"},
                {"project": "Testing Suite", "start": "2024-01-15", "end": "2024-03-15", "status": "Completed"}
            ],
            "dependencies": [
                {"source": "Web App", "target": "Testing Suite", "type": "dependency"},
                {"source": "Mobile App", "target": "Web App", "type": "dependency"}
            ]
        },
        "current_view": "dashboard"
    }
    
    try:
        response = requests.post(
            f"{base_url}/api/llm/query",
            json=sample_data,
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ LLM Query successful!")
            print(f"   Response: {data['response'][:100]}...")
            print(f"   Insights: {len(data['insights'])}")
            print(f"   Recommendations: {len(data['recommendations'])}")
            print(f"   Data Summary: {data['data_summary']}")
        else:
            print(f"❌ LLM Query failed: {response.status_code}")
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"❌ LLM Query error: {e}")
    
    # Test 4: Available Models
    print("\n4. Testing Available Models...")
    try:
        response = requests.get(f"{base_url}/api/models/available")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Models endpoint: OpenAI={data['openai_available']}, Template={data['template_system']}")
        else:
            print(f"❌ Models endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Models endpoint error: {e}")
    
    print("\n" + "=" * 50)
    print("🏁 Backend testing completed!")

if __name__ == "__main__":
    test_backend()
