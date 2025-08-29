import React, { useState, useEffect, useRef } from 'react';
import './DataAssistant.css';

const DataAssistant = ({ projects, selectedPortfolio, selectedStatuses }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [suggestedQueries] = useState([
    'Which portfolio has the highest budget utilization?',
    'Show me projects at risk and their dependencies',
    "What's the budget distribution across different project statuses?",
    'Identify potential resource conflicts in the next quarter',
    'Which programs are performing best?',
    "What's the overall portfolio health status?",
    'Show me delayed projects and their impact',
    'Analyze budget allocation efficiency',
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  // Prepare data context for LLM
  const prepareDataContext = () => {
    const filteredProjects = projects.filter(project => {
      if (selectedPortfolio && project.portfolio !== selectedPortfolio) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.status)) return false;

      return true;
    });

    // Extract portfolios, programs, and projects
    const portfolios = [...new Set(filteredProjects.map(p => p.portfolio))].map(name => ({
      id: name,
      name,
      value: filteredProjects.filter(p => p.portfolio === name).reduce((sum, p) => sum + (p.budget || 0), 0),
    }));

    const programs = [...new Set(filteredProjects.map(p => p.program))].map(name => ({
      id: name,
      name,
      value: filteredProjects.filter(p => p.program === name).reduce((sum, p) => sum + (p.budget || 0), 0),
    }));

    const projectData = filteredProjects.map(p => ({
      id: p.id || p.name,
      name: p.name,
      value: p.budget || 0,
      status: p.status,
      portfolio: p.portfolio,
      program: p.program,
    }));

    // Create dependencies (simplified)
    const dependencies = [];

    filteredProjects.forEach(project => {
      if (project.dependencies) {
        project.dependencies.forEach(dep => {
          dependencies.push({
            source: project.id || project.name,
            target: dep,
            type: 'dependency',
          });
        });
      }
    });

    return {
      portfolios,
      programs,
      projects: projectData,
      budgets: projectData,
      timelines: filteredProjects.map(p => ({
        project: p.id || p.name,
        start: p.startDate,
        end: p.endDate,
        status: p.status,
      })),
      dependencies,
    };
  };

  const askAssistant = async () => {
    if (!query.trim()) return;

    const userMessage = { type: 'user', content: query, timestamp: new Date() };

    setConversationHistory(prev => [...prev, userMessage]);

    setIsLoading(true);
    setQuery('');

    try {
      const dataContext = prepareDataContext();

      const response = await fetch('http://localhost:8000/api/llm/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query,
          data_context: dataContext,
          current_view: 'dashboard',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage = {
        type: 'assistant',
        content: data.response,
        insights: data.insights,
        recommendations: data.recommendations,
        data_summary: data.data_summary,
        timestamp: new Date(),
      };

      setConversationHistory(prev => [...prev, assistantMessage]);
      setResponse(data);

    } catch (error) {
      console.error('Error querying LLM:', error);

      const errorMessage = {
        type: 'assistant',
        content: 'I\'m sorry, I encountered an error while processing your query. Please try again or check if the backend server is running.',
        insights: ['Backend connection error'],
        recommendations: ['Ensure the LLM backend is running on port 8000', 'Check network connectivity'],
        data_summary: {},
        timestamp: new Date(),
      };

      setConversationHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askAssistant();
    }
  };

  const clearConversation = () => {
    setConversationHistory([]);
    setResponse(null);
  };

  const handleSuggestedQuery = (suggestedQuery) => {
    setQuery(suggestedQuery);
  };

  return (
    <div className="data-assistant">
      <div className="assistant-header">
        <div className="assistant-title">
          <span className="assistant-icon">🤖</span>
          <h3>Portfolio Data Assistant</h3>
        </div>
        <div className="assistant-actions">
          <button
            className="clear-btn"
            onClick={clearConversation}
            title="Clear conversation"
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      <div className="conversation-container">
        {conversationHistory.length === 0 ? (
          <div className="welcome-message">
            <div className="welcome-icon">👋</div>
            <h4>Welcome to your Portfolio Data Assistant!</h4>
            <p>Ask me anything about your portfolio data, budgets, project statuses, and more.</p>

            <div className="suggested-queries">
              <h5>Try asking me:</h5>
              <div className="query-chips">
                {suggestedQueries.map((suggestedQuery, index) => (
                  <button
                    className="query-chip"
                    key={index}
                    onClick={() => handleSuggestedQuery(suggestedQuery)}
                  >
                    {suggestedQuery}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="conversation-messages">
            {conversationHistory.map((message, index) => (
              <div className={`message ${message.type}`} key={index}>
                <div className="message-header">
                  <span className="message-avatar">
                    {message.type === 'user' ? '👤' : '🤖'}
                  </span>
                  <span className="message-timestamp">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>

                <div className="message-content">
                  {message.content}
                </div>

                {message.type === 'assistant' && message.insights && (
                  <div className="message-insights">
                    <h5>💡 Key Insights:</h5>
                    <ul>
                      {message.insights.map((insight, i) => (
                        <li key={i}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.type === 'assistant' && message.recommendations && (
                  <div className="message-recommendations">
                    <h5>🚀 Recommendations:</h5>
                    <ul>
                      {message.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {message.type === 'assistant' && message.data_summary && Object.keys(message.data_summary).length > 0 && (
                  <div className="message-summary">
                    <h5>📊 Data Summary:</h5>
                    <div className="summary-grid">
                      {Object.entries(message.data_summary).map(([key, value]) => (
                        <div className="summary-item" key={key}>
                          <span className="summary-label">{key.replace(/_/g, ' ').toUpperCase()}:</span>
                          <span className="summary-value">
                            {typeof value === 'number' ? value.toLocaleString() : JSON.stringify(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="message assistant loading">
                <div className="message-header">
                  <span className="message-avatar">🤖</span>
                  <span className="message-timestamp">Now</span>
                </div>
                <div className="message-content">
                  <div className="loading-indicator">
                    <div className="loading-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    Analyzing your data...
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="query-input-container">
        <div className="query-input-wrapper">
          <textarea
            className="query-input"
            disabled={isLoading}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about your portfolio data..."
            rows={2}
            value={query}
          />
          <button
            className="ask-btn"
            disabled={!query.trim() || isLoading}
            onClick={askAssistant}
          >
            {isLoading ? 'Analyzing...' : 'Ask Assistant'}
          </button>
        </div>

        <div className="input-hint">
          💡 Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default DataAssistant;
