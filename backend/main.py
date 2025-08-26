"""
Portfolio Dashboard Backend API

This FastAPI application provides AI-powered portfolio analysis and insights.
It integrates with multiple LLM providers (OpenAI, Ollama) and includes
a fallback template system for reliable responses.

Features:
- Portfolio data analysis and insights
- Multiple LLM provider support (OpenAI, Ollama, Template)
- Intelligent query processing
- Data validation and error handling
- CORS support for frontend integration
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import json
import os
from datetime import datetime

# LLM and AI framework imports
from langchain_community.llms import OpenAI
from langchain_community.chat_models import ChatOpenAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.schema import HumanMessage, SystemMessage
import ollama

# Initialize FastAPI application
app = FastAPI(
    title="Portfolio Dashboard LLM API", 
    version="1.0.0",
    description="AI-powered portfolio analysis and insights API"
)

# Configure CORS middleware for frontend integration
# Allows React development server to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],                     # All HTTP methods
    allow_headers=["*"],                     # All headers
)

# ============================================================================
# DATA MODELS
# ============================================================================

class PortfolioData(BaseModel):
    """
    Represents the complete portfolio structure and data
    Used for sending portfolio context to AI models
    """
    portfolios: List[Dict[str, Any]]      # Portfolio information
    programs: List[Dict[str, Any]]        # Program information  
    projects: List[Dict[str, Any]]        # Project details
    budgets: List[Dict[str, Any]]         # Budget information
    timelines: List[Dict[str, Any]]       # Timeline data
    dependencies: List[Dict[str, Any]]    # Dependency relationships
    uploadedDocuments: List[Dict[str, Any]] # Documents uploaded by the user

class QueryRequest(BaseModel):
    """
    Represents a user query with portfolio context
    Sent from frontend to backend for AI processing
    """
    query: str                           # User's natural language query
    data_context: PortfolioData          # Current portfolio data for context
    current_view: Optional[str] = "dashboard"  # Current view context

class QueryResponse(BaseModel):
    """
    Represents the AI-generated response with insights and recommendations
    Sent back to frontend after processing
    """
    response: str                         # Main response text
    insights: List[str]                   # Key insights extracted from data
    recommendations: List[str]            # Actionable recommendations
    data_summary: Dict[str, Any]         # Summary statistics and metrics
    timestamp: str                        # Response timestamp

# ============================================================================
# LLM INTEGRATION INITIALIZATION
# ============================================================================

# Initialize LLM providers with fallback strategy:
# 1. Ollama (local) - Primary choice for cost-effective processing
# 2. OpenAI - Fallback for advanced capabilities when API key available
# 3. Template System - Final fallback for reliable, rule-based responses

try:
    # First try to use Ollama local model (most cost-effective)
    try:
        print("🔍 Testing Ollama connection...")
        available_models = ollama.list()
        print(f"📋 Ollama response: {available_models}")
        
        # Check if Ollama has any models available
        if available_models and hasattr(available_models, 'models') and len(available_models.models) > 0:
            use_ollama = True
            use_openai = False
            print(f"✅ Using Ollama local model: {available_models.models[0].model}")
        else:
            use_ollama = False
            print("No Ollama models found. Checking OpenAI...")
    except Exception as e:
        # Ollama not available, log error and continue
        use_ollama = False
        print(f"Ollama not available: {e}")
        print(f"Error type: {type(e).__name__}")
        import traceback
        traceback.print_exc()
    
    # If Ollama not available, try OpenAI API
    if not use_ollama:
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if openai_api_key:
            # Initialize OpenAI Chat model with low temperature for consistent responses
            llm = ChatOpenAI(
                model_name="gpt-3.5-turbo",
                temperature=0.1,  # Low temperature for consistent, focused responses
                openai_api_key=openai_api_key
            )
            use_openai = True
            print("✅ Using OpenAI API")
        else:
            use_openai = False
            print("No OpenAI API key found.")
    
    # If neither LLM provider available, use template system
    if not use_ollama and not use_openai:
        print("Using template-based responses as fallback.")
        
except Exception as e:
    # Fallback to template system if LLM initialization fails
    print(f"Error initializing LLM: {e}")
    use_openai = False
    use_ollama = False

# ============================================================================
# TEMPLATE-BASED RESPONSE SYSTEM
# ============================================================================

def generate_template_response(query: str, data_context: PortfolioData) -> QueryResponse:
    """
    Generate intelligent responses using advanced data analysis and templates
    
    This fallback system provides reliable, rule-based responses when
    LLM providers are unavailable. It analyzes portfolio data and
    generates insights based on predefined patterns, business logic,
    and statistical analysis.
    
    Args:
        query (str): User's query string
        data_context (PortfolioData): Portfolio data for analysis
        
    Returns:
        QueryResponse: Structured response with insights and recommendations
    """
    
    # Comprehensive data analysis
    total_budget = sum(item.get('value', 0) for item in data_context.projects)
    portfolio_count = len(data_context.portfolios)
    program_count = len(data_context.programs)
    project_count = len(data_context.projects)
    
    # Advanced status analysis with percentages
    status_counts = {}
    status_percentages = {}
    for project in data_context.projects:
        status = project.get('status', 'Unknown')
        status_counts[status] = status_counts.get(status, 0) + 1
    
    for status, count in status_counts.items():
        status_percentages[status] = (count / project_count) * 100
    
    # Budget analysis by portfolio and program
    portfolio_budgets = {}
    program_budgets = {}
    for portfolio in data_context.portfolios:
        portfolio_id = portfolio.get('id', 'Unknown')
        portfolio_budgets[portfolio_id] = portfolio.get('value', 0)
    
    for program in data_context.programs:
        program_id = program.get('id', 'Unknown')
        program_budgets[program_id] = program.get('value', 0)
    
    # Timeline analysis with critical path identification
    timeline_data = {}
    overdue_projects = []
    upcoming_deadlines = []
    current_date = datetime.now()
    
    for timeline in data_context.timelines:
        if timeline.get('start') and timeline.get('end'):
            start_date = datetime.fromisoformat(timeline['start'].replace('Z', '+00:00'))
            end_date = datetime.fromisoformat(timeline['end'].replace('Z', '+00:00'))
            
            timeline_data[timeline['project']] = {
                'start': timeline['start'],
                'end': timeline['end'],
                'status': timeline['status'],
                'duration_days': (end_date - start_date).days
            }
            
            # Identify overdue and upcoming projects
            if end_date < current_date and timeline['status'] not in ['Completed', 'completed']:
                overdue_projects.append(timeline['project'])
            elif end_date > current_date and (end_date - current_date).days <= 30:
                upcoming_deadlines.append(timeline['project'])
    
    # Dependency analysis with critical path identification
    dependency_count = len(data_context.dependencies)
    dependency_map = {}
    critical_dependencies = []
    
    for dep in data_context.dependencies:
        source = dep.get('source', 'Unknown')
        target = dep.get('target', 'Unknown')
        if source not in dependency_map:
            dependency_map[source] = []
        dependency_map[source].append(target)
        
        # Identify critical dependencies (high impact)
        if len(dependency_map[source]) > 2:
            critical_dependencies.append(source)
    
    # Risk assessment
    high_risk_projects = []
    budget_overruns = []
    
    for project in data_context.projects:
        status = project.get('status', '').lower()
        if status in ['at risk', 'delayed', 'overdue']:
            high_risk_projects.append(project.get('name', 'Unknown'))
        
        # Budget analysis (if budget data available)
        budget = project.get('budget', 0)
        spent = project.get('spent', 0)
        if budget > 0 and spent > budget * 1.1:  # 10% over budget
            budget_overruns.append(project.get('name', 'Unknown'))
    
    # Generate intelligent insights based on query analysis
    query_lower = query.lower()
    insights = []
    recommendations = []
    
    # Portfolio overview insights
    insights.append(f"📊 Portfolio Scale: {portfolio_count} portfolios, {program_count} programs, {project_count} projects")
    insights.append(f"💰 Total Budget: ${total_budget:,.0f}")
    insights.append(f"📈 Project Status Distribution: {', '.join([f'{k} ({v:.1f}%)' for k, v in status_percentages.items()])}")
    
    # Query-specific analysis
    if any(word in query_lower for word in ['budget', 'cost', 'financial', 'spending']):
        insights.append(f"🏦 Portfolio Budget Allocation: {', '.join([f'{k}: ${v:,.0f}' for k, v in portfolio_budgets.items()])}")
        insights.append(f"📊 Average Project Budget: ${total_budget/project_count:,.0f}")
        
        if budget_overruns:
            insights.append(f"⚠️ Budget Overruns: {len(budget_overruns)} projects exceeding budget")
            recommendations.append("🔍 Review budget overruns and implement cost controls")
            recommendations.append("📋 Establish budget monitoring and alert systems")
        else:
            recommendations.append("✅ Budget performance is within acceptable ranges")
            recommendations.append("📊 Continue monitoring budget vs. actual spending")
    
    if any(word in query_lower for word in ['status', 'progress', 'performance']):
            delayed_count = status_counts.get('Delayed', 0)
        at_risk_count = status_counts.get('At Risk', 0)
        
        if delayed_count > 0 or at_risk_count > 0:
            insights.append(f"🚨 Risk Status: {delayed_count} delayed, {at_risk_count} at risk projects")
            recommendations.append("⚡ Prioritize delayed and at-risk projects")
            recommendations.append("🔄 Review resource allocation for struggling projects")
        else:
            insights.append("✅ All projects are on track or completed")
            recommendations.append("🎯 Maintain current performance momentum")
    
    if any(word in query_lower for word in ['portfolio', 'strategy', 'overview']):
        insights.append(f"🎯 Portfolio Distribution: {', '.join([f'{k}: {v} projects' for k, v in portfolio_budgets.items()])}")
        insights.append(f"📋 Program Breakdown: {', '.join([f'{k}: {v} projects' for k, v in program_budgets.items()])}")
        
        recommendations.append("📊 Conduct portfolio performance analysis")
        recommendations.append("⚖️ Balance resource allocation across portfolios")
    
    if any(word in query_lower for word in ['dependency', 'critical path', 'bottleneck']):
        insights.append(f"🔗 Dependencies: {dependency_count} relationships identified")
        if critical_dependencies:
            insights.append(f"⚠️ Critical Dependencies: {len(critical_dependencies)} high-impact projects")
            recommendations.append("🎯 Focus on critical dependency projects")
            recommendations.append("📋 Develop contingency plans for critical paths")
        else:
            recommendations.append("✅ Dependency complexity is manageable")
    
    if any(word in query_lower for word in ['timeline', 'schedule', 'deadline']):
        insights.append(f"⏰ Timeline Coverage: {len(timeline_data)} projects with timeline data")
        if overdue_projects:
            insights.append(f"🚨 Overdue Projects: {len(overdue_projects)} projects past deadline")
            recommendations.append("⚡ Address overdue projects immediately")
        if upcoming_deadlines:
            insights.append(f"📅 Upcoming Deadlines: {len(upcoming_deadlines)} projects due within 30 days")
            recommendations.append("📋 Prepare for upcoming project deadlines")
        
        if timeline_data:
            avg_duration = sum(t['duration_days'] for t in timeline_data.values()) / len(timeline_data)
            insights.append(f"📊 Average Project Duration: {avg_duration:.1f} days")
    
    if any(word in query_lower for word in ['risk', 'issue', 'problem']):
        risk_count = len(high_risk_projects)
        if risk_count > 0:
            insights.append(f"⚠️ High-Risk Projects: {risk_count} projects requiring attention")
            recommendations.append("🚨 Implement risk mitigation strategies")
            recommendations.append("📊 Establish regular risk assessment reviews")
        else:
            insights.append("✅ Risk levels are within acceptable ranges")
            recommendations.append("🔍 Continue proactive risk monitoring")
    
    # Default comprehensive insights if no specific keywords found
    if not insights or len(insights) < 3:
        insights.extend([
            f"📊 Portfolio Overview: {portfolio_count} portfolios, {program_count} programs, {project_count} projects",
            f"💰 Total Budget: ${total_budget:,.0f}",
            f"📈 Status Distribution: {', '.join([f'{k} ({v:.1f}%)' for k, v in status_percentages.items()])}",
            f"⏰ Timeline Data: {len(timeline_data)} projects with schedule information",
            f"🔗 Dependencies: {dependency_count} relationship mappings"
        ])
        
        recommendations.extend([
            "📊 Conduct comprehensive portfolio performance review",
            "🎯 Identify optimization opportunities across portfolios",
            "📈 Monitor key performance indicators regularly"
        ])
    
    # Generate data summary
    data_summary = {
        "portfolios": portfolio_count,
        "programs": program_count,
        "projects": project_count,
        "total_budget": total_budget,
        "statuses": list(status_counts.keys()),
        "overdue_projects": len(overdue_projects),
        "high_risk_projects": len(high_risk_projects),
        "dependencies": dependency_count,
        "timeline_coverage": len(timeline_data)
    }
    
    # Create comprehensive response
    main_response = f"""Portfolio Analysis Results:

