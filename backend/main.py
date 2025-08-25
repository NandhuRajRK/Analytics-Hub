from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime

# LLM imports
from langchain_community.llms import OpenAI
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import HumanMessage, SystemMessage
import ollama

app = FastAPI(title="Portfolio Dashboard LLM API", version="1.0.0")

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class PortfolioData(BaseModel):
    portfolios: List[Dict[str, Any]]
    programs: List[Dict[str, Any]]
    projects: List[Dict[str, Any]]
    budgets: List[Dict[str, Any]]
    timelines: List[Dict[str, Any]]
    dependencies: List[Dict[str, Any]]

class QueryRequest(BaseModel):
    query: str
    data_context: PortfolioData
    current_view: Optional[str] = "dashboard"

class QueryResponse(BaseModel):
    response: str
    insights: List[str]
    recommendations: List[str]
    data_summary: Dict[str, Any]
    timestamp: str

# Initialize LLM (OpenAI, Ollama local model, or template fallback)
try:
    # First try to use Ollama local model
    try:
        # Test if Ollama is running and has models
        print("🔍 Testing Ollama connection...")
        available_models = ollama.list()
        print(f"📋 Ollama response: {available_models}")
        
        if available_models and hasattr(available_models, 'models') and len(available_models.models) > 0:
            use_ollama = True
            use_openai = False
            print(f"✅ Using Ollama local model: {available_models.models[0].model}")
        else:
            use_ollama = False
            print("No Ollama models found. Checking OpenAI...")
    except Exception as e:
        use_ollama = False
        print(f"Ollama not available: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
    
    # If Ollama not available, try OpenAI
    if not use_ollama:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            llm = ChatOpenAI(
                model_name="gpt-3.5-turbo",
                temperature=0.1,
                openai_api_key=openai_api_key
            )
            use_openai = True
            print("✅ Using OpenAI API")
        else:
            use_openai = False
            print("No OpenAI API key found.")
    
    # If neither available, use template system
    if not use_ollama and not use_openai:
        print("Using template-based responses as fallback.")
        
except Exception as e:
    print(f"Error initializing LLM: {e}")
    use_openai = False
    use_ollama = False

# Template-based response system for when LLM is not available
def generate_template_response(query: str, data_context: PortfolioData) -> QueryResponse:
    """Generate intelligent responses using data analysis and templates"""
    
    # Analyze the data
    total_budget = sum(item.get('value', 0) for item in data_context.projects)
    portfolio_count = len(data_context.portfolios)
    program_count = len(data_context.programs)
    project_count = len(data_context.projects)
    
    # Status analysis
    status_counts = {}
    for project in data_context.projects:
        status = project.get('status', 'Unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    # Budget analysis
    portfolio_budgets = {}
    for portfolio in data_context.portfolios:
        portfolio_id = portfolio.get('id', 'Unknown')
        portfolio_budgets[portfolio_id] = portfolio.get('value', 0)
    
    # Timeline analysis
    timeline_data = {}
    for timeline in data_context.timelines:
        if timeline.get('start') and timeline.get('end'):
            timeline_data[timeline['project']] = {
                'start': timeline['start'],
                'end': timeline['end'],
                'status': timeline['status']
            }
    
    # Dependency analysis
    dependency_count = len(data_context.dependencies)
    dependency_map = {}
    for dep in data_context.dependencies:
        source = dep.get('source', 'Unknown')
        if source not in dependency_map:
            dependency_map[source] = []
        dependency_map[source].append(dep.get('target', 'Unknown'))
    
    # Generate insights based on query keywords
    query_lower = query.lower()
    insights = []
    recommendations = []
    
    if 'budget' in query_lower:
        insights.append(f"Total portfolio budget: ${total_budget:,.0f}")
        insights.append(f"Average project budget: ${total_budget/project_count:,.0f}")
        
        if 'utilization' in query_lower:
            recommendations.append("Consider reviewing under-utilized portfolios")
            recommendations.append("Monitor budget vs. actual spending trends")
    
    if 'status' in query_lower:
        insights.append(f"Project status distribution: {status_counts}")
        if 'risk' in query_lower or 'delayed' in query_lower:
            delayed_count = status_counts.get('Delayed', 0)
            if delayed_count > 0:
                recommendations.append(f"Focus on {delayed_count} delayed projects")
                recommendations.append("Review resource allocation for delayed projects")
    
    if 'portfolio' in query_lower:
        insights.append(f"Portfolio count: {portfolio_count}")
        insights.append(f"Program count: {program_count}")
        insights.append(f"Project count: {project_count}")
        
        if 'performance' in query_lower:
            recommendations.append("Analyze portfolio performance metrics")
            recommendations.append("Identify high-performing vs. under-performing portfolios")
    
    if 'dependency' in query_lower:
        insights.append(f"Total dependencies: {dependency_count}")
        if dependency_count > 0:
            recommendations.append("Review critical path dependencies")
            recommendations.append("Identify potential bottleneck projects")
    
    if 'timeline' in query_lower or 'schedule' in query_lower:
        insights.append(f"Timeline data available for {len(timeline_data)} projects")
        if timeline_data:
            recommendations.append("Review project timelines for potential conflicts")
            recommendations.append("Monitor critical path dependencies")
    
    # Default insights if no specific keywords found
    if not insights:
        insights.append(f"Portfolio Overview: {portfolio_count} portfolios, {program_count} programs, {project_count} projects")
        insights.append(f"Total Budget: ${total_budget:,.0f}")
        insights.append(f"Project Status: {status_counts}")
        if timeline_data:
            insights.append(f"Timeline data available for {len(timeline_data)} projects")
        if dependency_count > 0:
            insights.append(f"Dependency relationships: {dependency_count}")
    
    if not recommendations:
        recommendations.append("Review portfolio performance monthly")
        recommendations.append("Monitor project status changes")
        recommendations.append("Analyze budget utilization trends")
        if timeline_data:
            recommendations.append("Review project timelines regularly")
        if dependency_count > 0:
            recommendations.append("Monitor dependency impacts on project delivery")
    
    return QueryResponse(
        response=f"Based on your query '{query}', here's what I found in your portfolio data:",
        insights=insights,
        recommendations=recommendations,
        data_summary={
            "total_budget": total_budget,
            "portfolio_count": portfolio_count,
            "program_count": program_count,
            "project_count": project_count,
            "status_distribution": status_counts,
            "portfolio_budgets": portfolio_budgets,
            "timeline_projects": len(timeline_data),
            "dependency_count": dependency_count
        },
        timestamp=datetime.now().isoformat()
    )

# LLM-based response system
def generate_llm_response(query: str, data_context: PortfolioData) -> QueryResponse:
    """Generate responses using the LLM"""
    
    # Format data for LLM consumption
    data_summary = {
        "portfolios": len(data_context.portfolios),
        "programs": len(data_context.programs),
        "projects": len(data_context.projects),
        "total_budget": sum(item.get('value', 0) for item in data_context.projects),
        "statuses": list(set(item.get('status', 'Unknown') for item in data_context.projects))
    }
    
    # Create detailed system prompt with more context
    system_prompt = f"""You are a Portfolio Data Analyst Assistant. Your role is to provide concise, actionable insights for portfolio managers.

AVAILABLE DATA:
- PORTFOLIOS: {data_summary['portfolios']} portfolios
- PROGRAMS: {data_summary['programs']} programs  
- PROJECTS: {data_summary['projects']} projects
- TOTAL BUDGET: ${data_summary['total_budget']:,.0f}
- PROJECT STATUSES: {', '.join(data_summary['statuses'])}
- TIMELINES: {len(data_context.timelines)} projects with timeline data
- DEPENDENCIES: {len(data_context.dependencies)} dependency relationships

PORTFOLIO DETAILS:
{chr(10).join([f"- {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f}" for p in data_context.portfolios])}

PROGRAM DETAILS:
{chr(10).join([f"- {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f}" for p in data_context.programs])}

PROJECT DETAILS:
{chr(10).join([f"- {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f} | Status: {p.get('status', 'Unknown')} | Portfolio: {p.get('portfolio', 'Unknown')} | Program: {p.get('program', 'Unknown')}" for p in data_context.projects[:10]])}
{f"... and {len(data_context.projects) - 10} more projects" if len(data_context.projects) > 10 else ""}

TIMELINE DATA:
{chr(10).join([f"- {t.get('project', 'Unknown')}: {t.get('start', 'N/A')} to {t.get('end', 'N/A')} | Status: {t.get('status', 'Unknown')}" for t in data_context.timelines[:5]])}
{f"... and {len(data_context.timelines) - 5} more timelines" if len(data_context.timelines) > 5 else ""}

DEPENDENCIES:
{chr(10).join([f"- {d.get('source', 'Unknown')} → {d.get('target', 'Unknown')}" for d in data_context.dependencies[:5]])}
{f"... and {len(data_context.dependencies) - 5} more dependencies" if len(data_context.dependencies) > 5 else ""}

RESPONSE GUIDELINES:
1. Answer the user's specific query directly and concisely
2. Provide 2-3 key insights with specific numbers from the data
3. Give 2-3 actionable recommendations
4. Keep the main response under 150 words
5. Focus on practical portfolio management actions
6. Use bullet points for clarity

Analyze the data and respond to: {query}"""

    try:
        # Create messages for the LLM
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"User Query: {query}\n\nPlease analyze this portfolio data and provide insights.")
        ]
        
        # Get response from LLM
        response = llm.invoke(messages)
        llm_response = response.content
        
        # Parse LLM response and extract insights
        # Try to extract insights and recommendations from the response
        response_lines = llm_response.split('\n')
        insights = []
        recommendations = []
        
        for line in response_lines:
            line = line.strip()
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                if any(keyword in line.lower() for keyword in ['insight', 'finding', 'discovery']):
                    insights.append(line)
                elif any(keyword in line.lower() for keyword in ['recommend', 'action', 'step', 'should']):
                    recommendations.append(line)
        
        # If no structured insights/recommendations found, use the whole response
        if not insights:
            insights = [llm_response]
        if not recommendations:
            recommendations = ["Review the insights above for specific recommendations"]
        
        return QueryResponse(
            response=llm_response,
            insights=insights,
            recommendations=recommendations,
            data_summary=data_summary,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"LLM error: {e}")
        # Fallback to template-based response
        return generate_template_response(query, data_context)

