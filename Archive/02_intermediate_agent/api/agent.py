import os
import json
import re
import operator
from typing import Annotated, TypedDict, List, Optional
from dotenv import load_dotenv
from litellm import completion
from langgraph.graph import StateGraph, END
from langgraph.types import Send

load_dotenv()

# Model configuration
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")

# Specialist Registry
SPECIALISTS = {
    "general_practitioner": {
        "name": "General Practitioner",
        "description": "Provides primary care assessment, medical history synthesis, and general health overview."
    },
    "cardiologist": {
        "name": "Cardiologist",
        "description": "Specializes in cardiovascular system assessment, including heart disease, arrhythmias, and hemodynamic status."
    },
    "neurologist": {
        "name": "Neurologist",
        "description": "Evaluates neurological symptoms, CNS disorders, and neurological emergencies."
    },
    "nephrologist": {
        "name": "Nephrologist",
        "description": "Assesses renal function, electrolyte abnormalities, and kidney disease."
    },
    "pulmonologist": {
        "name": "Pulmonologist",
        "description": "Evaluates respiratory system, lung disease, and breathing abnormalities."
    },
    "hematologist": {
        "name": "Hematologist",
        "description": "Specializes in blood disorders, anemia, and coagulation issues."
    },
    "endocrinologist": {
        "name": "Endocrinologist",
        "description": "Assesses metabolic disorders, diabetes, and hormonal imbalances."
    },
    "oncologist": {
        "name": "Oncologist",
        "description": "Evaluates malignancy risk and cancer-related complications."
    },
    "geriatrician": {
        "name": "Geriatrician",
        "description": "Provides specialized assessment for age-related health issues and polypharmacy."
    },
    "psychiatrist": {
        "name": "Psychiatrist",
        "description": "Evaluates mental health status, psychiatric symptoms, and psychological factors in presentation."
    },
    "infectious_disease": {
        "name": "Infectious Disease Specialist",
        "description": "Assesses infectious risks, microbiological findings, and antimicrobial therapy."
    },
    "rheumatologist": {
        "name": "Rheumatologist",
        "description": "Evaluates autoimmune and rheumatologic conditions."
    },
    "vascular_surgeon": {
        "name": "Vascular Surgeon",
        "description": "Assesses vascular pathology and peripheral vascular disease."
    },
    "cardiothoracic_surgeon": {
        "name": "Cardiothoracic Surgeon",
        "description": "Evaluates surgical candidacy for cardiac and thoracic conditions."
    },
    "radiologist": {
        "name": "Radiologist",
        "description": "Interprets imaging findings and recommends additional imaging workup."
    },
    "clinical_pharmacist": {
        "name": "Clinical Pharmacist",
        "description": "Reviews medications, identifies drug interactions, and optimizes drug therapy."
    },
    "dietitian": {
        "name": "Dietitian",
        "description": "Provides nutritional assessment and dietary recommendations."
    },
    "physiotherapist": {
        "name": "Physiotherapist",
        "description": "Evaluates functional status and recommends rehabilitation strategies."
    },
    "palliative_care": {
        "name": "Palliative Care Specialist",
        "description": "Provides symptom management and quality-of-life considerations."
    },
    "emergency_physician": {
        "name": "Emergency Physician",
        "description": "Assesses acute presentation, critical findings, and emergency management priorities."
    }
}

# Build specialist menu for prompts
SPECIALIST_MENU = "\n".join([f"- {key}: {spec['name']} — {spec['description']}" 
                             for key, spec in SPECIALISTS.items()])


class AgentState(TypedDict):
    case_description: str
    top_k: int
    specialists_to_run: List[str]
    assessments: Annotated[List[dict], operator.add]
    final_summary: str


