"""
Consolidated Medical Agents API v2.0
Combines three specialized medical AI agents in a single FastAPI server:
1. Basic Agent (Patient Intake) - Reflection loop for symptom analysis
2. Intermediate Agent (Specialist Consultation) - Multi-specialist analysis
3. Advanced Agent (Clinical Document) - Document processing with SOAP notes
"""

import os
from typing import List, Optional
from datetime import datetime
import uuid
import re

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import requests
from xml.etree import ElementTree as ET

# Import agent modules from local files
from patient_intake_agent import app as patient_intake_app
from specialist_consultancy_agent import app as specialist_app
from medical_document_agent import start_workflow, update_workflow_and_resume

# ============================================================================
# CONFIGURATION
# ============================================================================

API_HOST = os.getenv("API_HOST", "0.0.0.0")
API_PORT = int(os.getenv("API_PORT", 8001))
DATA_DIR = os.getenv("DATA_DIR", os.path.join(os.path.dirname(__file__), "data"))

# Create data directory if it doesn't exist
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)

# ============================================================================
# FASTAPI APP SETUP
# ============================================================================

app = FastAPI(
    title="Healthcare Agentic AI API",
    description="Multi-agent medical AI system combining symptom analysis, specialist consultation, and clinical document processing",
    version="2.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",       # Local dev
        "http://localhost:8501",       # Local dev
        "http://127.0.0.1:3000",       # Local dev
        "http://ui:3000",              # Docker Compose
        "http://api:8001",             # Docker Compose (internal)
        "*"                             # Allow all (for development)
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class HealthResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str = None
    
    def __init__(self, **data):
        if 'timestamp' not in data:
            data['timestamp'] = datetime.now().isoformat()
        super().__init__(**data)


class BasicAnalyzeRequest(BaseModel):
    """Patient intake analysis request"""
    text: str


class BasicAnalyzeResponse(BaseModel):
    """Patient intake analysis response"""
    final_summary: str
    history: List[str]


class IntermediateAnalyzeRequest(BaseModel):
    """Specialist consultation request"""
    case: str
    top_k: int = 5


class SpecialistAssessment(BaseModel):
    """Single specialist assessment"""
    specialist: str
    assessment: str


class IntermediateAnalyzeResponse(BaseModel):
    """Specialist consultation response"""
    case_summary: str
    specialist_assessments: List[SpecialistAssessment]
    unified_summary: str
    specialists_count: int


class ProcessStorageRequest(BaseModel):
    """Request to process files from storage"""
    filenames: List[str]


class ApproveRequest(BaseModel):
    """Request to approve SOAP note"""
    thread_id: str
    updated_soap: str


class FilesResponse(BaseModel):
    """List of available files"""
    files: List[str]


class UploadResponse(BaseModel):
    """Upload response"""
    thread_id: str
    status: str
    soap_draft: str
    extractions: List[dict]
    conditions: List[str] = []
    medications: List[dict] = []


class ApproveResponse(BaseModel):
    """Approval response"""
    status: str
    final_soap_note: str


class NewsItem(BaseModel):
    """Single news item"""
    title: str
    description: str
    link: str
    source: str
    pubDate: Optional[str] = None
    image: Optional[str] = None


class NewsResponse(BaseModel):
    """News feed response"""
    items: List[NewsItem]
    count: int


class LoginRequest(BaseModel):
    """Login request model"""
    email: str
    password: str


class LoginResponse(BaseModel):
    """Login response model"""
    success: bool
    message: str
    token: Optional[str] = None

# ============================================================================
# HEALTH CHECK ENDPOINTS
# ============================================================================

@app.get("/health", response_model=HealthResponse)
async def global_health():
    """Global health check endpoint"""
    return HealthResponse(status="ok")


# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Authenticate user with email and password.
    
    For demo purposes, validates against REACT_APP_VALID_EMAIL and REACT_APP_VALID_PASSWORD
    environment variables.
    
    Args:
        request: Contains email and password
        
    Returns:
        LoginResponse with success status and token if authenticated
    """
    valid_email = os.getenv("REACT_APP_VALID_EMAIL", "patient@healthcare.com")
    valid_password = os.getenv("REACT_APP_VALID_PASSWORD", "password123")
    
    if request.email == valid_email and request.password == valid_password:
        return LoginResponse(
            success=True,
            message="Login successful",
            token="demo-token-12345"
        )
    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )


# ============================================================================
# BASIC AGENT ENDPOINTS - Patient Intake (Reflection Loop)
# ============================================================================

@app.get("/basic/health", response_model=HealthResponse)
async def basic_health():
    """Health check for Basic Agent"""
    return HealthResponse(status="ok")


@app.post("/basic/analyze", response_model=BasicAnalyzeResponse)
async def basic_analyze(request: BasicAnalyzeRequest):
    """
    Analyze patient symptoms using Basic Agent.
    
    Uses a reflection loop (Generator → Critic) to produce a professional
    medical summary that passes safety and accuracy checks.
    
    Args:
        request: Contains patient symptom text
        
    Returns:
        final_summary: Approved medical summary
        history: Agent thinking process (Generator and Critic steps)
    """
    if not request.text or not request.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")
    
    try:
        # Initialize state
        initial_state = {
            "input_text": request.text,
            "messages": [],
            "draft": "",
            "feedback": "",
            "is_approved": False
        }
        
        # Run the agent graph (max 5 iterations)
        result = patient_intake_app.invoke(
            initial_state,
            config={"recursion_limit": 5}
        )
        
        return BasicAnalyzeResponse(
            final_summary=result.get("draft", ""),
            history=result.get("messages", [])
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing symptoms: {str(e)}"
        )

# ============================================================================
# INTERMEDIATE AGENT ENDPOINTS - Specialist Consultation (Fan-Out)
# ============================================================================

@app.get("/intermediate/health", response_model=HealthResponse)
async def intermediate_health():
    """Health check for Intermediate Agent"""
    return HealthResponse(status="ok")


@app.post("/intermediate/analyze", response_model=IntermediateAnalyzeResponse)
async def intermediate_analyze(request: IntermediateAnalyzeRequest):
    """
    Analyze medical case using multiple specialists.
    
    Routes the case to the most relevant specialists (selected by supervisor),
    runs them in parallel, and aggregates their assessments into a unified summary.
    
    Args:
        request: Contains case description and number of specialists (top_k)
        
    Returns:
        case_summary: Truncated version of input case
        specialist_assessments: List of specialist opinions
        unified_summary: Synthesized final assessment
        specialists_count: Number of specialists consulted
    """
    # Validate top_k
    if not (1 <= request.top_k <= 20):
        raise HTTPException(
            status_code=400,
            detail="top_k must be between 1 and 20"
        )
    
    if not request.case or not request.case.strip():
        raise HTTPException(status_code=400, detail="Case cannot be empty")
    
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
        result = specialist_app.invoke(initial_state)
        
        # Format assessments
        specialist_assessments = [
            SpecialistAssessment(
                specialist=a.get("role", "Unknown"),
                assessment=a.get("assessment", "")
            )
            for a in result.get("assessments", [])
        ]
        
        # Create case summary (first 500 chars)
        case_summary = request.case[:500]
        if len(request.case) > 500:
            case_summary += "..."
        
        return IntermediateAnalyzeResponse(
            case_summary=case_summary,
            specialist_assessments=specialist_assessments,
            unified_summary=result.get("final_summary", ""),
            specialists_count=len(specialist_assessments)
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing case: {str(e)}"
        )

# ============================================================================
# ADVANCED AGENT ENDPOINTS - Clinical Document Processing
# ============================================================================

@app.get("/advanced/health", response_model=HealthResponse)
async def advanced_health():
    """Health check for Advanced Agent"""
    return HealthResponse(status="ok")


@app.get("/advanced/files", response_model=FilesResponse)
async def list_files():
    """
    List available files in storage directory.
    
    Returns:
        files: List of PDF, TXT, and CSV filenames in data directory
    """
    try:
        if not os.path.exists(DATA_DIR):
            return FilesResponse(files=[])
        
        files = [
            f for f in os.listdir(DATA_DIR)
            if f.endswith(('.pdf', '.txt', '.csv'))
        ]
        return FilesResponse(files=sorted(files))
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error listing files: {str(e)}"
        )


@app.post("/advanced/upload", response_model=UploadResponse)
async def upload_and_process(files: List[UploadFile] = File(...)):
    """
    Upload and process clinical documents.
    
    Extracts text from PDF, TXT, or CSV files, runs the document processing
    pipeline, and returns the SOAP draft for human review.
    
    Args:
        files: List of clinical document files to process
        
    Returns:
        thread_id: Unique identifier for this processing session
        status: Current status (awaiting_approval)
        soap_draft: Generated SOAP note draft
        extractions: Extracted conditions, medications, and codes
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    try:
        # Concatenate text from all files
        combined_text = ""
        for file in files:
            content = await file.read()
            text = content.decode('utf-8')
            combined_text += f"\n=== {file.filename} ===\n{text}\n"
        
        # Generate thread ID
        thread_id = str(uuid.uuid4())
        
        # Start workflow
        result = start_workflow(thread_id, combined_text)
        
        return UploadResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing files: {str(e)}"
        )