📊 SCALE & SCOPE:
• {portfolio_count} portfolios, {program_count} programs, {project_count} projects
• Total budget: ${total_budget:,.0f}
• Status distribution: {', '.join([f'{k} ({v:.1f}%)' for k, v in status_percentages.items()])}

🔍 KEY INSIGHTS:
{chr(10).join([f"• {insight}" for insight in insights[:5]])}

💡 RECOMMENDATIONS:
{chr(10).join([f"• {rec}" for rec in recommendations[:4]])}

This analysis is based on {project_count} projects across {portfolio_count} portfolios with ${total_budget:,.0f} in total budget allocation."""
    
    return QueryResponse(
        response=main_response,
        insights=insights[:6],  # Limit to top 6 insights
        recommendations=recommendations[:4],  # Limit to top 4 recommendations
        data_summary=data_summary,
        timestamp=datetime.now().isoformat()
    )

# ============================================================================
# LLM-BASED RESPONSE SYSTEM
# ============================================================================

def generate_llm_response(query: str, data_context: PortfolioData) -> QueryResponse:
    """
    Generate responses using the LLM
    
    This system leverages the configured LLM (OpenAI or Ollama) to provide
    more sophisticated and context-aware responses. It formats the data
    and provides a detailed system prompt to the LLM.
    
    Args:
        query (str): User's query string
        data_context (PortfolioData): Portfolio data for context
        
    Returns:
        QueryResponse: Structured response with insights and recommendations
    """
    
    # Format data for LLM consumption
    data_summary = {
        "portfolios": len(data_context.portfolios),
        "programs": len(data_context.programs),
        "projects": len(data_context.projects),
        "total_budget": sum(item.get('value', 0) for item in data_context.projects),
        "statuses": list(set(item.get('status', 'Unknown') for item in data_context.projects))
    }
    
    # Create comprehensive system prompt for enhanced AI performance
    system_prompt = f"""You are an expert Portfolio Management Analyst with deep expertise in project portfolio optimization, risk assessment, and strategic planning. Your role is to provide intelligent, data-driven insights that help portfolio managers make informed decisions.

