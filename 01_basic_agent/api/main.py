from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import app as graph

app = FastAPI(title="Medical Agent API")

# CORS middleware for React UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    text: str

class AnalyzeResponse(BaseModel):
    final_summary: str
    history: list[str]

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/analyze", response_model=AnalyzeResponse)
async def analyze_symptoms(request: AnalyzeRequest):
    try:
        # LangGraph invoke - recursion_limit=5 (implementation notes gereği)
        initial_state = {
            "input_text": request.text,
            "messages": [],
            "draft": "",
            "feedback": "",
            "is_approved": False
        }
        
        result = graph.invoke(
            initial_state, 
            config={"recursion_limit": 5}
        )
        
        return {
            "final_summary": result["draft"],
            "history": result["messages"]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)