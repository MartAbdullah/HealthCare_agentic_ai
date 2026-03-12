"""
Streamlit frontend for clinical document processing pipeline.

Provides UI for uploading documents, reviewing extractions,
editing SOAP notes, and approving finalized documents.
"""

import streamlit as st
import requests
import json
import os
from pathlib import Path

# Configuration
API_URL = os.getenv("API_URL", "http://localhost:8000")

# Page configuration
st.set_page_config(
    page_title="Clinical Document Processor",
    page_icon="🏥",
    layout="wide"
)

st.title("🏥 Clinical Document Processing Pipeline")


# Initialize session state
if "workflow_status" not in st.session_state:
    st.session_state.workflow_status = "idle"
    st.session_state.thread_id = None
    st.session_state.soap_draft = ""
    st.session_state.extractions = []


def reset_workflow():
    """Reset workflow to idle state."""
    st.session_state.workflow_status = "idle"
    st.session_state.thread_id = None
    st.session_state.soap_draft = ""
    st.session_state.extractions = []


def get_storage_files():
    """Fetch list of files from storage."""
    try:
        response = requests.get(f"{API_URL}/files")
        if response.status_code == 200:
            return response.json().get("files", [])
    except Exception as e:
        st.error(f"Failed to fetch files from storage: {str(e)}")
    return []


def upload_and_process(uploaded_files):
    """Upload files and start workflow."""
    if not uploaded_files:
        st.error("Please select files to upload")
        return
    
    try:
        # Prepare files for upload
        files = [(f.name, f.getvalue(), f.type) for f in uploaded_files]
        
        # Send to API
        response = requests.post(
            f"{API_URL}/upload",
            files=[("files", f) for f in files]
        )
        
        if response.status_code == 200:
            result = response.json()
            st.session_state.thread_id = result["thread_id"]
            st.session_state.soap_draft = result["soap_draft"]
            st.session_state.extractions = result["extractions"]
            st.session_state.workflow_status = "awaiting_approval"
            st.rerun()
        else:
            st.error(f"Error: {response.text}")
    except Exception as e:
        st.error(f"Failed to process files: {str(e)}")


def process_storage_files(selected_files):
    """Process files from storage."""
    if not selected_files:
        st.error("Please select at least one file")
        return
    
    try:
        response = requests.post(
            f"{API_URL}/process-storage",
            json={"filenames": selected_files}
        )
        
        if response.status_code == 200:
            result = response.json()
            st.session_state.thread_id = result["thread_id"]
            st.session_state.soap_draft = result["soap_draft"]
            st.session_state.extractions = result["extractions"]
            st.session_state.workflow_status = "awaiting_approval"
            st.rerun()
        else:
            st.error(f"Error: {response.text}")
    except Exception as e:
        st.error(f"Failed to process files: {str(e)}")


def submit_approval(updated_soap):
    """Submit approved SOAP note."""
    try:
        response = requests.post(
            f"{API_URL}/approve",
            json={
                "thread_id": st.session_state.thread_id,
                "updated_soap": updated_soap
            }
        )
        
        if response.status_code == 200:
            result = response.json()
            st.session_state.soap_draft = result["final_soap_note"]
            st.session_state.workflow_status = "completed"
            st.rerun()
        else:
            st.error(f"Error: {response.text}")
    except Exception as e:
        st.error(f"Failed to submit approval: {str(e)}")


# =============================================================================
# STATE 1: IDLE
# =============================================================================
if st.session_state.workflow_status == "idle":
    st.markdown("---")
    st.subheader("📋 Choose Document Source")
    
    # Create two columns for upload modes
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown("### 📁 Upload Files Mode")
        st.markdown("Upload one or more clinical documents (PDF, TXT, or CSV)")
        
        uploaded_files = st.file_uploader(
            "Choose files",
            type=["pdf", "txt", "csv"],
            accept_multiple_files=True,
            key="file_uploader"
        )
        
        if st.button("▶️ Process Document(s)", key="upload_button", use_container_width=True):
            upload_and_process(uploaded_files)
    
    with col2:
        st.markdown("### 💾 Storage Mode")
        st.markdown("Select pre-loaded documents from the data directory")
        
        # Get available files
        available_files = get_storage_files()
        
        if available_files:
            selected_files = st.multiselect(
                "Available files",
                available_files,
                key="storage_select"
            )
            
            if st.button("▶️ Process Selected File(s)", key="storage_button", use_container_width=True):
                process_storage_files(selected_files)
        else:
            st.info("No files available in storage. Upload files using the left panel.")


