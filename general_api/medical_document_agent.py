"""
LangGraph workflow for clinical document processing pipeline.

Implements a 5-node agentic pattern with human-in-the-loop SOAP note drafting.
"""

import json
import re
import operator
from typing import TypedDict, Annotated, Optional
from typing_extensions import NotRequired
from langchain_core.messages import HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.memory import MemorySaver
from langgraph.types import Command
from litellm import completion
import os
from tools import get_icd10_code, format_soap_template

# Setup API keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
LLM_MODEL = os.getenv("LLM_MODEL", "gpt-4o-mini")


class AgentState(TypedDict):
    """State schema for the clinical document processing pipeline."""
    raw_text: str
    conditions: list[str]
    medications: list[dict]
    extractions: Annotated[list[dict], operator.add]
    soap_draft: str


def condition_extractor(state: AgentState) -> dict:
    """
    Extract medical conditions from clinical document text.
    
    Uses LLM to identify and list medical conditions mentioned in the document.
    """
    # Get API key based on model provider
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    
    # Determine API key based on model
    if "gemini" in model.lower():
        api_key = os.getenv("GEMINI_API_KEY")
    else:
        api_key = os.getenv("OPENAI_API_KEY")
    
    prompt = f"""You are a clinical NLP specialist. Extract all medical conditions mentioned in the following clinical document.

Return ONLY a valid JSON array of condition strings, like this:
["hypertension", "type 2 diabetes", "obesity"]

Document:
{state['raw_text']}

Respond with just the JSON array, no additional text."""

    message = HumanMessage(content=prompt)
    
    response = completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        api_key=api_key,
        temperature=0.2
    )
    
    response_text = response.choices[0].message.content
    
    # Parse JSON array from response
    conditions = []
    try:
        match = re.search(r"\[.*\]", response_text, re.DOTALL)
        if match:
            conditions = json.loads(match.group())
    except (json.JSONDecodeError, AttributeError):
        conditions = []
    
    return {"conditions": conditions}


def medication_extractor(state: AgentState) -> dict:
    """
    Extract medications with drug name, dosage, and route.
    
    Uses LLM to identify medications and structure them with three key fields.
    """
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    if "gemini" in model.lower():
        api_key = os.getenv("GEMINI_API_KEY")
    else:
        api_key = os.getenv("OPENAI_API_KEY")
    
    prompt = f"""You are a clinical pharmacist. Extract all medications from the following clinical document.

For each medication, provide ONLY these three fields:
- drug: the medication name
- dosage: the dose amount (e.g., "40 MG", "500 mg")
- route: the route of administration (e.g., "Oral", "IV", "Intramuscular")

Return a valid JSON array of objects, like this:
[
  {{"drug": "atorvastatin", "dosage": "40 MG", "route": "Oral"}},
  {{"drug": "lisinopril", "dosage": "10 MG", "route": "Oral"}}
]

Document:
{state['raw_text']}

Respond with just the JSON array, no additional text."""

    response = completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        api_key=api_key,
        temperature=0.2
    )
    
    response_text = response.choices[0].message.content
    
    # Parse JSON array from response
    medications = []
    try:
        match = re.search(r"\[.*\]", response_text, re.DOTALL)
        if match:
            medications = json.loads(match.group())
    except (json.JSONDecodeError, AttributeError):
        medications = []
    
    return {"medications": medications}


def condition_coder(state: AgentState) -> dict:
    """
    Assign ICD-10-CM codes to extracted conditions.
    
    Uses LLM to match conditions to ICD-10-CM terminology codes.
    """
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    if "gemini" in model.lower():
        api_key = os.getenv("GEMINI_API_KEY")
    else:
        api_key = os.getenv("OPENAI_API_KEY")
    
    if not state["conditions"]:
        return {"extractions": []}
    
    conditions_str = ", ".join(state["conditions"])
    
    prompt = f"""You are a medical coder. For each of these conditions, provide the most appropriate ICD-10-CM code.

Conditions: {conditions_str}

Return a valid JSON array with this exact structure:
[
  {{"chunk": "condition name", "entity_type": "medical_condition", "ICD10": "E03.9"}},
  ...
]

Respond with just the JSON array, no additional text."""

    response = completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        api_key=api_key,
        temperature=0.2
    )
    
    response_text = response.choices[0].message.content
    
    # Parse JSON array from response
    extractions = []
    try:
        match = re.search(r"\[.*\]", response_text, re.DOTALL)
        if match:
            extractions = json.loads(match.group())
    except (json.JSONDecodeError, AttributeError):
        # Fallback: use get_icd10_code for each condition
        extractions = [
            {
                "chunk": condition,
                "entity_type": "medical_condition",
                "ICD10": get_icd10_code(condition)
            }
            for condition in state["conditions"]
        ]
    
    return {"extractions": extractions}


