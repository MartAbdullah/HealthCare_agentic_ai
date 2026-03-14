# Healthcare Agentic AI — v2.0

A unified healthcare AI platform featuring three specialized medical agents integrated into a single FastAPI backend and React frontend. This system demonstrates advanced agentic AI concepts through practical healthcare use cases.

**Version:** 2.0 (Reorganized)  
**Status:** Production Ready  

---

## System Overview

### Architecture
```
┌─────────────────────────────────────────────┐
│         React Frontend (general_ui/)         │
│  Patient Intake | Specialist Consultation   │
│    Clinical Document Processing              │
└──────────────────┬──────────────────────────┘
                   │ HTTP/REST
                   ▼
┌─────────────────────────────────────────────┐
│   Unified FastAPI Backend (general_api/)     │
│  • Patient Intake Agent (Reflection Loop)   │
│  • Specialist Consultation Agent (Parallel) │
│  • Clinical Document Agent (Pipeline+HiL)  │
└─────────────────────────────────────────────┘
```

---

### Project Focus & Scope

> **This project prioritizes mastering Agentic AI working principles over production infrastructure.**
> 
> The focus is on **agent design patterns** (reflection loops, parallel fan-out, human-in-the-loop)
> and **LLM integration** rather than enterprise-grade features. Therefore, database connections 
> and persistent server infrastructure are intentionally omitted. This allows you to concentrate 
> on the core concepts: state management, conditional routing, multi-agent coordination, and 
> human approval workflows—without the distraction of database schemas, migrations, or deployment 
> complexity. Once you master these agentic patterns, scaling to production with databases, 
> authentication, and microservices becomes straightforward.

---

## What You Will Learn

### Agentic AI Concepts
- **Reflection Loops**: Generator and Critic nodes that iteratively improve output (Patient Intake Agent)
- **Supervisor + Parallel Fan-Out**: LLM-driven routing and concurrent specialist analysis (Specialist Consultancy Agent)
- **Sequential Pipelines with Human-in-the-Loop**: Multi-phase workflows with interrupt checkpoints for human review (Clinical Document Agent)
- **State Management**: How state flows through multi-node graphs and how to use operators to accumulate results
- **Conditional Routing**: Dynamic decision-making at runtime based on LLM output

### Core Technologies
- **LangGraph**: Building stateful multi-agent graphs with complex control flow
- **FastAPI**: Unified backend API serving multiple agents
- **React + TypeScript**: Modern frontend with centralized API configuration
- **LiteLLM**: Provider-agnostic LLM access (OpenAI, Claude, local models, etc.)
- **Pydantic**: Robust structured output validation from LLMs

### Healthcare Domain Knowledge
- **ICD-10-CM Coding**: How medical conditions are standardized and coded
- **RxNorm (RxCUI)**: Medication standardization and drug coding
- **SOAP Notes**: Clinical documentation structure (Subjective, Objective, Assessment, Plan)
- **Clinical Workflow**: Why human review gates are essential for safety and accuracy

---

## The Three Agents

### 1. **Patient Intake Agent** (Basic)
**Pattern:** Reflection Loop (Generator → Critic)

Entry point for patient symptoms.  

**Flow:**
1. **Generator Node**: Takes patient symptom description, drafts a medical summary
2. **Critic Node**: Reviews the draft for:
   - No explicit diagnoses (only differential considerations)
   - Professional clinical tone
   - No hallucinated facts
3. **Loop**: If rejected, Generator refines based on Critic feedback (max 5 iterations)
4. **Output**: Approved summary with revision history

**API Endpoint:** `POST /basic/analyze`
```json
{
  "text": "Patient presents with chest pain and shortness of breath..."
}
```

---

### 2. **Specialist Consultancy Agent** (Intermediate)
**Pattern:** Supervisor + Parallel Fan-Out + Aggregator

Medical case routed to multiple specialists simultaneously.

**Flow:**
1. **Supervisor Node**: LLM reads case, selects top_k relevant specialists from pool of 20
2. **Parallel Specialist Nodes**: All selected specialists analyze the case simultaneously via `Send` API
3. **Aggregator Node**: Synthesizes all assessments into:
   - Consensus findings
   - Areas of divergence
   - Prioritized management plan

**API Endpoint:** `POST /intermediate/analyze`
```json
{
  "case": "56-year-old patient with elevated troponin...",
  "top_k": 5
}
```

**Specialist Pool:** Cardiologist, Neurologist, Pulmonologist, Gastroenterologist, Rheumatologist, etc.

---

### 3. **Clinical Document Agent** (Advanced)
**Pattern:** Sequential Pipeline + Human-in-the-Loop

Multi-phase document processing with human approval gate.