# =============================================================================
# STATE 2: AWAITING APPROVAL
# =============================================================================
elif st.session_state.workflow_status == "awaiting_approval":
    st.markdown("---")
    st.subheader("✏️ Review and Edit SOAP Note")
    st.info(f"Thread ID: `{st.session_state.thread_id}`")
    
    # Create two columns
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("### **Draft SOAP Note**")
        st.markdown("Review the AI-generated draft. Make any necessary corrections before approval.")
        
        # Editable text area for SOAP note
        edited_soap = st.text_area(
            "Edit SOAP Note",
            value=st.session_state.soap_draft,
            height=400,
            label_visibility="collapsed"
        )
    
    with col2:
        st.markdown("### **Extractions**")
        
        # Medical Conditions
        with st.expander("🔬 Medical Conditions", expanded=False):
            conditions = [
                ext for ext in st.session_state.extractions
                if ext["entity_type"] == "medical_condition"
            ]
            if conditions:
                st.json(conditions)
            else:
                st.write("No conditions extracted")
        
        # Medications
        with st.expander("💊 Medications", expanded=False):
            medications = [
                ext for ext in st.session_state.extractions
                if ext["entity_type"] == "drug"
            ]
            if medications:
                st.json(medications)
            else:
                st.write("No medications extracted")
        
        # All Extractions (raw JSON)
        with st.expander("📊 All Extractions (JSON)", expanded=False):
            if st.session_state.extractions:
                st.json(st.session_state.extractions)
            else:
                st.write("No extractions available")
    
    # Action buttons
    st.markdown("---")
    col_approve, col_cancel = st.columns(2)
    
    with col_approve:
        if st.button(
            "✅ Approve & Submit",
            key="approve_button",
            use_container_width=True,
            type="primary"
        ):
            submit_approval(edited_soap)
    
    with col_cancel:
        if st.button(
            "🔄 Start New Patient",
            key="cancel_button",
            use_container_width=True
        ):
            reset_workflow()
            st.rerun()


# =============================================================================
# STATE 3: COMPLETED
# =============================================================================
elif st.session_state.workflow_status == "completed":
    st.markdown("---")
    st.subheader("✅ Workflow Completed")
    st.success("SOAP note has been finalized and approved!")
    st.info(f"Thread ID: `{st.session_state.thread_id}`")
    
    # Create two columns
    col1, col2 = st.columns([2, 1])
    
    with col1:
        st.markdown("### **Final SOAP Note**")
        st.markdown(st.session_state.soap_draft)
    
    with col2:
        st.markdown("### **Extractions**")
        
        # Medical Conditions
        with st.expander("🔬 Medical Conditions", expanded=False):
            conditions = [
                ext for ext in st.session_state.extractions
                if ext["entity_type"] == "medical_condition"
            ]
            if conditions:
                st.json(conditions)
            else:
                st.write("No conditions extracted")
        
        # Medications
        with st.expander("💊 Medications", expanded=False):
            medications = [
                ext for ext in st.session_state.extractions
                if ext["entity_type"] == "drug"
            ]
            if medications:
                st.json(medications)
            else:
                st.write("No medications extracted")
        
        # All Extractions (raw JSON)
        with st.expander("📊 All Extractions (JSON)", expanded=False):
            if st.session_state.extractions:
                st.json(st.session_state.extractions)
            else:
                st.write("No extractions available")
    
    # Action button
    st.markdown("---")
    if st.button(
        "🔄 Start New Patient",
        key="final_reset",
        use_container_width=True,
        type="primary"
    ):
        reset_workflow()
        st.rerun()


# Footer
st.markdown("---")
st.markdown(
    "🏥 Clinical Document Processing Pipeline | "
    "Built with LangGraph + FastAPI + Streamlit"
)