CONTEXT & EXPERTISE:
- You understand portfolio theory, project management methodologies, and business strategy
- You can identify patterns, trends, and anomalies in portfolio data
- You provide actionable recommendations based on industry best practices
- You communicate complex insights in clear, business-friendly language

AVAILABLE PORTFOLIO DATA:
📊 SCALE & SCOPE:
- Portfolios: {data_summary['portfolios']} strategic portfolios
- Programs: {data_summary['programs']} program initiatives
- Projects: {data_summary['projects']} active projects
- Total Budget: ${data_summary['total_budget']:,.0f}
- Project Statuses: {', '.join(data_summary['statuses'])}

🏗️ PORTFOLIO STRUCTURE:
{chr(10).join([f"• {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f} budget allocation" for p in data_context.portfolios])}

📈 PROGRAM BREAKDOWN:
{chr(10).join([f"• {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f} program funding" for p in data_context.programs])}

🎯 PROJECT DETAILS (Sample):
{chr(10).join([f"• {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f} | Status: {p.get('status', 'Unknown')} | Portfolio: {p.get('portfolio', 'Unknown')}" for p in data_context.projects[:10]])}
{f"... and {len(data_context.projects) - 10} more projects" if len(data_context.projects) > 10 else ""}

⏰ TIMELINE INSIGHTS:
{chr(10).join([f"• {t.get('project', 'Unknown')}: {t.get('start', 'N/A')} to {t.get('end', 'N/A')} | Status: {t.get('status', 'Unknown')}" for t in data_context.timelines[:5]])}
{f"... and {len(data_context.timelines) - 5} more timelines" if len(data_context.timelines) > 5 else ""}

