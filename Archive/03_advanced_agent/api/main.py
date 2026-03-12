"""
FastAPI server for clinical document processing pipeline.

Exposes endpoints for uploading documents, processing from storage,
and managing the SOAP note approval workflow.
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import uuid
import os
import csv
from pathlib import Path

from PyPDF2 import PdfReader
from agent import start_workflow, update_workflow_and_resume

app = FastAPI(title="Clinical Document Processing Pipeline")

# Configuration
DATA_DIR = os.getenv("DATA_DIR", "/app/data")
if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)


# Request/Response Models
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


# Text extraction helpers
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
    file_ext = Path(file.filename).suffix.lower()
    
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
    
    file_ext = Path(file_path).suffix.lower()
    
    if file_ext == ".pdf":
        return _extract_text_from_pdf(file_path)
    elif file_ext == ".txt":
        return _extract_text_from_txt(file_path)
    elif file_ext == ".csv":
        return _extract_text_from_csv(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_ext}")


# API Endpoints
@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/files", response_model=FilesResponse)
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


@app.post("/upload")
async def upload_files(files: list[UploadFile] = File(...)):
    """
    Upload and process clinical documents.
    
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


@app.post("/process-storage")
async def process_storage(request: ProcessStorageRequest):
    """
    Process documents from storage directory.
    
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


@app.post("/approve")
async def approve_soap(request: ApproveRequest):
    """
    Approve and finalize SOAP note after human review.
    
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