@app.post("/advanced/process-storage", response_model=UploadResponse)
async def process_storage_files(request: ProcessStorageRequest):
    """
    Process documents from storage directory.
    
    Reads files from the data directory, concatenates them, and runs
    the document processing pipeline.
    
    Args:
        request: Contains list of filenames to process
        
    Returns:
        thread_id: Unique identifier for this processing session
        status: Current status (awaiting_approval)
        soap_draft: Generated SOAP note draft
        extractions: Extracted conditions, medications, and codes
    """
    if not request.filenames:
        raise HTTPException(status_code=400, detail="No filenames provided")
    
    try:
        combined_text = ""
        
        for filename in request.filenames:
            file_path = os.path.join(DATA_DIR, filename)
            
            if not os.path.exists(file_path):
                raise HTTPException(
                    status_code=404,
                    detail=f"File not found: {filename}"
                )
            
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            combined_text += f"\n=== {filename} ===\n{content}\n"
        
        # Generate thread ID
        thread_id = str(uuid.uuid4())
        
        # Start workflow
        result = start_workflow(thread_id, combined_text)
        
        return UploadResponse(**result)
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error processing files: {str(e)}"
        )


@app.post("/advanced/approve", response_model=ApproveResponse)
async def approve_soap_note(request: ApproveRequest):
    """
    Approve and finalize SOAP note after human review.
    
    Resumes the workflow with the clinician-edited SOAP note and completes
    the processing pipeline.
    
    Args:
        request: Contains thread_id and updated SOAP note
        
    Returns:
        status: Processing status (completed)
        final_soap_note: Final approved SOAP note
    """
    if not request.thread_id or not request.updated_soap:
        raise HTTPException(
            status_code=400,
            detail="thread_id and updated_soap are required"
        )
    
    try:
        result = update_workflow_and_resume(request.thread_id, request.updated_soap)
        return ApproveResponse(**result)
        
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"Error approving SOAP note: {str(e)}"
        )