🔗 DEPENDENCY RELATIONSHIPS:
{chr(10).join([f"• {d.get('source', 'Unknown')} → {d.get('target', 'Unknown')}" for d in data_context.dependencies[:5]])}
{f"... and {len(data_context.dependencies) - 5} more dependencies" if len(data_context.dependencies) > 5 else ""}

📎 UPLOADED DOCUMENTS:
{chr(10).join([f"• {doc.get('name', 'Unknown')} ({doc.get('type', 'Unknown')}): {doc.get('content', 'No content')[:200]}{'...' if len(doc.get('content', '')) > 200 else ''}" for doc in data_context.uploadedDocuments]) if data_context.uploadedDocuments else "• No additional documents uploaded"}

ANALYSIS FRAMEWORK:
1. **Data Pattern Recognition**: Identify trends, clusters, and outliers
2. **Risk Assessment**: Evaluate project risks, budget overruns, and timeline delays
3. **Resource Optimization**: Suggest portfolio rebalancing and resource reallocation
4. **Strategic Alignment**: Assess portfolio alignment with business objectives
5. **Performance Metrics**: Calculate KPIs and success indicators
6. **Document Context Integration**: Incorporate insights from uploaded documents when relevant

RESPONSE STRUCTURE:
📋 **DIRECT ANSWER**: Address the user's specific query first (2-3 sentences)
🔍 **KEY INSIGHTS**: Provide 3-4 data-driven insights with specific metrics
💡 **STRATEGIC RECOMMENDATIONS**: Offer 3-4 actionable recommendations
📊 **QUANTITATIVE SUPPORT**: Include relevant numbers, percentages, and trends
🎯 **PRIORITIZATION**: Rank recommendations by impact and feasibility
📎 **DOCUMENT INSIGHTS**: Reference relevant information from uploaded documents when applicable

