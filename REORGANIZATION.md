# Healthcare Agentic AI - v2.0 Reorganization

## Overview

The Healthcare Agentic AI system has been reorganized to consolidate all three medical agents (Basic, Intermediate, Advanced) into a unified `general_api` backend and a React-based `general_ui` frontend. This replaces the previous folder structure where each agent had its own separate API and UI.

## New Architecture

### Backend Structure (`general_api/`)

```
general_api/
├── main.py                           # FastAPI server (unified entry point)
├── patient_intake_agent.py           # Basic Agent (Generator → Critic loop)
├── specialist_consultancy_agent.py   # Intermediate Agent (Multi-specialist)
├── medical_document_agent.py         # Advanced Agent (SOAP note processing)
├── requirements.txt                  # Python dependencies
├── data/                             # Storage for uploaded documents
└── .env                              # Environment variables
```

### Frontend Structure (`general_ui/`)

```
general_ui/
├── src/
│   ├── config/
│   │   └── api.ts                   # Centralized API configuration
│   ├── pages/
│   │   ├── BasicAgentPage.tsx       # Patient Intake UI
│   │   ├── IntermediateAgentPage.tsx # Specialist Consultation UI
│   │   ├── AdvancedAgentPage.tsx    # Clinical Document Processing UI
│   │   ├── HomePage.tsx              # Landing page
│   │   ├── PatientPage.tsx           # Patient portal (reference)
│   │   └── SpecialistPage.tsx        # Specialist portal (reference)
│   ├── components/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── ...
│   └── App.tsx                       # Main app with routing
├── package.json
├── tailwind.config.js
└── .env                              # Frontend environment variables
```

## API Endpoints

All endpoints are now available through a single FastAPI server on `http://localhost:8001`

### Health Check
- `GET /health` - Global health check
- `GET /basic/health` - Basic Agent health
- `GET /intermediate/health` - Intermediate Agent health
- `GET /advanced/health` - Advanced Agent health

### Basic Agent (Patient Intake - Reflection Loop)
- `POST /basic/analyze`
  - Request: `{ "text": "patient symptoms..." }`
  - Response: `{ "final_summary": "...", "history": [...] }`

### Intermediate Agent (Multi-Specialist Consultation)
- `POST /intermediate/analyze`
  - Request: `{ "case": "medical case...", "top_k": 5 }`
  - Response: `{ "case_summary": "...", "specialist_assessments": [...], "unified_summary": "...", "specialists_count": 5 }`

### Advanced Agent (Clinical Document Processing)
- `GET /advanced/files` - List available documents
  - Response: `{ "files": ["file1.pdf", "file2.txt", ...] }`

- `POST /advanced/upload` - Upload and process documents
  - Request: FormData with files
  - Response: `{ "thread_id": "...", "status": "awaiting_approval", "soap_draft": "...", "extractions": {...} }`

- `POST /advanced/process-storage` - Process documents from storage
  - Request: `{ "filenames": ["file1.pdf", "file2.txt"] }`
  - Response: Same as upload

- `POST /advanced/approve` - Approve SOAP note
  - Request: `{ "thread_id": "...", "updated_soap": "..." }`
  - Response: `{ "status": "completed", "final_soap_note": "..." }`

## Setup Instructions

### Backend Setup

1. **Navigate to general_api directory:**
   ```bash
   cd general_api
   ```

2. **Create a Python virtual environment:**
   ```bash
   python -m venv venv
   ```

3. **Activate the virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Set environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your settings (LLM keys, model selection, etc.)
   ```

6. **Start the API server:**
   ```bash
   python main.py
   ```
   Or with uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8001 --reload
   ```

### Frontend Setup

1. **Navigate to general_ui directory:**
   ```bash
   cd general_ui
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set environment variables:**
   ```bash
   echo "REACT_APP_API_URL=http://localhost:8001" > .env.local
   ```

4. **Start the development server:**
   ```bash
   npm start
   ```
   The app will open at `http://localhost:3000`