# Ollama-based response system
def generate_ollama_response(query: str, data_context: PortfolioData) -> QueryResponse:
    """Generate responses using Ollama local model"""
    
    # Format data for Ollama consumption
    data_summary = {
        "portfolios": len(data_context.portfolios),
        "programs": len(data_context.programs),
        "projects": len(data_context.projects),
        "total_budget": sum(item.get('value', 0) for item in data_context.projects),
        "statuses": list(set(item.get('status', 'Unknown') for item in data_context.projects))
    }
    
    # Create detailed system prompt for Ollama
    system_prompt = f"""You are a Portfolio Data Analyst Assistant. Your role is to provide concise, actionable insights for portfolio managers.

AVAILABLE DATA:
- PORTFOLIOS: {data_summary['portfolios']} portfolios
- PROGRAMS: {data_summary['programs']} programs  
- PROJECTS: {data_summary['projects']} projects
- TOTAL BUDGET: ${data_summary['total_budget']:,.0f}
- PROJECT STATUSES: {', '.join(data_summary['statuses'])}

PORTFOLIO DETAILS:
{chr(10).join([f"- {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f}" for p in data_context.portfolios])}

PROJECT DETAILS:
{chr(10).join([f"- {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f} | Status: {p.get('status', 'Unknown')} | Portfolio: {p.get('portfolio', 'Unknown')}" for p in data_context.projects[:10]])}

RESPONSE GUIDELINES:
1. Answer the user's specific query directly and concisely
2. Provide 2-3 key insights with specific numbers from the data
3. Give 2-3 actionable recommendations
4. Keep the main response under 150 words
5. Focus on practical portfolio management actions
6. Use bullet points for clarity

Analyze the data and respond to: {query}"""

    try:
        # Get response from Ollama
        response = ollama.chat(
            model='llama2:7b',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': f"User Query: {query}\n\nPlease analyze this portfolio data and provide insights."}
            ]
        )
        
        ollama_response = response.message.content if hasattr(response, 'message') else str(response)
        
        # Parse Ollama response and extract insights
        # Try to extract insights and recommendations from the response
        response_lines = ollama_response.split('\n')
        insights = []
        recommendations = []
        
        for line in response_lines:
            line = line.strip()
            if line.startswith('•') or line.startswith('-') or line.startswith('*'):
                if any(keyword in line.lower() for keyword in ['insight', 'finding', 'discovery']):
                    insights.append(line)
                elif any(keyword in line.lower() for keyword in ['recommend', 'action', 'step', 'should']):
                    recommendations.append(line)
        
        # If no structured insights/recommendations found, use the whole response
        if not insights:
            insights = [ollama_response]
        if not recommendations:
            recommendations = ["Review the insights above for specific recommendations"]
        
        return QueryResponse(
            response=ollama_response,
            insights=insights,
            recommendations=recommendations,
            data_summary=data_summary,
            timestamp=datetime.now().isoformat()
        )
        
    except Exception as e:
        print(f"Ollama error: {e}")
        # Fallback to template-based response
        return generate_template_response(query, data_context)

