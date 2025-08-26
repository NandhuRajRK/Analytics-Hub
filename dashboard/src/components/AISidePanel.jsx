import React, { useState, useEffect, useRef } from 'react';
import './AISidePanel.css';

const AISidePanel = ({ isOpen, onClose, projects, selectedPortfolio, selectedStatuses }) => {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [suggestedQueries] = useState([
    "Which portfolio has the highest budget utilization?",
    "Show me projects at risk and their dependencies",
    "What's the budget distribution across different project statuses?",
    "Identify potential resource conflicts in the next quarter",
    "Which programs are performing best?",
    "What's the overall portfolio health status?",
    "Show me delayed projects and their impact",
    "Analyze budget allocation efficiency"
  ]);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversationHistory]);

  // Handle file uploads
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const newDocuments = [];

    try {
      for (const file of files) {
        // Check file size (limit to 10MB)
        if (file.size > 10 * 1024 * 1024) {
          alert(`File ${file.name} is too large. Maximum size is 10MB.`);
          continue;
        }

        // Check file type
        const allowedTypes = [
          'text/plain',
          'text/csv',
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (!allowedTypes.includes(file.type)) {
          alert(`File type ${file.type} is not supported.`);
          continue;
        }

        // Read file content
        const content = await readFileContent(file);
        
        const document = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          content: content,
          uploadedAt: new Date(),
          lastUsed: null
        };

        newDocuments.push(document);
      }

      setUploadedDocuments(prev => [...prev, ...newDocuments]);
      alert(`Successfully uploaded ${newDocuments.length} document(s)`);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Read file content based on file type
  const readFileContent = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          let content = e.target.result;
          
          // For text files, use as-is
          if (file.type === 'text/plain' || file.type === 'text/csv') {
            resolve(content);
          }
          // For PDFs, we'll need to extract text (simplified for now)
          else if (file.type === 'application/pdf') {
            // For now, we'll store a placeholder - in production you'd use a PDF parser
            resolve(`PDF Document: ${file.name} (Content extraction requires PDF parser library)`);
          }
          // For Office documents, we'll store a placeholder
          else if (file.type.includes('word') || file.type.includes('excel')) {
            resolve(`Office Document: ${file.name} (Content extraction requires Office parser library)`);
          }
          else {
            resolve(content);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = reject;
      
      if (file.type === 'text/plain' || file.type === 'text/csv') {
        reader.readAsText(file);
      } else {
        reader.readAsArrayBuffer(file);
      }
    });
  };

  // Remove uploaded document
  const removeDocument = (documentId) => {
    setUploadedDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };

  // Prepare data context for LLM including uploaded documents
  const prepareDataContext = () => {
    const filteredProjects = projects.filter(project => {
      if (selectedPortfolio && project.portfolio !== selectedPortfolio) return false;
      if (selectedStatuses.length > 0 && !selectedStatuses.includes(project.status)) return false;
      return true;
    });

    // Extract portfolios, programs, and projects
    const portfolios = [...new Set(filteredProjects.map(p => p.portfolio))].map(name => ({
      id: name,
      name: name,
      value: filteredProjects.filter(p => p.portfolio === name).reduce((sum, p) => sum + (p.budget || 0), 0)
    }));

    const programs = [...new Set(filteredProjects.map(p => p.program))].map(name => ({
      id: name,
      name: name,
      value: filteredProjects.filter(p => p.program === name).reduce((sum, p) => sum + (p.budget || 0), 0)
    }));

    const projectData = filteredProjects.map(p => ({
      id: p.id || p.name,
      name: p.name,
      value: p.budget || 0,
      status: p.status,
      portfolio: p.portfolio,
      program: p.program
    }));

    // Create dependencies (simplified)
    const dependencies = [];
    filteredProjects.forEach(project => {
      if (project.dependencies) {
        project.dependencies.forEach(dep => {
          dependencies.push({
            source: project.id || project.name,
            target: dep,
            type: 'dependency'
          });
        });
      }
    });

    // Prepare document context
    const documentContext = uploadedDocuments.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      content: doc.content,
      uploadedAt: doc.uploadedAt.toISOString()
    }));

    return {
      portfolios,
      programs,
      projects: projectData,
      budgets: projectData,
      timelines: filteredProjects.map(p => ({
        project: p.id || p.name,
        start: p.startDate,
        end: p.endDate,
        status: p.status
      })),
      dependencies,
      uploadedDocuments: documentContext
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
      
      // Update lastUsed timestamp for uploaded documents
      if (uploadedDocuments.length > 0) {
        setUploadedDocuments(prev => prev.map(doc => ({
          ...doc,
          lastUsed: new Date()
        })));
      }
      
      const response = await fetch('http://localhost:8000/api/llm/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query,
          data_context: dataContext,
          current_view: 'dashboard'
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
        timestamp: new Date()
      };

      setConversationHistory(prev => [...prev, assistantMessage]);
      setResponse(data);

    } catch (error) {
      console.error('Error querying LLM:', error);
      
      const errorMessage = {
        type: 'assistant',
        content: `I'm sorry, I encountered an error while processing your query. Please try again or check if the backend server is running.`,
        insights: ['Backend connection error'],
        recommendations: ['Ensure the LLM backend is running on port 8000', 'Check network connectivity'],
        data_summary: {},
        timestamp: new Date()
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

  const clearDocuments = () => {
    setUploadedDocuments([]);
  };

  const clearAll = () => {
    setConversationHistory([]);
    setResponse(null);
    setUploadedDocuments([]);
  };

  const handleSuggestedQuery = (suggestedQuery) => {
    setQuery(suggestedQuery);
  };

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.ai-side-panel')) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      {/* Backdrop */}
      {isOpen && <div className="ai-side-panel-backdrop" onClick={onClose} />}
      
      {/* Side Panel */}
      <div className={`ai-side-panel ${isOpen ? 'open' : ''}`}>
        <div className="ai-side-panel-header">
          <div className="ai-side-panel-title">
            <span className="ai-side-panel-icon">🤖</span>
            <h3>AI Assistant</h3>
          </div>
          <div className="ai-side-panel-actions">
            <button 
              className="clear-btn"
              onClick={clearConversation}
              title="Clear conversation"
            >
              💬
            </button>
            <button 
              className="clear-docs-btn"
              onClick={clearAll}
              title="Clear everything"
            >
              🗑️
            </button>
            <button 
              className="close-btn"
              onClick={onClose}
              title="Close panel"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="ai-side-panel-content">
          {/* Welcome Message */}
          {conversationHistory.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-emoji">👋</div>
              <h2>Welcome to your AI Assistant!</h2>
              <p>Ask me anything about your portfolio data, budgets, project statuses, and more.</p>
              
              <div className="suggested-questions-section">
                <label htmlFor="question-dropdown" className="suggested-questions-label">Try asking me:</label>
                <select 
                  id="question-dropdown"
                  className="question-dropdown"
                  onChange={(e) => {
                    if (e.target.value) {
                      setQuery(e.target.value);
                      e.target.value = ''; // Reset to default
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>Select a question...</option>
                  <option value="Which portfolio has the highest budget utilization?">Which portfolio has the highest budget utilization?</option>
                  <option value="Show me projects at risk and their dependencies">Show me projects at risk and their dependencies</option>
                  <option value="What's the budget distribution across different project statuses?">What's the budget distribution across different project statuses?</option>
                  <option value="Identify potential resource conflicts in the next quarter">Identify potential resource conflicts in the next quarter</option>
                  <option value="Which programs are performing best?">Which programs are performing best?</option>
                  <option value="What's the overall portfolio health status?">What's the overall portfolio health status?</option>
                  <option value="Show me delayed projects and their impact">Show me delayed projects and their impact</option>
                  <option value="Analyze budget allocation efficiency">Analyze budget allocation efficiency</option>
                </select>
              </div>
            </div>
          )}
          
          {/* Conversation Messages */}
          {conversationHistory.length > 0 && (
            <div className="conversation-messages">
              {conversationHistory.map((message, index) => (
                <div key={index} className={`message ${message.type}`}>
                  <div className="message-header">
                    <span className="message-type">
                      {message.type === 'user' ? '👤 You' : '🤖 AI Assistant'}
                    </span>
                    <span className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="message-content">
                    {message.content}
                  </div>
                </div>
              ))}
              
              {isLoading && (
                <div className="message assistant loading">
                  <div className="message-header">
                    <span className="message-type">🤖 AI Assistant</span>
                    <span className="message-time">Now</span>
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

          {/* Uploaded Documents Summary */}
          {uploadedDocuments.length > 0 && (
            <div className="documents-summary">
              <div className="documents-summary-header">
                <span className="documents-icon">📎</span>
                <span className="documents-count">{uploadedDocuments.length} document{uploadedDocuments.length !== 1 ? 's' : ''} uploaded</span>
                <button
                  className="clear-docs-btn-small"
                  onClick={clearDocuments}
                  title="Clear all documents"
                >
                  ×
                </button>
              </div>
              <div className="documents-preview">
                {uploadedDocuments.slice(0, 3).map((doc, index) => (
                  <div key={index} className="document-preview-item" title={doc.name}>
                    {doc.name}
                  </div>
                ))}
                {uploadedDocuments.length > 3 && (
                  <span className="document-preview-more">+{uploadedDocuments.length - 3} more</span>
                )}
              </div>
            </div>
          )}

          {/* Chat Input Area - Now at the bottom */}
          <div className="query-input-container">
            <div className="query-input-wrapper">
              <div className="centered-input-container">
                <div className="input-field-container">
                  {/* Hidden file input for document upload */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".txt,.csv,.pdf,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                  
                  {/* Upload button that triggers file input */}
                  <button
                    className="plus-icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    title="Upload documents"
                  >
                    {isUploading ? '📤' : '+'}
                  </button>
                  
                  <textarea
                    className="centered-query-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask anything"
                    rows={1}
                    disabled={isLoading}
                  />
                  
                  <button
                    className="send-icon-btn"
                    onClick={askAssistant}
                    disabled={!query.trim() || isLoading}
                    title="Send message"
                  >
                    {isLoading ? '⏳' : '↗️'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AISidePanel;
