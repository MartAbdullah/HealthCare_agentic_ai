# 03 Advanced Agent - Quick Start Guide

This is a complete implementation of a clinical document processing pipeline with human-in-the-loop review.

## Project Setup

### 1. Environment Variables

Create a `.env` file in the project root with your API keys:

```env
OPENAI_API_KEY=sk-your-actual-api-key-here
LLM_MODEL=gpt-4o-mini
```

Or if using a different provider:

```env
GEMINI_API_KEY=your-key-here
LLM_MODEL=gemini/gemini-2.0-flash
```

### 2. Install Dependencies (Local Development)

```bash
# Navigate to the project
cd 03_advanced_agent

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install API dependencies
cd api
pip install -r requirements.txt

# Install UI dependencies
cd ../ui
pip install -r requirements.txt
```

### 3. Run with Docker Compose (Recommended)

```bash
cd 03_advanced_agent

# Build and start services
docker compose up --build

# Services will be available at:
# - UI: http://localhost:8501
# - API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

## Project Structure

```
03_advanced_agent/
├── api/
│   ├── agent.py          # LangGraph workflow with 5 nodes
│   ├── main.py           # FastAPI server
│   ├── tools.py          # Helper functions (ICD-10 lookup, SOAP formatter)
│   ├── requirements.txt
│   ├── Dockerfile
│   └── __pycache__/
├── ui/
│   ├── app.py            # Streamlit frontend (3 states)
│   ├── requirements.txt
│   └── Dockerfile
├── data/                 # Pre-loaded clinical documents
│   └── sample_patient_note.txt
├── docker-compose.yml
├── .env
└── IMPLEMENTATION.md
```

## How It Works

### 1. **Idle State** (Initial)
- Upload a clinical document (PDF, TXT, CSV)
- Or select from pre-loaded files in `data/` directory
- Click "Process Document(s)"

### 2. **Processing Pipeline**
The workflow executes 5 sequential nodes:

1. **Condition Extractor** - Identifies medical conditions
2. **Medication Extractor** - Extracts drugs with dosage/route
3. **Condition Coder** - Assigns ICD-10-CM codes
4. **Medication Coder** - Assigns RxNorm codes
5. **SOAP Drafter** - Creates draft note (pipeline pauses here)

### 3. **Awaiting Approval State**
- Review AI-generated SOAP note draft
- Edit the note as needed
- View extracted conditions (with ICD-10 codes)
- View extracted medications (with RxNorm codes)
- Click "Approve & Submit" to finalize

### 4. **Completed State**
- View final approved SOAP note
- Review all extractions
- Start a new patient case with "Start New Patient" button

## API Endpoints

```
GET  /health                 → Health check
GET  /files                  → List files in data/ directory
POST /upload                 → Upload and process files
POST /process-storage        → Process files from data/
POST /approve                → Approve and finalize SOAP note
```

Example API call:

```bash
# Upload files
curl -F "files=@patient_note.txt" http://localhost:8000/upload

# Approve SOAP note
curl -X POST http://localhost:8000/approve \
  -H "Content-Type: application/json" \
  -d '{
    "thread_id": "uuid-here",
    "updated_soap": "## **S (Subjective):**\n..."
  }'
```

## Features

✅ **Multi-Document Processing** - Upload multiple files at once
✅ **Clinical Entity Extraction** - Conditions and medications
✅ **Standardized Coding** - ICD-10-CM and RxNorm codes
✅ **Structured Output** - SOAP note format
✅ **Human-in-the-Loop** - Review and edit before finalization
✅ **Stateful Workflow** - LangGraph with MemorySaver checkpoints
✅ **Fallback Handling** - Graceful degradation if LLM parsing fails

## Testing

### With Sample Data
A sample patient note is included in `data/sample_patient_note.txt`. 
Use the "Storage Mode" in the UI to test without uploading files.

### Expected Output
For the sample note, expect:
- **Conditions**: hypothyroidism, hyperlipidemia, obesity, anemia, hypertension
- **Medications**: Atorvastatin 40 MG Oral, Lisinopril 10 MG Oral, Levothyroxine 50 mcg Oral
- **ICD-10 Codes**: E03.9 (hypothyroidism), E78.5 (hyperlipidemia), E66.9 (obesity), etc.
- **RxNorm Codes**: Extracted from LLM or marked as "UNKNOWN" if unavailable

## Troubleshooting

### API Container Won't Start
```bash
# Check logs
docker compose logs api

# Ensure .env file has OPENAI_API_KEY
# Ensure all dependencies installed correctly
```

### UI Can't Connect to API
```bash
# Verify API is running
curl http://localhost:8000/health

# Check API_URL environment variable in docker-compose.yml
# For manual testing, set API_URL=http://localhost:8000
```

### File Upload Errors
- Supported formats: PDF, TXT, CSV
- Files must be < 100MB
- Ensure read permissions on `data/` directory

### Slow Processing
- First request may take 30-60 seconds due to LLM latency
- Check API logs for errors: `docker compose logs -f api`

## Architecture Notes

**LangGraph Checkpoint** - Each workflow run is identified by a `thread_id`. 
The pipeline saves state after SOAP drafting, allowing clinicians to review and edit 
before final submission.

**Fallback Mechanisms** - If ICD-10 or RxNorm codes can't be parsed from LLM output,
the system uses a hardcoded lookup dictionary in `tools.py`.

**Stateless API** - The FastAPI server delegates all stateful logic to LangGraph.
Multiple concurrent workflows (different patients) can run in parallel.

## Next Steps / Enhancements

- Add database persistence for historical records
- Implement user authentication and authorization
- Add support for additional document types (HL7, CCD)
- Integrate real ICD-10/RxNorm lookup APIs
- Add audit logging for compliance
- Deploy to cloud (AWS, GCP, Azure)

## Support

For issues, questions, or contributions:
1. Check IMPLEMENTATION.md for detailed technical specs
2. Review logs: `docker compose logs`
3. Test API directly: `http://localhost:8000/docs` (Swagger UI)

---

Built with ❤️ using LangGraph, FastAPI, and Streamlit
