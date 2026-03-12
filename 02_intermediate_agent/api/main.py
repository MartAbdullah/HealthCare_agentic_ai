from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from agent import app as agent_graph

# Create FastAPI app
app = FastAPI(
    title="Medical Agent API",
    description="Multi-specialist medical AI analysis system",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8501", "*"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    case: str
    top_k: int = 5


class SpecialistAssessment(BaseModel):
    specialist: str
    assessment: str


class AnalyzeResponse(BaseModel):
    case_summary: str
    specialist_assessments: List[SpecialistAssessment]
    unified_summary: str
    specialists_count: int


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze(request: AnalyzeRequest):
    """
    Analyze medical case with multiple specialists.
    
    Args:
        case: Medical case description
        top_k: Number of specialists to consult (1-20, default 5)
    
    Returns:
        AnalyzeResponse with specialist assessments and final summary
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
        result = agent_graph.invoke(initial_state)
        
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
        
        return AnalyzeResponse(
            case_summary=case_summary,
            specialist_assessments=specialist_assessments,
            unified_summary=result["final_summary"],
            specialists_count=len(specialist_assessments)
        )
        
    except Exception as e:
        import traceback
        print(f"Detailed error: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)