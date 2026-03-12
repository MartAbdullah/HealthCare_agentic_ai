import streamlit as st
import requests
from typing import List, Dict

# Page config
st.set_page_config(
    page_title="Medical AI Specialist System",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Styling
st.markdown("""
    <style>
    .summary-box {
        background-color: #1a1a2e;
        padding: 20px;
        border-radius: 10px;
        border-left: 5px solid #1f77b4;
        margin: 20px 0;
        color: #ffffff;
    }
    .summary-box p {
        color: #ffffff !important;
    }
    .specialist-assessment {
        background-color: #0f3460;
        padding: 15px;
        border-radius: 8px;
        margin: 10px 0;
        color: #ffffff;
    }
    .specialist-assessment p {
        color: #ffffff !important;
    }
    </style>
""", unsafe_allow_html=True)

# API Configuration
API_BASE_URL = "http://127.0.0.1:8000"

# Title
st.title("🏥 Medical Multi-Specialist AI System")
st.markdown("Analyze clinical cases with input from multiple medical specialists")

# Sidebar configuration
with st.sidebar:
    st.header("Configuration")
    
    top_k = st.slider(
        "Number of Specialists to Consult",
        min_value=1,
        max_value=20,
        value=5,
        help="Select how many specialist perspectives to consider"
    )
    
    st.markdown("---")
    st.markdown("""
    ### How it works:
    1. Enter a medical case description
    2. Set the number of specialists
    3. Click "Analyze with Specialists"
    4. View integrated summary and individual assessments
    """)


# Main content area
col1, col2 = st.columns([2, 1])

with col1:
    st.header("Clinical Case Input")
    case_text = st.text_area(
        "Enter medical case description:",
        height=200,
        placeholder="Example: 68-year-old female with progressive shortness of breath, "
                    "bilateral leg swelling, and orthopnea. Recent 5 kg weight gain. "
                    "Past medical history: hypertension, type 2 diabetes. "
                    "Exam findings: elevated JVP, bilateral crackles, pitting edema to knees. "
                    "ECG: sinus tachycardia, LBBB. BNP: 1,450 pg/mL. "
                    "CXR: cardiomegaly, pulmonary congestion."
    )

with col2:
    st.header("Quick Info")
    st.info(f"""
    **Specialists:** {top_k}
    
    **Status:** Ready
    """)

# Analyze button
if st.button("🔍 Analyze with Specialists", use_container_width=True, type="primary"):
    if not case_text or len(case_text.strip()) == 0:
        st.error("Please enter a medical case description")
    else:
        with st.spinner("🤔 Specialists are analyzing the case..."):
            try:
                # Call API
                response = requests.post(
                    f"{API_BASE_URL}/analyze",
                    json={"text": case_text, "top_k": top_k},
                    timeout=120
                )
                
                if response.status_code == 200:
                    result = response.json()
                    
                    # Store in session state for display
                    st.session_state.analysis_result = result
                    st.success("✅ Analysis complete!")
                else:
                    st.error(f"API Error: {response.status_code} - {response.text}")
                    
            except requests.exceptions.ConnectionError:
                st.error("❌ Could not connect to API. Make sure the backend is running at http://api:8000")
            except requests.exceptions.Timeout:
                st.error("❌ Request timed out. The analysis is taking too long.")
            except Exception as e:
                st.error(f"❌ Error: {str(e)}")

# Display results if available
if "analysis_result" in st.session_state:
    result = st.session_state.analysis_result
    
    # Integrated Clinical Summary
    st.markdown("---")
    st.header("📋 Integrated Clinical Summary")
    
    with st.container():
        st.markdown(
            f"""
            <div class="summary-box">
            <p style="color: #ffffff; white-space: pre-wrap;">{result['final_summary']}</p>
            </div>
            """,
            unsafe_allow_html=True
        )
    
    # Individual Specialist Assessments
    st.markdown("---")
    st.header("👨‍⚕️ Individual Specialist Assessments")
    
    if result["assessments"]:
        # Create tabs for each specialist
        tabs = st.tabs([assess["role"] for assess in result["assessments"]])
        
        for tab, assessment in zip(tabs, result["assessments"]):
            with tab:
                st.markdown(
                    f"""
                    <div class="specialist-assessment">
                    <h3 style="color: #ffffff;">{assessment['role']}</h3>
                    <p style="color: #ffffff; white-space: pre-wrap;">{assessment['assessment']}</p>
                    </div>
                    """,
                    unsafe_allow_html=True
                )
    else:
        st.warning("No specialist assessments available")


# Footer
st.markdown("---")
st.markdown("""
<div align="center">
    <small>Medical Multi-Specialist AI System | Powered by LangGraph & LiteLLM</small>
</div>
""", unsafe_allow_html=True)
