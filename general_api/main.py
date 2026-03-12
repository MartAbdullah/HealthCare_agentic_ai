"""
Consolidated FastAPI server combining all three medical agents:
1. Basic Agent - Patient symptom analysis
2. Intermediate Agent - Multi-specialist consultation
3. Advanced Agent - Clinical document processing with SOAP notes
"""

import sys
import os
from pathlib import Path
import importlib.util

# Add agent directories to Python path
base_dir = Path(__file__).parent.parent

# Load agents by adding to sys.path dynamically
def load_agent_module(agent_path: str, module_api_dir: str):
    """Load agent module after adding its directory to sys.path."""
    sys.path.insert(0, module_api_dir)
    spec = importlib.util.spec_from_file_location("agent_temp", agent_path)
    module = importlib.util.module_from_spec(spec)
    sys.modules[spec.name] = module
    spec.loader.exec_module(module)
    sys.path.remove(module_api_dir)  # Clean up sys.path
    return module

# Load each agent
basic_api_dir = str(base_dir / "01_basic_agent" / "api")
intermediate_api_dir = str(base_dir / "02_intermediate_agent" / "api")
advanced_api_dir = str(base_dir / "03_advanced_agent" / "api")

basic_agent_module = load_agent_module(
    str(base_dir / "01_basic_agent" / "api" / "agent.py"),
    basic_api_dir
)
intermediate_agent_module = load_agent_module(
    str(base_dir / "02_intermediate_agent" / "api" / "agent.py"),
    intermediate_api_dir
)
advanced_agent_module = load_agent_module(
    str(base_dir / "03_advanced_agent" / "api" / "agent.py"),
    advanced_api_dir
)

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import csv
from pathlib import Path as PathlibPath

from PyPDF2 import PdfReader

# Extract the objects we need from each agent module
basic_graph = basic_agent_module.app
intermediate_agent = intermediate_agent_module
start_workflow = advanced_agent_module.start_workflow
update_workflow_and_resume = advanced_agent_module.update_workflow_and_resume