COMMUNICATION STYLE:
- Use clear, professional business language
- Include specific data points and metrics
- Provide context for recommendations
- Use bullet points and structured formatting
- Keep main response under 200 words
- Focus on practical, implementable actions
- Reference uploaded documents when they provide relevant context

PORTFOLIO MANAGEMENT BEST PRACTICES:
- Balance risk vs. return across portfolios
- Consider resource constraints and dependencies
- Align with strategic business objectives
- Monitor key performance indicators
- Implement continuous improvement processes
- Leverage additional context from uploaded documents for comprehensive analysis

Now analyze the portfolio data and respond to: {query}

Remember: Be specific, data-driven, and actionable in your response. When uploaded documents provide relevant context, incorporate those insights into your analysis."""

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

# ============================================================================
# OLLAMA-BASED RESPONSE SYSTEM
# ============================================================================

def generate_ollama_response(query: str, data_context: PortfolioData) -> QueryResponse:
    """
    Generate responses using Ollama local model
    
    This system uses the Ollama local model to provide responses.
    It formats the data and provides a detailed system prompt for Ollama.
    
    Args:
        query (str): User's query string
        data_context (PortfolioData): Portfolio data for context
        
    Returns:
        QueryResponse: Structured response with insights and recommendations
    """
    
    # Format data for Ollama consumption
    data_summary = {
        "portfolios": len(data_context.portfolios),
        "programs": len(data_context.programs),
        "projects": len(data_context.projects),
        "total_budget": sum(item.get('value', 0) for item in data_context.projects),
        "statuses": list(set(item.get('status', 'Unknown') for item in data_context.projects))
    }
    
    # Create comprehensive system prompt for Ollama with enhanced AI performance
    system_prompt = f"""You are an expert Portfolio Management Analyst with deep expertise in project portfolio optimization, risk assessment, and strategic planning. Your role is to provide intelligent, data-driven insights that help portfolio managers make informed decisions.

