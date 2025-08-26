# Setup & Installation Guide - Portfolio Dashboard

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Installation](#detailed-installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)
7. [Development Setup](#development-setup)
8. [Production Deployment](#production-deployment)

---

## Prerequisites

### System Requirements
- **Operating System**: Windows 10+, macOS 10.14+, or Ubuntu 18.04+
- **Memory**: Minimum 4GB RAM, Recommended 8GB+
- **Storage**: Minimum 2GB free space
- **Network**: Internet connection for initial setup and dependencies

### Required Software
- **Node.js**: Version 16.0.0 or higher
- **Python**: Version 3.8 or higher
- **Git**: Version 2.20 or higher
- **npm**: Usually comes with Node.js

### Optional Software
- **Ollama**: For local LLM processing (recommended)
- **PostgreSQL/MySQL**: For production database (optional)
- **Redis**: For caching (optional)

---

## Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/NandhuRajRK/R-D-Analytics-Hub.git
cd R-D-Analytics-Hub
```

### 2. Start Frontend (React)
```bash
cd dashboard
npm install
npm start
```
Frontend will be available at: `http://localhost:3000`

### 3. Start Backend (FastAPI)
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```
Backend will be available at: `http://localhost:8000`

---

## Detailed Installation

### Step 1: Install Node.js and npm

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer and follow the setup wizard
3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### macOS
```bash
# Using Homebrew
brew install node

# Or download from nodejs.org
```

#### Ubuntu/Debian
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### Step 2: Install Python

#### Windows
1. Download Python from [python.org](https://python.org/)
2. Run installer with "Add to PATH" checked
3. Verify installation:
   ```bash
   python --version
   pip --version
   ```

#### macOS
```bash
# Using Homebrew
brew install python

# Or download from python.org
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

### Step 3: Install Git

#### Windows
1. Download Git from [git-scm.com](https://git-scm.com/)
2. Run installer with default settings
3. Verify installation:
   ```bash
   git --version
   ```

#### macOS
```bash
# Using Homebrew
brew install git

# Or download from git-scm.com
```

#### Ubuntu/Debian
```bash
sudo apt install git
```

### Step 4: Clone and Setup Project

```bash
# Clone the repository
git clone https://github.com/NandhuRajRK/R-D-Analytics-Hub.git
cd R-D-Analytics-Hub

# Verify the structure
ls -la
```

Expected structure:
```
R-D-Analytics-Hub/
├── backend/
├── dashboard/
├── README.md
└── .gitignore
```

---

## Configuration

### Frontend Configuration

#### Environment Variables (Optional)
Create `dashboard/.env` file:
```bash
# React environment variables
REACT_APP_API_URL=http://localhost:8000
REACT_APP_ENVIRONMENT=development
```

#### Package Configuration
The `dashboard/package.json` contains all necessary dependencies:
- React 18
- React Router
- Chart libraries
- Export utilities

### Backend Configuration

#### Environment Variables
Create `backend/.env` file:
```bash
# OpenAI API (optional)
OPENAI_API_KEY=your_openai_api_key_here

# Ollama Configuration (optional)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama2:7b

# Server Configuration
HOST=0.0.0.0
PORT=8000
LOG_LEVEL=INFO

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001
```

#### Python Dependencies
The `backend/requirements.txt` contains:
```
fastapi==0.104.1
uvicorn==0.24.0
langchain==0.0.350
langchain-community==0.0.10
ollama==0.1.7
python-dotenv==1.0.0
pydantic==2.5.0
```

### Ollama Setup (Optional but Recommended)

#### Install Ollama
```bash
# macOS/Linux
curl -fsSL https://ollama.ai/install.sh | sh

# Windows
# Download from https://ollama.ai/download
```

#### Download Models
```bash
# Start Ollama service
ollama serve

# In another terminal, download a model
ollama pull llama2:7b
```

#### Verify Installation
```bash
ollama list
```

---

## Running the Application

### Development Mode

#### 1. Start Frontend
```bash
cd dashboard
npm install          # First time only
npm start
```

**Expected Output**:
```
Compiled successfully!

You can now view portfolio-dashboard in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://192.168.1.100:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

#### 2. Start Backend
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python main.py
```

**Expected Output**:
```
🔍 Testing Ollama connection...
📋 Ollama response: <ollama.models.Models object at 0x...>
✅ Using Ollama local model: llama2:7b
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Production Mode

#### Frontend Build
```bash
cd dashboard
npm run build
```

#### Backend Production
```bash
cd backend
pip install gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

---

## Troubleshooting

### Common Issues

#### 1. Port Already in Use

**Frontend (Port 3000)**:
```bash
# Kill process using port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

**Backend (Port 8000)**:
```bash
# Kill process using port 8000
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:8000 | xargs kill -9
```

#### 2. Node.js/npm Issues

**Clear npm cache**:
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Update npm**:
```bash
npm install -g npm@latest
```

#### 3. Python Issues

**Virtual Environment**:
```bash
# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# Verify
which python
pip list
```

**Reinstall Dependencies**:
```bash
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

#### 4. Ollama Issues

**Check Ollama Service**:
```bash
ollama serve
```

**Verify Models**:
```bash
ollama list
```

**Test Connection**:
```bash
curl http://localhost:11434/api/tags
```

#### 5. CORS Issues

**Check Backend CORS Configuration**:
```python
# In backend/main.py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 6. Data Loading Issues

**Check File Paths**:
```bash
# Verify CSV files exist
ls dashboard/public/data/
```

**Check Browser Console**:
- Open Developer Tools (F12)
- Check Console tab for errors
- Check Network tab for failed requests

### Performance Issues

#### Frontend Performance
```bash
# Build analysis
npm run build
npm install -g serve
serve -s build
```

#### Backend Performance
```bash
# Monitor memory usage
# Windows
tasklist /FI "IMAGENAME eq python.exe"

# macOS/Linux
ps aux | grep python
```

---

## Development Setup

### Code Editor Setup

#### VS Code (Recommended)
1. Install VS Code
2. Install extensions:
   - Python
   - JavaScript and TypeScript
   - React Developer Tools
   - GitLens
   - Prettier

#### Project Structure
```
portfolio-dashboard/
├── .vscode/              # VS Code settings
├── backend/              # Python backend
├── dashboard/            # React frontend
├── docs/                 # Documentation
└── scripts/              # Build/deployment scripts
```

### Development Workflow

#### 1. Feature Development
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# Test changes

# Commit and push
git add .
git commit -m "Add new feature"
git push origin feature/new-feature
```

#### 2. Testing
```bash
# Frontend tests
cd dashboard
npm test

# Backend tests
cd backend
python -m pytest
```

#### 3. Code Quality
```bash
# Frontend linting
cd dashboard
npm run lint

# Backend formatting
cd backend
pip install black
black .
```

### Debugging

#### Frontend Debugging
```javascript
// Add console logs
console.log('Data:', data);

// Use React Developer Tools
// Use browser DevTools
```

#### Backend Debugging
```python
# Add print statements
print(f"Processing query: {query}")

# Use Python debugger
import pdb; pdb.set_trace()
```

---

## Production Deployment

### Frontend Deployment

#### 1. Build Production Version
```bash
cd dashboard
npm run build
```

#### 2. Deploy to Web Server
```bash
# Copy build folder to web server
cp -r build/ /var/www/portfolio-dashboard/

# Configure web server (Nginx example)
sudo nano /etc/nginx/sites-available/portfolio-dashboard
```

#### 3. Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/portfolio-dashboard;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Backend Deployment

#### 1. Production Dependencies
```bash
cd backend
pip install gunicorn uvicorn[standard]
```

#### 2. Systemd Service
```bash
sudo nano /etc/systemd/system/portfolio-dashboard.service
```

```ini
[Unit]
Description=Portfolio Dashboard Backend
After=network.target

[Service]
User=www-data
WorkingDirectory=/path/to/portfolio-dashboard/backend
Environment=PATH=/path/to/portfolio-dashboard/backend/venv/bin
ExecStart=/path/to/portfolio-dashboard/backend/venv/bin/gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

#### 3. Start Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable portfolio-dashboard
sudo systemctl start portfolio-dashboard
```

### Environment Configuration

#### Production Environment Variables
```bash
# /etc/environment or .env file
OPENAI_API_KEY=your_production_key
OLLAMA_HOST=http://localhost:11434
LOG_LEVEL=WARNING
ALLOWED_ORIGINS=https://your-domain.com
```

#### SSL Configuration
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com
```

### Monitoring and Logging

#### Log Management
```bash
# View logs
sudo journalctl -u portfolio-dashboard -f

# Log rotation
sudo nano /etc/logrotate.d/portfolio-dashboard
```

#### Performance Monitoring
```bash
# Monitor system resources
htop
iotop
nethogs
```

---

## Support and Resources

### Documentation
- [Project Documentation](./PROJECT_DOCUMENTATION.md)
- [Component Documentation](./COMPONENT_DOCUMENTATION.md)
- [API Documentation](./API_DOCUMENTATION.md)

### Community Resources
- [React Documentation](https://reactjs.org/docs/)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Ollama Documentation](https://ollama.ai/docs)

### Getting Help
1. Check the troubleshooting section above
2. Review the documentation files
3. Check GitHub issues
4. Create a new issue with detailed information

---

**Last Updated**: December 2024
**Version**: 1.0.0
**Maintainer**: Development Team