# Create main FastAPI app
app = FastAPI(
    title="Consolidated Medical Agents API",
    description="Multi-agent medical AI system combining basic analysis, specialist consultation, and clinical document processing",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8501", "http://127.0.0.1:3000", "*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# BASIC AGENT - Models
# ============================================================================

class BasicAnalyzeRequest(BaseModel):
    text: str

class BasicAnalyzeResponse(BaseModel):
    final_summary: str
    history: list[str]

# ============================================================================
# INTERMEDIATE AGENT - Models
# ============================================================================

class IntermediateAnalyzeRequest(BaseModel):
    case: str
    top_k: int = 5

class SpecialistAssessment(BaseModel):
    specialist: str
    assessment: str

class IntermediateAnalyzeResponse(BaseModel):
    case_summary: str
    specialist_assessments: List[SpecialistAssessment]
    unified_summary: str
    specialists_count: int

# ============================================================================
# ADVANCED AGENT - Models
# ============================================================================

class ProcessStorageRequest(BaseModel):
    """Request to process files from storage directory."""
    filenames: list[str]

class ApproveRequest(BaseModel):
    """Request to approve and finalize SOAP note."""
    thread_id: str
    updated_soap: str

class HealthResponse(BaseModel):
    """Health check response."""
    status: str

class FilesResponse(BaseModel):
    """List of available files in storage."""
    files: list[str]

# ============================================================================
# ADVANCED AGENT - Configuration
# ============================================================================

DATA_DIR = os.getenv("DATA_DIR", "./data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# ============================================================================
# ADVANCED AGENT - Text extraction helpers
# ============================================================================

def _extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file."""
    try:
        with open(file_path, 'rb') as f:
            reader = PdfReader(f)
            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Failed to read PDF: {str(e)}")

def _extract_text_from_txt(file_path: str) -> str:
    """Extract text from TXT file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    except Exception as e:
        raise ValueError(f"Failed to read TXT: {str(e)}")

def _extract_text_from_csv(file_path: str) -> str:
    """Extract text from CSV file."""
    try:
        text = ""
        with open(file_path, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            for row in reader:
                text += " | ".join(row) + "\n"
        return text
    except Exception as e:
        raise ValueError(f"Failed to read CSV: {str(e)}")

def _extract_text_from_upload(file: UploadFile) -> str:
    """Extract text from uploaded file based on extension."""
    file_ext = PathlibPath(file.filename).suffix.lower()
    
    # Read file content
    content = file.file.read()
    
    if file_ext == ".pdf":
        # For PDF, we need to save to temp file first
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, 'wb') as f:
            f.write(content)
        text = _extract_text_from_pdf(temp_path)
        os.remove(temp_path)
        return text
    elif file_ext == ".txt":
        return content.decode('utf-8')
    elif file_ext == ".csv":
        # For CSV, save to temp file
        temp_path = f"/tmp/{file.filename}"
        with open(temp_path, 'wb') as f:
            f.write(content)
        text = _extract_text_from_csv(temp_path)
        os.remove(temp_path)
        return text
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")

def _extract_text_from_path(file_path: str) -> str:
    """Extract text from file on disk based on extension."""
    if not os.path.exists(file_path):
        raise ValueError(f"File not found: {file_path}")
    
    file_ext = PathlibPath(file_path).suffix.lower()
    
    if file_ext == ".pdf":
        return _extract_text_from_pdf(file_path)
    elif file_ext == ".txt":
        return _extract_text_from_txt(file_path)
    elif file_ext == ".csv":
        return _extract_text_from_csv(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")

# ============================================================================
# HEALTH CHECK - Global
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Global health check endpoint."""
    return {"status": "ok"}

# ============================================================================
# BASIC AGENT ENDPOINTS - /basic/*
# ============================================================================

@app.get("/basic/health", response_model=HealthResponse)
async def basic_health_check():
    """Health check endpoint for Basic Agent."""
    return {"status": "ok"}

@app.post("/basic/analyze", response_model=BasicAnalyzeResponse)
async def basic_analyze_symptoms(request: BasicAnalyzeRequest):
    """
    Analyze patient symptoms using Basic Agent.
    
    Takes patient symptom text and generates a professional medical summary.
    """
    try:
        # LangGraph invoke - recursion_limit=5
        initial_state = {
            "input_text": request.text,
            "messages": [],
            "draft": "",
            "feedback": "",
            "is_approved": False
        }
        
        result = basic_graph.invoke(
            initial_state, 
            config={"recursion_limit": 5}
        )
        
        return {
            "final_summary": result["draft"],
            "history": result["messages"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# INTERMEDIATE AGENT ENDPOINTS - /intermediate/*
# ============================================================================

@app.get("/intermediate/health", response_model=HealthResponse)
async def intermediate_health_check():
    """Health check endpoint for Intermediate Agent."""
    return {"status": "ok"}

@app.post("/intermediate/analyze", response_model=IntermediateAnalyzeResponse)
async def intermediate_analyze(request: IntermediateAnalyzeRequest):
    """
    Analyze medical case with multiple specialists using Intermediate Agent.
    
    Args:
        case: Medical case description
        top_k: Number of specialists to consult (1-20, default 5)
    
    Returns:
        Response with specialist assessments and final summary
    """
    # Validate top_k
    if not (1 <= request.top_k <= 20):
        raise HTTPException(status_code=400, detail="top_k must be between 1 and 20")
    
    if not request.case or len(request.case.strip()) == 0:
        raise HTTPException(status_code=400, detail="case cannot be empty")
    
    try:
        # Initialize state
        initial_state = {
            "case_description": request.case,
            "top_k": request.top_k,
            "specialist_key": "",
            "specialists_to_run": [],
            "assessments": [],
            "final_summary": ""
        }
        
        # Run the agent graph
        result = intermediate_agent.app.invoke(initial_state)
        
        # Format assessments: convert from "role" to "specialist" field
        specialist_assessments = [
            SpecialistAssessment(
                specialist=a["role"],
                assessment=a["assessment"]
            )
            for a in result["assessments"]
        ]
        
        # Create case summary from first 500 chars of case
        case_summary = request.case[:500] + ("..." if len(request.case) > 500 else "")
        
        return IntermediateAnalyzeResponse(
            case_summary=case_summary,
            specialist_assessments=specialist_assessments,
            unified_summary=result["final_summary"],
            specialists_count=len(specialist_assessments)
        )
        
    except Exception as e:
        import traceback
        print(f"Detailed error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

# ============================================================================
# ADVANCED AGENT ENDPOINTS - /advanced/*
# ============================================================================

@app.get("/advanced/health", response_model=HealthResponse)
async def advanced_health_check():
    """Health check endpoint for Advanced Agent."""
    return {"status": "ok"}

@app.get("/advanced/files", response_model=FilesResponse)
async def list_files():
    """List available files in storage directory."""
    try:
        if not os.path.exists(DATA_DIR):
            return {"files": []}
        
        files = [
            f for f in os.listdir(DATA_DIR)
            if f.endswith(('.pdf', '.txt', '.csv'))
        ]
        return {"files": sorted(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/advanced/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    """
    Upload and process clinical documents using Advanced Agent.
    
    Concatenates multiple files with section headers.
    Returns thread_id, status, soap_draft, and extractions.
    """
    try:
        if not files:
            raise HTTPException(status_code=400, detail="No files provided")
        
        # Extract and concatenate text from all files
        combined_text = ""
        for file in files:
            text = _extract_text_from_upload(file)
            combined_text += f"\n=== {file.filename} ===\n{text}\n"
        
        # Generate thread ID
        thread_id = str(uuid.uuid4())
        
        # Start workflow
        result = start_workflow(thread_id, combined_text)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/advanced/process-storage")
async def process_storage(request: ProcessStorageRequest):
    """
    Process documents from storage directory using Advanced Agent.
    
    Takes a list of filenames and processes them.
    Returns thread_id, status, soap_draft, and extractions.
    """
    try:
        if not request.filenames:
            raise HTTPException(status_code=400, detail="No filenames provided")
        
        # Extract and concatenate text from all files
        combined_text = ""
        for filename in request.filenames:
            file_path = os.path.join(DATA_DIR, filename)
            if not os.path.exists(file_path):
                raise HTTPException(
                    status_code=404,
                    detail=f"File not found: {filename}"
                )
            
            text = _extract_text_from_path(file_path)
            combined_text += f"\n=== {filename} ===\n{text}\n"
        
        # Generate thread ID
        thread_id = str(uuid.uuid4())
        
        # Start workflow
        result = start_workflow(thread_id, combined_text)
        
        return result
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/advanced/approve")
async def approve_soap(request: ApproveRequest):
    """
    Approve and finalize SOAP note after human review using Advanced Agent.
    
    Resumes workflow with clinician-edited SOAP note.
    Returns status and final_soap_note.
    """
    try:
        if not request.thread_id or not request.updated_soap:
            raise HTTPException(
                status_code=400,
                detail="thread_id and updated_soap are required"
            )
        
        # Resume workflow with updated SOAP
        result = update_workflow_and_resume(request.thread_id, request.updated_soap)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# ============================================================================
# Root endpoint - Shows available agents
# ============================================================================

@app.get("/")
async def root():
    """Root endpoint showing available agents."""
    return {
        "message": "Consolidated Medical Agents API",
        "agents": {
            "basic": {
                "description": "Basic symptom analysis agent",
                "endpoints": [
                    "GET /basic/health",
                    "POST /basic/analyze"
                ]
            },
            "intermediate": {
                "description": "Multi-specialist consultation agent",
                "endpoints": [
                    "GET /intermediate/health",
                    "POST /intermediate/analyze"
                ]
            },
            "advanced": {
                "description": "Clinical document processing with SOAP notes",
                "endpoints": [
                    "GET /advanced/health",
                    "GET /advanced/files",
                    "POST /advanced/upload",
                    "POST /advanced/process-storage",
                    "POST /advanced/approve"
                ]
            }
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
