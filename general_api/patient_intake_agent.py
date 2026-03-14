import os
import json
import operator
from typing import Annotated, TypedDict, Union
from dotenv import load_dotenv
# from litellm import completion
from langgraph.graph import StateGraph, END
from tools import get_llm_completion

load_dotenv()

class AgentState(TypedDict):
    input_text: str
    messages: Annotated[list, operator.add]
    draft: str
    feedback: str
    is_approved: bool

def generator_node(state: AgentState):
    """Creates a medical summary draft or modifies it based on feedback."""
    input_text = state["input_text"]
    feedback = state.get("feedback", "")
    
    prompt = f"Summarize the following patient symptoms professionally. Do NOT provide a diagnosis.\n\nSymptoms: {input_text}"
    if feedback:
        prompt += f"\n\nPrevious feedback to address: {feedback}"
    
    response = get_llm_completion(prompt, temperature=0.2)
    
    draft = response.choices[0].message.content
    return {
        "draft": draft,
        "messages": [f"[GENERATOR]: {draft}"]
    }

def critic_node(state: AgentState):
    """Reviews the draft for security and accuracy."""
    draft = state["draft"]
    
    prompt = (
        "Review the following medical summary. Ensure: \n"
        "1. No explicit diagnosis is made.\n"
        "2. Professional tone.\n"
        "3. No hallucinations.\n\n"
        "Respond ONLY with a valid JSON object (no additional text) with exactly these keys:\n"
        '{"is_approved": true/false, "feedback": "your feedback here"}\n\n'
        f"Summary to review:\n{draft}"
    )
    
    try:
        response = get_llm_completion(prompt, temperature=0.0)
        
        response_text = response.choices[0].message.content.strip()
        # Extract JSON from response (handle cases where model adds extra text)
        if "{" in response_text and "}" in response_text:
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            json_str = response_text[json_start:json_end]
            result = json.loads(json_str)
        else:
            result = json.loads(response_text)
        
        is_approved = result.get("is_approved", False)
        feedback = result.get("feedback", "No feedback provided")
    except (json.JSONDecodeError, KeyError, AttributeError, ValueError) as e:
        # JSON parsing failed, assume not approved
        is_approved = False
        feedback = "Review completed - improvements needed"
    
    return {
        "is_approved": is_approved,
        "feedback": feedback,
        "messages": [f"[CRITIC]: approved={is_approved} | Feedback: {feedback}"]
    }

def should_continue(state: AgentState):
    """Decides whether the loop should continue or not."""
    if state["is_approved"]:
        return END
    return "generator"

# Create Graph
workflow = StateGraph(AgentState)

workflow.add_node("generator", generator_node)
workflow.add_node("critic", critic_node)

workflow.set_entry_point("generator")

workflow.add_edge("generator", "critic")
workflow.add_conditional_edges(
    "critic",
    should_continue,
    {
        "generator": "generator",
        END: END
    }
)

app = workflow.compile()

if __name__ == "__main__":
    print("Agent workflow compiled successfully.")