**Flow:**
1. **Condition Extractor**: Extracts conditions from clinical documents
2. **Medication Extractor**: Extracts medications with dosage and route
3. **Condition Coder**: Assigns ICD-10-CM codes
4. **Medication Coder**: Assigns RxNorm codes
5. **SOAP Drafter**: Generates draft SOAP note
6. **Human Review Gate**: Workflow pauses; clinician reviews and edits SOAP note in UI
7. **Finalization**: After approval, final signed SOAP note is created

**API Endpoints:**
- `POST /advanced/upload` - Upload and process documents
- `POST /advanced/approve` - Approve SOAP note after human review
- `GET /advanced/files` - List available documents

---

## Project Repository Structure

```
HealthCare_agentic_ai/
├── general_api/                          # Unified FastAPI backend
│   ├── main.py                           # FastAPI server with all three agents
│   ├── patient_intake_agent.py           # Basic Agent
│   ├── specialist_consultancy_agent.py   # Intermediate Agent
│   ├── medical_document_agent.py         # Advanced Agent
│   ├── tools.py                          # Shared utilities and tools
│   ├── requirements.txt                  # Python dependencies
│   ├── data/                             # Document storage
│   └── .env                              # Environment configuration
│
├── general_ui/                           # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── PatientIntakePage.tsx     # Basic Agent UI
│   │   │   ├── SpecialistConsultationPage.tsx  # Intermediate Agent UI
│   │   │   ├── ClinicalDocumentPage.tsx        # Advanced Agent UI
│   │   │   ├── HomePage.tsx              # Landing page
│   │   │   └── ...
│   │   ├── components/                   # Shared UI components
│   │   ├── config/
│   │   │   └── api.ts                    # Centralized API configuration
│   │   └── App.tsx                       # Main routing
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.local                        # Frontend environment
│
├── Archive/                              # Previous single-project implementations
│   ├── 01_basic_agent/
│   ├── 02_intermediate_agent/
│   └── 03_advanced_agent/
│
├── REORGANIZATION.md                     # Detailed v2.0 migration guide
└── README.md                             # This file
```

---

## Quick Start

### Prerequisites
- Python 3.10+
- Node.js 16+
- pip and npm
- LLM API keys (OpenAI, Anthropic, or compatible)

### Backend Setup

```bash
# Navigate to backend
cd general_api

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
copy .env.example .env
# Edit .env with your LLM API keys and model preferences

# Start API server
python main.py
# API will be available at http://localhost:8001
```

### Frontend Setup

```bash
# Navigate to frontend
cd general_ui

# Install dependencies
npm install

# Configure API endpoint
echo "REACT_APP_API_URL=http://localhost:8001" > .env.local

# Start development server
npm start
# UI will open at http://localhost:3000
```

### Verify Setup

- **API Health:** `curl http://localhost:8001/health`
- **API Docs:** Open http://localhost:8001/docs in browser
- **Frontend:** Open http://localhost:3000 in browser

---

## API Reference Summary

### Health Checks
```
GET /health                    # Global health
GET /basic/health             # Patient Intake Agent health
GET /intermediate/health      # Specialist Consultancy health
GET /advanced/health          # Clinical Document Agent health
```

### Patient Intake Agent (Basic)
```
POST /basic/analyze
Body: { "text": "patient symptoms..." }
Response: { "final_summary": "...", "history": [...] }
```

### Specialist Consultancy Agent (Intermediate)
```
POST /intermediate/analyze
Body: { "case": "medical case...", "top_k": 5 }
Response: {
  "case_summary": "...",
  "specialist_assessments": [...],
  "unified_summary": "...",
  "specialists_count": 5
}
```

### Clinical Document Agent (Advanced)
```
GET /advanced/files                                # List documents
POST /advanced/upload                              # Upload and process
POST /advanced/process-storage                     # Process from storage
POST /advanced/approve                             # Approve SOAP note
Body (approve): { "thread_id": "...", "updated_soap": "..." }
```

For complete details, visit `http://localhost:8001/docs` (Swagger UI).

---

## Key Features

### 1. Unified API Gateway
- Single FastAPI server serves all three agents
- Consistent error handling and response formats
- Built-in async/await for concurrent requests
- Swagger documentation auto-generated

### 2. Centralized Frontend Configuration
- All API endpoints defined in one place (`src/config/api.ts`)
- No hardcoded URLs scattered across components
- Easy to switch between development/production

### 3. Agent Isolation with Shared Infrastructure
- Each agent maintains independent logic
- Common tools and utilities in `tools.py`
- Shared LLM configuration via environment variables
- Clean separation of concerns

### 4. Human-in-the-Loop for Advanced Agent
- Workflow pauses at checkpoint for human review
- Clinician can edit intermediate results
- Edited content preserved in final output
- Audit trail of approvals and changes

---

## Development Workflow

### Running Complete System