## API Configuration (Frontend)

The frontend uses a centralized API configuration file (`src/config/api.ts`):

```typescript
// API endpoints are defined in one place
import { API_ENDPOINTS } from '../config/api';

// Use in components
const response = await fetch(API_ENDPOINTS.basic.analyze, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ text: symptoms })
});
```

### Environment Variables

- `REACT_APP_API_URL` - Base URL for API (default: `http://localhost:8001`)

## Migration from Old Structure

### What Changed

| Old Structure | New Structure |
|---|---|
| `01_basic_agent/api/agent.py` | `general_api/patient_intake_agent.py` |
| `02_intermediate_agent/api/agent.py` | `general_api/specialist_consultancy_agent.py` |
| `03_advanced_agent/api/agent.py` | `general_api/medical_document_agent.py` |
| Individual UI folders | `general_ui/src/pages/` |
| Hardcoded endpoints in components | Centralized `general_ui/src/config/api.ts` |

### Agent Code Migration

Each agent's main code was extracted:
- **Patient Intake**: Generator node → Critic node loop with approval mechanism
- **Specialist Consultation**: Supervisor → Multi-specialist fan-out → Aggregator
- **Clinical Document**: Condition/medication extraction → Coding → SOAP drafting

All three agents are now imported and exposed through the unified `main.py` FastAPI server.

## Running the Complete System

### Terminal 1 - Backend
```bash
cd general_api
source venv/bin/activate  # or: venv\Scripts\activate on Windows
python main.py
```

### Terminal 2 - Frontend
```bash
cd general_ui
npm start
```

### Access the Application
- **Frontend UI**: http://localhost:3000
- **API Docs**: http://localhost:8001/docs (Swagger UI)
- **API ReDoc**: http://localhost:8001/redoc (ReDoc)

## Key Features

### 1. Unified API Gateway
- All three agents accessible through a single FastAPI server
- Consistent error handling and response formats
- Built-in health checks and monitoring

### 2. Cleaner Frontend
- Centralized API configuration eliminates hardcoded URLs
- Consistent styling with Tailwind CSS
- Shared components (Sidebar, Navbar, Footer)

### 3. Agent Integration
- Each agent maintains its original logic
- Unified state management through FastAPI
- Support for concurrent requests

### 4. Human-in-the-Loop
- Advanced Agent supports SOAP note review and approval
- Clinic checkpoint-based workflow resumption
- Editable intermediate results

## Development Notes

### Adding New Features

1. **Add API endpoint in `general_api/main.py`**:
   ```python
   @app.post("/endpoint")
   async def my_endpoint(request: MyRequest):
       # Implementation
       return MyResponse(...)
   ```

2. **Update frontend config in `general_ui/src/config/api.ts`**:
   ```typescript
   export const API_ENDPOINTS = {
       ...
       myfeature: `${API_BASE_URL}/endpoint`
   }
   ```

3. **Use in React component**:
   ```typescript
   import { API_ENDPOINTS } from '../config/api';
   const response = await fetch(API_ENDPOINTS.myfeature, {...});
   ```

### Debugging

- **Backend logs**: Check terminal where `python main.py` is running
- **API Documentation**: Visit `http://localhost:8001/docs`
- **Frontend console**: Open browser DevTools (F12)
- **Network tab**: Monitor API requests in DevTools

## Future Enhancements

- [ ] Authentication and authorization
- [ ] WebSocket support for real-time updates
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Database integration for persistent storage
- [ ] Advanced logging and monitoring
- [ ] API rate limiting
- [ ] Caching layer for frequently used operations

## Support

For issues or questions:
1. Check the API documentation at `/docs`
2. Review error messages in console/logs
3. Verify environment variables are set correctly
4. Ensure both backend and frontend are running

---

**Version**: 2.0
**Last Updated**: March 12, 2026