@app.get("/")
async def root():
    return {"message": "Portfolio Dashboard LLM API", "status": "running"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "llm_status": {
            "ollama_available": use_ollama,
            "openai_available": use_openai,
            "template_system": True
        },
        "data_models": {
            "PortfolioData": "Available",
            "QueryRequest": "Available", 
            "QueryResponse": "Available"
        }
    }

@app.post("/api/llm/query", response_model=QueryResponse)
async def query_llm(request: QueryRequest):
    """Main endpoint for LLM queries about portfolio data"""
    
    try:
        # Log the incoming request for debugging
        print(f"Processing query: {request.query}")
        print(f"Data context: {len(request.data_context.projects)} projects, {len(request.data_context.portfolios)} portfolios, {len(request.data_context.programs)} programs")
        
        # Validate data context
        if not request.data_context.projects:
            print("Warning: No projects in data context")
        
        if not request.data_context.portfolios:
            print("Warning: No portfolios in data context")
        
        # Generate response based on available LLM
        if use_ollama:
            print("Using Ollama local model for response generation")
            response = generate_ollama_response(request.query, request.data_context)
        elif use_openai:
            print("Using OpenAI LLM for response generation")
            response = generate_llm_response(request.query, request.data_context)
        else:
            print("Using template-based response system")
            response = generate_template_response(request.query, request.data_context)
        
        print(f"Response generated successfully with {len(response.insights)} insights and {len(response.recommendations)} recommendations")
        return response
        
    except Exception as e:
        print(f"Error processing query: {str(e)}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing query: {str(e)}")

@app.get("/api/models/available")
async def get_available_models():
    """Get information about available LLM models"""
    return {
        "ollama_available": use_ollama,
        "openai_available": use_openai,
        "template_system": True,
        "models": {
            "ollama": "llama2:7b" if use_ollama else "not_configured",
            "openai": "gpt-3.5-turbo" if use_openai else "not_configured",
            "template": "data_analysis_templates"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