```bash
# Terminal 1 - Backend
cd general_api
source venv/bin/activate  # or: venv\Scripts\activate on Windows
python main.py

# Terminal 2 - Frontend
cd general_ui
npm start
```

### Making Changes

**Backend:**
```bash
# Edit agent code in general_api/
# Restart API: Ctrl+C and python main.py again
# Check logs in terminal
# API docs auto-update at /docs
```

**Frontend:**
```bash
# Edit React components
# Hot-reload automatically applies changes
# Check console in browser DevTools (F12)
```

### Debugging

- **Backend Logs:** Check terminal running `python main.py`
- **API Docs:** Visit `http://localhost:8001/docs`
- **Browser Console:** Open DevTools (F12) → Console tab
- **Network Monitoring:** DevTools → Network tab to see API calls

---

## Environment Variables

### Backend (.env in general_api/)
```bash
# LLM Configuration
LLM_MODEL=gpt-4  # or claude-3-sonnet, etc.
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Server Configuration
API_HOST=0.0.0.0
API_PORT=8001
DEBUG=false

# Data Storage
DATA_DIR=/app/data
```

### Frontend (.env.local in general_ui/)
```bash
REACT_APP_API_URL=http://localhost:8001
```

---

## Common Issues & Troubleshooting

| Issue | Cause | Solution |
|---|---|---|
| `Connection refused on port 8001` | Backend not running | Start backend: `cd general_api && python main.py` |
| `CORS error in browser` | Backend CORS not configured | Ensure `fastapi.middleware.cors.CORSMiddleware` is added in main.py |
| `ModuleNotFoundError` | Missing Python dependencies | `cd general_api && pip install -r requirements.txt` |
| `API returns 401/403` | LLM API key invalid or expired | Check `.env` file, verify API key with provider |
| `Frontend shows loading spinner forever` | API unreachable or slow | Check browser Network tab, verify `REACT_APP_API_URL` |
| `SOAP note doesn't pause for approval` | Missing `interrupt_after` in graph | Verify graph compilation includes `interrupt_after=["saga_drafter"]` |

---

## Architecture Decisions

### Why Unified API?
- **Simplicity:** Single endpoint for all agent functionality
- **Scalability:** Easier to add more agents or features
- **Maintenance:** Centralized configuration and logging
- **Consistency:** Same error handling and response format

### Why React + TypeScript?
- **Type Safety:** Catch errors at compile time
- **Developer Experience:** IntelliSense and refactoring support
- **Component Reusability:** Shared Navbar, Sidebar, Footer components
- **Modern Tooling:** Hot-reload, testing frameworks, bundle optimization

### Why LangGraph?
- **State Management:** Explicit state handling for complex workflows
- **Interrupts:** Built-in human-in-the-loop support
- **Composition:** Easy to combine agents into larger systems
- **Testing:** Deterministic playback and inspection

---

## Migration from Single-Project Structure

**Note:** Original single-project implementations are preserved in the `Archive/` folder for reference:
- `Archive/01_basic_agent/` - Original basic agent project
- `Archive/02_intermediate_agent/` - Original intermediate agent project
- `Archive/03_advanced_agent/` - Original advanced agent project

See [REORGANIZATION.md](REORGANIZATION.md) for detailed migration guide.

---

## Learning Outcomes

After working through this system, you will understand:

1. **How to design stateful multi-agent workflows** using LangGraph
2. **How to build a production-grade API** with FastAPI
3. **How to create a modern frontend** with React and TypeScript
4. **How to safely integrate LLMs** into healthcare workflows
5. **How to implement human-in-the-loop** approval processes
6. **How to handle parallel execution** with `Send` API
7. **How to structure code** for maintainability and testing

---

## Next Steps

### For Learning
1. Read through each agent implementation in `general_api/`
2. Trace the data flow from API endpoint to LLM to frontend
3. Modify prompts in agents and observe output changes
4. Add new specialists to the Specialist Consultancy Agent
5. Implement new coding systems (beyond ICD-10 and RxNorm)

### For Production
1. Add database for persistent storage
2. Implement user authentication and authorization
3. Set up monitoring, logging, and alerting
4. Add rate limiting and request validation
5. Containerize with Docker and deploy to cloud
6. Set up CI/CD pipeline

---

## Support & Resources

- **API Documentation:** `http://localhost:8001/docs` (Swagger)
- **ReDoc:** `http://localhost:8001/redoc` (Alternative docs)
- **Frontend Code:** Well-commented source in `general_ui/src/`
- **Backend Code:** Docstrings in `general_api/`
- **Migration Guide:** [REORGANIZATION.md](REORGANIZATION.md)

---

## License

See [LICENSE](LICENSE) file for details.

---

**Last Updated:** March 2026  
**Maintainer:** Healthcare AI Team  
**Status:** Active Development

