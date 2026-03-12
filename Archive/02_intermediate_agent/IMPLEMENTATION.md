# 02 — Intermediate Agent: Implementation Guide

Build a multi-specialist medical AI system where an LLM supervisor routes a case to the most relevant specialists, runs them in parallel, and synthesizes their findings.

---

## What You Will Build

A multi-agent pipeline where:
1. A **Supervisor** LLM reads the case and selects the `top_k` most relevant specialists
2. All selected specialists analyze the case **in parallel**
3. An **Aggregator** synthesizes all assessments into one unified summary
4. Users control how many specialists are consulted (1–20) via a sidebar slider

---

## Agentic Pattern: Supervisor + Parallel Fan-Out

```
Medical Case Input
       │
       ▼
┌──────────────┐
│  Supervisor  │  (LLM selects top_k specialist keys)
└──────┬───────┘
       │  Send API fan-out
       ▼
┌──────┬──────┬──────┐
│Spec 1│Spec 2│Spec N│  (run in parallel)
└──────┴──────┴──────┘
       │  results merged via operator.add
       ▼
┌──────────────┐
│  Aggregator  │  (synthesizes all assessments)
└──────┬───────┘
       │
       ▼
  Final Summary
```

---

## Project Structure

```
02_intermediate_agent/
├── api/
│   ├── agent.py          ← Specialist registry, AgentState, supervisor/specialist/aggregator nodes, graph
│   ├── main.py           ← FastAPI server (/health, /analyze)
│   ├── requirements.txt
│   └── Dockerfile
├── ui/
│   ├── app.py            ← Streamlit frontend (sidebar slider, tabs per specialist)
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
└── .env
```

---

## Requirements

**`api/requirements.txt`**
```
fastapi[standard]>=0.110.0
langchain-core>=0.1.30
langgraph>=0.2.0
litellm>=1.34.0
pydantic>=2.6.0
python-dotenv>=1.0.1
uvicorn>=0.28.0
```

**`ui/requirements.txt`**
```
streamlit>=1.32.0
requests>=2.31.0
```

**External dependencies:** Python 3.11+, Docker & Docker Compose, OpenAI API key

---

## Environment File (`.env`)

```env
OGEMINI_API_KEY=.....
LLM_MODEL=gemini/.....
```
**Windows PowerShell:**
```powershell
# Create and activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies for API
cd 02_intermediate_agent\api
pip install -r requirements.txt

# Install dependencies for UI
cd ..\ui
pip install -r requirements.txt
```

---

#### Step 2: Start API Server

**Terminal 1 (API Server):**
```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Navigate to API folder
cd 02_intermediate_agent\api

# Start API server (runs on port 8000)
python main.py
```

You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000
```

Test health endpoint:
```powershell
Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing
```

You should see:
```json
{"status": "ok"}
```

---

**Terminal 2 (UI Server):**
```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Navigate to UI folder
cd 02_intermediate_agent\ui

# Start Streamlit UI (runs on port 8501)
streamlit run app.py
```

You should see:
```
You can now view your Streamlit app in your browser.