def supervisor(state: AgentState) -> dict:
    """LLM supervisor selects top_k most relevant specialists."""
    case = state["case_description"]
    top_k = state["top_k"]
    
    prompt = f"""You are a medical AI triage system. Review this clinical case and select exactly {top_k} 
specialist roles that would be most relevant for comprehensive assessment.

Available specialists:
{SPECIALIST_MENU}

Clinical case:
{case}

Respond with ONLY a JSON array of {top_k} specialist keys (from the list above). 
Example: ["cardiologist", "pulmonologist", "nephrologist"]

Return only the JSON array, no explanation."""

    try:
        response = completion(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
        )
        response_text = response["choices"][0]["message"]["content"]
        
        # Extract JSON array from response
        match = re.search(r"\[.*?\]", response_text, re.DOTALL)
        if match:
            specialists = json.loads(match.group())
        else:
            specialists = []
        
        # Validate and pad specialists list
        valid_specialists = [s for s in specialists if s in SPECIALISTS]
        
        # Pad with defaults if needed
        if len(valid_specialists) < top_k:
            defaults = [s for s in SPECIALISTS.keys() if s not in valid_specialists]
            valid_specialists.extend(defaults[:top_k - len(valid_specialists)])
        
        specialists_to_run = valid_specialists[:top_k]
        
    except Exception as e:
        print(f"Error in supervisor: {e}")
        specialists_to_run = list(SPECIALISTS.keys())[:top_k]
    
    return {
        "specialists_to_run": specialists_to_run,
        "assessments": [],
        "final_summary": ""
    }


def route_to_specialists(state: AgentState) -> list:
    """Fan-out: send each specialist to process in parallel."""
    specialists_to_run = state["specialists_to_run"]
    
    return [
        Send("specialist_runner", {
            "case_description": state["case_description"],
            "specialist_key": specialist_key
        })
        for specialist_key in specialists_to_run
    ]


def specialist_runner(state: AgentState) -> dict:
    """Run individual specialist assessment."""
    case = state.get("case_description", "")
    specialist_key = state.get("specialist_key", "")
    
    if not specialist_key or specialist_key not in SPECIALISTS:
        print(f"Invalid specialist: {specialist_key}")
        return {"assessments": []}
    
    specialist = SPECIALISTS[specialist_key]
    name = specialist["name"]
    description = specialist["description"]
    
    prompt = f"""You are a {name}. {description}

Your task: Analyze the following clinical case from your specialist perspective. Provide:
1. Key findings relevant to your specialty
2. Differential diagnosis (if applicable)
3. Required investigations
4. Treatment recommendations

Clinical case:
{case}

Provide a focused, professional assessment from your specialty viewpoint. Be concise but thorough."""

    try:
        response = completion(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
        )
        assessment = response["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error in specialist_runner ({specialist_key}): {e}")
        assessment = f"Error generating assessment for {name}: {str(e)}"
    
    return {
        "assessments": [{
            "role": name,
            "specialist_key": specialist_key,
            "assessment": assessment
        }]
    }


def aggregator(state: AgentState) -> dict:
    """Synthesize all specialist assessments into unified summary."""
    assessments = state.get("assessments", [])
    case = state.get("case_description", "")
    
    if not assessments:
        return {"final_summary": "No specialist assessments available."}
    
    # Build combined assessment text
    combined = "Clinical Case:\n" + case + "\n\n"
    combined += "Specialist Assessments:\n"
    for assess in assessments:
        combined += f"\n{assess['role']}:\n{assess['assessment']}\n" + "="*60 + "\n"
    
    prompt = f"""You are an expert clinical synthesizer. Review all the specialist assessments below 
and create ONE unified, integrated clinical summary that:

1. Identifies the most likely diagnosis(es) with supporting evidence
2. Highlights critical findings and red flags
3. Provides a comprehensive management plan
4. Notes any specialist consensus or divergence
5. Prioritizes urgent interventions
6. Recommends follow-up and specialist coordination

{combined}

Provide a cohesive, clinically actionable summary that synthesizes all perspectives."""

    try:
        response = completion(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )
        final_summary = response["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error in aggregator: {e}")
        final_summary = f"Error generating final summary: {str(e)}"
    
    return {"final_summary": final_summary}


# Build the graph
workflow = StateGraph(AgentState)

# Add nodes
workflow.add_node("supervisor", supervisor)
workflow.add_node("specialist_runner", specialist_runner)
workflow.add_node("aggregator", aggregator)

# Set entry point
workflow.set_entry_point("supervisor")

# Add edges
workflow.add_conditional_edges(
    "supervisor",
    route_to_specialists,
    ["specialist_runner"]
)
workflow.add_edge("specialist_runner", "aggregator")
workflow.add_edge("aggregator", END)

# Compile graph
app = workflow.compile()