def medication_coder(state: AgentState) -> dict:
    """
    Assign RxNorm codes to extracted medications.
    
    Uses LLM to match medications to RxNorm (RxCUI) codes.
    """
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    if "gemini" in model.lower():
        api_key = os.getenv("GEMINI_API_KEY")
    else:
        api_key = os.getenv("OPENAI_API_KEY")
    
    if not state["medications"]:
        return {"extractions": []}
    
    # Build medication chunks
    med_chunks = []
    for med in state["medications"]:
        chunk = f"{med.get('drug', '')} {med.get('dosage', '')} {med.get('route', '')}".strip()
        med_chunks.append((chunk, med))
    
    medications_str = "; ".join([chunk for chunk, _ in med_chunks])
    
    prompt = f"""You are a pharmacist. For each medication, provide the RxNorm (RxCUI) code.

Medications: {medications_str}

Return a valid JSON array with this exact structure:
[
  {{"chunk": "drug dosage route", "entity_type": "drug", "RxNorm": "617310"}},
  ...
]

Respond with just the JSON array, no additional text."""

    response = completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        api_key=api_key,
        temperature=0.2
    )
    
    response_text = response.choices[0].message.content
    
    # Parse JSON array from response
    extractions = []
    try:
        match = re.search(r"\[.*\]", response_text, re.DOTALL)
        if match:
            extractions = json.loads(match.group())
    except (json.JSONDecodeError, AttributeError):
        # Fallback: create entries without RxNorm codes
        extractions = [
            {
                "chunk": chunk,
                "entity_type": "drug",
                "RxNorm": "UNKNOWN"
            }
            for chunk, _ in med_chunks
        ]
    
    return {"extractions": extractions}


def soap_drafter(state: AgentState) -> dict:
    """
    Draft a structured SOAP note from extracted information.
    
    Collects extractions and uses LLM to draft the assessment section,
    then formats with SOAP template.
    """
    model = os.getenv("LLM_MODEL", "gpt-4o-mini")
    if "gemini" in model.lower():
        api_key = os.getenv("GEMINI_API_KEY")
    else:
        api_key = os.getenv("OPENAI_API_KEY")
    
    # Format conditions and medications for the prompt
    conditions_list = "\n".join([
        f"- {ext['chunk']} ({ext['ICD10']})"
        for ext in state["extractions"]
        if ext["entity_type"] == "medical_condition"
    ])
    
    medications_list = "\n".join([
        f"- {ext['chunk']} (RxNorm: {ext['RxNorm']})"
        for ext in state["extractions"]
        if ext["entity_type"] == "drug"
    ])
    
    prompt = f"""You are a clinical physician. Draft the Assessment section of a SOAP note based on these extracted findings.

Clinical Conditions identified:
{conditions_list if conditions_list else "None identified"}

Medications:
{medications_list if medications_list else "None"}

Original document excerpt:
{state['raw_text'][:500]}...

Write a concise Assessment section (2-3 sentences) that synthesizes the findings."""

    response = completion(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        api_key=api_key,
        temperature=0.3
    )
    
    assessment = response.choices[0].message.content
    
    # Create complete SOAP note using template
    subjective = "Patient reports symptoms and concerns as documented in the clinical history."
    objective = "Clinical findings, vital signs, and laboratory results as documented."
    plan = "Treatment plan and follow-up to be determined after clinical review."
    
    soap_draft = format_soap_template(subjective, objective, assessment, plan)
    
    return {"soap_draft": soap_draft}


def create_graph():
    """
    Create and compile the LangGraph workflow with checkpoint support.
    
    Returns:
        Compiled graph with MemorySaver checkpoint manager
    """
    # Create state graph
    graph = StateGraph(AgentState)
    
    # Add nodes
    graph.add_node("condition_extractor", condition_extractor)
    graph.add_node("medication_extractor", medication_extractor)
    graph.add_node("condition_coder", condition_coder)
    graph.add_node("medication_coder", medication_coder)
    graph.add_node("soap_drafter", soap_drafter)
    
    # Define edges - sequential pipeline
    graph.add_edge(START, "condition_extractor")
    graph.add_edge("condition_extractor", "medication_extractor")
    graph.add_edge("medication_extractor", "condition_coder")
    graph.add_edge("condition_coder", "medication_coder")
    graph.add_edge("medication_coder", "soap_drafter")
    graph.add_edge("soap_drafter", END)
    
    # Compile with memory checkpointer and interrupt after SOAP drafting
    checkpointer = MemorySaver()
    compiled_graph = graph.compile(
        checkpointer=checkpointer,
        interrupt_after=["soap_drafter"]
    )
    
    return compiled_graph


# Global graph instance
graph = create_graph()


def start_workflow(thread_id: str, raw_text: str) -> dict:
    """
    Start a new workflow execution with the given clinical document.
    
    Args:
        thread_id: Unique identifier for this workflow run
        raw_text: Clinical document text to process
        
    Returns:
        Dictionary with thread_id, status, soap_draft, and extractions
    """
    initial_state = {
        "raw_text": raw_text,
        "conditions": [],
        "medications": [],
        "extractions": [],
        "soap_draft": ""
    }
    
    # Invoke graph with checkpoint configuration
    config = {"configurable": {"thread_id": thread_id}}
    
    # Run until interrupt (after soap_drafter)
    graph.invoke(initial_state, config)
    
    # Get the current state at interrupt point
    state = graph.get_state(config)
    
    soap_draft = state.values.get("soap_draft", "")
    extractions = state.values.get("extractions", [])
    
    return {
        "thread_id": thread_id,
        "status": "awaiting_approval",
        "soap_draft": soap_draft,
        "extractions": extractions
    }


def update_workflow_and_resume(thread_id: str, updated_soap: str) -> dict:
    """
    Resume workflow execution after human review with updated SOAP note.
    
    Args:
        thread_id: Thread identifier for this workflow run
        updated_soap: Clinician-edited SOAP note text
        
    Returns:
        Dictionary with status and final_soap_note
    """
    config = {"configurable": {"thread_id": thread_id}}
    
    # Update the state with the edited SOAP note
    graph.update_state(config, {"soap_draft": updated_soap})
    
    # Resume execution from the interrupt
    graph.invoke(None, config)
    
    # Get final state
    state = graph.get_state(config)
    final_soap = state.values.get("soap_draft", updated_soap)
    
    return {
        "status": "completed",
        "final_soap_note": final_soap
    }