Local URL: http://localhost:8501
```


## Running the Project

```bash
cd 02_intermediate_agent
docker compose up --build
```

- UI: http://localhost:8501
- API docs: http://localhost:8000/docs

---

## API Endpoints

| Method | Path | Input | Output |
|---|---|---|---|
| `GET` | `/health` | — | `{"status": "ok"}` |
| `POST` | `/analyze` | `{"text": "...", "top_k": 5}` | `{"assessments": [...], "final_summary": "..."}` |

The `top_k` field (integer, 1–20) controls how many specialists are selected. Default is 5.

---

## UI Walkthrough

1. Open http://localhost:8501
2. Use the **sidebar slider** to set `top_k` (how many specialists to consult)
3. Paste the medical case description into the text area
4. Click **Analyze with Specialists**
5. The spinner runs while the supervisor selects specialists and they analyze in parallel
6. The **Integrated Clinical Summary** is shown at the top
7. Individual specialist assessments are displayed in separate **tabs** below

---

## Implementation Notes

### Specialist Registry
Define a `SPECIALISTS` dict in `agent.py` with 20 entries. Each entry has a key (string), `name`, and `description`. Keys to implement:
`general_practitioner`, `cardiologist`, `neurologist`, `nephrologist`, `pulmonologist`,
`hematologist`, `endocrinologist`, `oncologist`, `geriatrician`, `psychiatrist`,
`infectious_disease`, `rheumatologist`, `vascular_surgeon`, `cardiothoracic_surgeon`,
`radiologist`, `clinical_pharmacist`, `dietitian`, `physiotherapist`, `palliative_care`,
`emergency_physician`

Pre-build a formatted menu string from the registry to pass to the supervisor prompt.

### Agent State
Define `AgentState` as a `TypedDict` with: `case_description` (str), `top_k` (int), `specialists_to_run` (List[str]), `assessments` (Annotated with `operator.add`), `final_summary` (str).

The `operator.add` reducer on `assessments` is critical — it lets each parallel specialist node **append** its result without overwriting others.

### Supervisor Node
Sends the case + specialist menu to the LLM. Asks for a JSON array of exactly `top_k` specialist keys. Parses the response with `re.search(r"\[.*?\]", ...)` for robustness. Pads with defaults if the LLM returns fewer than `top_k` valid keys.

### Specialist Runner Node
Receives `{case_description, specialist_key}` injected by `Send`. Takes the specialist's role and description, calls the LLM for a detailed assessment. Returns `{"assessments": [{"role": name, "assessment": text}]}`.

### Fan-Out Routing (`route_to_specialists`)
Returns a list of `Send("specialist_runner", {...})` objects — one per selected specialist key. LangGraph runs all of them in parallel. Import `Send` from `langgraph.types` (or `langgraph.constants` for older versions).

### Aggregator Node
Receives all specialist results merged into `state["assessments"]`. Builds a combined text and calls the LLM to synthesize a unified clinical summary covering diagnosis, red flags, management plan, and specialist consensus/divergence.

### Graph Construction
- Entry point: `supervisor`
- Conditional edges: `supervisor → route_to_specialists → ["specialist_runner"]`
- Edge: `specialist_runner → aggregator`
- Edge: `aggregator → END`

---

## Example Input

```
68-year-old female with a 2-week history of progressive shortness of breath,
bilateral leg swelling, and orthopnea. She reports a 5 kg weight gain over
the past month. Past medical history: hypertension, type 2 diabetes.
Medications: metformin, amlodipine. Exam: JVP elevated, bilateral crackles,
pitting edema to knees. ECG: sinus tachycardia, LBBB.
BNP: 1,450 pg/mL (elevated). CXR: cardiomegaly, pulmonary congestion.
```

## Example Output

**Integrated Clinical Summary:**
```
Most-likely diagnosis: Acute decompensated heart failure (HFrEF) with possible
new-onset cardiomyopathy, exacerbated by fluid overload.

Critical findings: BNP markedly elevated (1,450 pg/mL), new LBBB on ECG
(requires urgent ischaemic workup), significant pulmonary congestion and
peripheral oedema.

Management plan:
- Urgent echocardiogram to assess EF and valvular function
- IV diuresis (furosemide) with strict fluid balance monitoring
- Cardiology referral for LBBB workup and HF optimisation
- Review metformin if renal function impaired
- Daily weights and electrolyte monitoring
```

**Cardiologist tab (example):**
```
Key findings: Elevated BNP, new LBBB, cardiomegaly, pulmonary oedema.
Differential: Ischaemic cardiomyopathy, dilated cardiomyopathy, hypertensive heart disease.
Investigations: Urgent echo, troponin, coronary angiography if EF reduced.
Treatment: IV furosemide, RAAS inhibitor, beta-blocker once euvolaemic.
```

---