CONTEXT & EXPERTISE:
- You understand portfolio theory, project management methodologies, and business strategy
- You can identify patterns, trends, and anomalies in portfolio data
- You provide actionable recommendations based on industry best practices
- You communicate complex insights in clear, business-friendly language

AVAILABLE PORTFOLIO DATA:
📊 SCALE & SCOPE:
- Portfolios: {data_summary['portfolios']} strategic portfolios
- Programs: {data_summary['programs']} program initiatives
- Projects: {data_summary['projects']} active projects
- Total Budget: ${data_summary['total_budget']:,.0f}
- Project Statuses: {', '.join(data_summary['statuses'])}

🏗️ PORTFOLIO STRUCTURE:
{chr(10).join([f"• {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f} budget allocation" for p in data_context.portfolios])}

🎯 PROJECT DETAILS (Sample):
{chr(10).join([f"• {p.get('name', p.get('id', 'Unknown'))}: ${p.get('value', 0):,.0f} | Status: {p.get('status', 'Unknown')} | Portfolio: {p.get('portfolio', 'Unknown')}" for p in data_context.projects[:10]])}

📎 UPLOADED DOCUMENTS:
{chr(10).join([f"• {doc.get('name', 'Unknown')} ({doc.get('type', 'Unknown')}): {doc.get('content', 'No content')[:200]}{'...' if len(doc.get('content', '')) > 200 else ''}" for doc in data_context.uploadedDocuments]) if data_context.uploadedDocuments else "• No additional documents uploaded"}

ANALYSIS FRAMEWORK:
1. **Data Pattern Recognition**: Identify trends, clusters, and outliers
2. **Risk Assessment**: Evaluate project risks, budget overruns, and timeline delays
3. **Resource Optimization**: Suggest portfolio rebalancing and resource reallocation
4. **Strategic Alignment**: Assess portfolio alignment with business objectives
5. **Performance Metrics**: Calculate KPIs and success indicators
6. **Document Context Integration**: Incorporate insights from uploaded documents when relevant

RESPONSE STRUCTURE:
📋 **DIRECT ANSWER**: Address the user's specific query first (2-3 sentences)
🔍 **KEY INSIGHTS**: Provide 3-4 data-driven insights with specific metrics
💡 **STRATEGIC RECOMMENDATIONS**: Offer 3-4 actionable recommendations
📊 **QUANTITATIVE SUPPORT**: Include relevant numbers, percentages, and trends
🎯 **PRIORITIZATION**: Rank recommendations by impact and feasibility
📎 **DOCUMENT INSIGHTS**: Reference relevant information from uploaded documents when applicable

COMMUNICATION STYLE:
- Use clear, professional business language
- Include specific data points and metrics
- Provide context for recommendations
- Use bullet points and structured formatting
- Keep main response under 200 words
- Focus on practical, implementable actions
- Reference uploaded documents when they provide relevant context

PORTFOLIO MANAGEMENT BEST PRACTICES:
- Balance risk vs. return across portfolios
- Consider resource constraints and dependencies
- Align with strategic business objectives
- Monitor key performance indicators
- Implement continuous improvement processes
- Leverage additional context from uploaded documents for comprehensive analysis

Now analyze the portfolio data and respond to: {query}

Remember: Be specific, data-driven, and actionable in your response. When uploaded documents provide relevant context, incorporate those insights into your analysis."""

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

# ============================================================================
# FastAPI Endpoints
# ============================================================================

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
    """
    Main endpoint for LLM queries about portfolio data.
    
    This endpoint processes user queries and generates responses using
    the configured LLM (Ollama, OpenAI, or Template). It validates
    the data context and handles potential errors.
    
    Args:
        request (QueryRequest): User query and portfolio data context
        
    Returns:
        QueryResponse: Structured AI response
    """
    
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
    """
    Get information about available LLM models and the system configuration.
    
    This endpoint provides a summary of which LLM providers are
    currently active and their model names.
    
    Returns:
        Dict: Information about available models and system status
    """
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
