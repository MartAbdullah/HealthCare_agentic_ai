import streamlit as st

st.set_page_config(page_title="Specialist Dashboard - Intermediate Agent", page_icon="👥")

st.title("👥 Specialist Dashboard")
st.markdown("### Intermediate Agent: Supervisor + Parallel Fan-Out + Aggregator")

st.info("The Intermediate Agent uses a Supervisor to select the best specialists (up to 20) and runs them in parallel.")

st.slider("Number of Specialists to consult (top_k):", 1, 20, 3)

patient_case = st.text_area(
    "Enter a complex medical case for specialist consultation:",
    height=250
)

if st.button("Consult with Specialists"):
    st.warning("This is a placeholder for the Intermediate Agent (Project 02).")
    st.write("Flow summary:")
    st.write("1. Supervisor reads case and selects top_k specialists.")
    st.write("2. Selected specialists analyze simultaneously.")
    st.write("3. Aggregator synthesizes a final clinical summary.")