# ============================================================================
# NEWS ENDPOINTS
# ============================================================================

@app.get("/health-news", response_model=NewsResponse)
async def get_health_news():
    """Fetch latest health news from BBC Health RSS feed."""
    try:
        feed_url = 'https://feeds.bbci.co.uk/news/health/rss.xml'
        response = requests.get(feed_url, timeout=10)
        response.raise_for_status()
        
        # Parse with ElementTree, handling namespaces
        root = ET.fromstring(response.content)
        
        # Define namespaces
        namespaces = {
            'media': 'http://search.yahoo.com/mrss/',
            'content': 'http://purl.org/rss/1.0/modules/content/',
            'dc': 'http://purl.org/dc/elements/1.1/'
        }
        
        items = []
        
        # Find all items in the channel
        for item in root.findall('.//item')[:15]:
            title_elem = item.find('title')
            desc_elem = item.find('description')
            link_elem = item.find('link')
            pubdate_elem = item.find('pubDate')
            
            title = title_elem.text if title_elem is not None else 'No Title'
            description = desc_elem.text if desc_elem is not None else ''
            link = link_elem.text if link_elem is not None else ''
            pubdate = pubdate_elem.text if pubdate_elem is not None else ''
            
            image = None
            
            # Look for media:thumbnail element with namespace
            # Format: <media:thumbnail width="240" height="135" url="..."/>
            thumbnail = item.find('media:thumbnail', namespaces)
            if thumbnail is not None:
                url_attr = thumbnail.get('url')
                if url_attr:
                    image = url_attr
            
            # Fallback: Try without namespace prefix
            if not image:
                for elem in item:
                    if elem.tag.endswith('thumbnail'):
                        url_attr = elem.get('url')
                        if url_attr:
                            image = url_attr
                            break
            
            # Clean description from HTML
            if description:
                clean_desc = re.sub('<[^<]+?>', '', description)
                clean_desc = clean_desc[:200].strip()
                if len(description) > 200:
                    clean_desc += '...'
                description = clean_desc
            
            if title and link:
                items.append(NewsItem(
                    title=title[:100],
                    description=description,
                    link=link,
                    source='BBC Health',
                    pubDate=pubdate,
                    image=image
                ))
        
        return NewsResponse(items=items, count=len(items))
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error fetching health news: {str(e)}"
        )

# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/")
async def root():
    """API root endpoint with agent information"""
    return {
        "message": "Healthcare Agentic AI API v2.0",
        "agents": {
            "basic": {
                "name": "Patient Intake Agent",
                "description": "Reflection loop for symptom analysis (Generator → Critic)",
                "endpoints": {
                    "health": "/basic/health",
                    "analyze": "/basic/analyze"
                }
            },
            "intermediate": {
                "name": "Specialist Consultation Agent",
                "description": "Multi-specialist analysis with supervisor routing and parallel execution",
                "endpoints": {
                    "health": "/intermediate/health",
                    "analyze": "/intermediate/analyze"
                }
            },
            "advanced": {
                "name": "Clinical Document Agent",
                "description": "Document processing with SOAP note generation and human-in-the-loop review",
                "endpoints": {
                    "health": "/advanced/health",
                    "upload": "/advanced/upload",
                    "process_storage": "/advanced/process-storage",
                    "approve": "/advanced/approve",
                    "list_files": "/advanced/files"
                }
            }
        },
        "utilities": {
            "news": {
                "name": "Health News Feed",
                "description": "Latest health news from BBC Health RSS",
                "endpoint": "/health-news"
            }
        }
    }


# ============================================================================
# APPLICATION ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    print(f"Starting Healthcare API on {API_HOST}:{API_PORT}")
    print(f"Data directory: {DATA_DIR}")
    print(f"API docs: http://{API_HOST}:{API_PORT}/docs")
    
    uvicorn.run(
        app,
        host=API_HOST,
        port=API_PORT,
        log_level="info"
    )
