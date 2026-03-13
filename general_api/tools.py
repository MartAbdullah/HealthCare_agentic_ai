import os
from litellm import completion

def get_llm_completion(prompt: str, temperature: float = 0.5):
    """
    Get LLM completion with Groq as primary and Gemini as fallback.
    """
    GROQ_API_KEY = os.getenv("GROQ_API_KEY")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
    
    # Try Groq first
    try:
        print(f"DEBUG: Attempting Groq with model: groq/llama-3.3-70b-versatile")
        response = completion(
            model="groq/llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=temperature,
            api_key=GROQ_API_KEY
        )
        print("DEBUG: Groq success")
        return response
    except Exception as groq_err:
        print(f"DEBUG: Groq error: {type(groq_err).__name__}: {groq_err}")
        print(f"DEBUG: Falling back to Gemini...")
        # Try Gemini as fallback
        try:
            response = completion(
                model="gemini/gemini-2.0-flash",
                messages=[{"role": "user", "content": prompt}],
                temperature=temperature,
                api_key=GEMINI_API_KEY
            )
            print("DEBUG: Gemini success")
            return response
        except Exception as gemini_err:
            print(f"Gemini fallback also failed: {gemini_err}")
            raise gemini_err

def get_icd10_code(condition: str) -> str:
    """
    Fallback ICD-10-CM code lookup for common clinical conditions.
    Returns the ICD-10-CM code for a given condition string.
    
    Args:
        condition: A condition description (e.g., "hypertension", "diabetes")
        
    Returns:
        ICD-10-CM code string, or "R00.0" (unspecified symptom) if not found
    """
    # Normalize condition to lowercase for matching
    condition_lower = condition.lower().strip()
    
    # Common conditions -> ICD-10-CM codes
    icd10_lookup = {
        "hypertension": "I10",
        "high blood pressure": "I10",
        "elevated blood pressure": "I10",
        "diabetes": "E11.9",
        "type 2 diabetes": "E11.9",
        "hypothyroidism": "E03.9",
        "hyperlipidemia": "E78.5",
        "high cholesterol": "E78.5",
        "obesity": "E66.9",
        "overweight": "E66.9",
        "stroke": "I63.9",
        "ischemic stroke": "I63.9",
        "heart disease": "I51.9",
        "coronary artery disease": "I25.10",
        "atrial fibrillation": "I48.91",
        "depression": "F32.9",
        "anxiety": "F41.9",
        "asthma": "J45.9",
        "copd": "J44.9",
        "pneumonia": "J18.9",
        "arthritis": "M19.90",
        "osteoarthritis": "M19.90",
        "rheumatoid arthritis": "M06.9",
        "migraine": "G43.909",
        "headache": "R51.9",
        "fatigue": "R53.83",
        "insomnia": "G47.00",
        "sleep disorder": "G47.9",
        "anemia": "D64.9",
        "iron deficiency anemia": "D50.9",
        "kidney disease": "N18.9",
        "chronic kidney disease": "N18.9",
        "liver disease": "K76.9",
        "cirrhosis": "K74.60",
        "gerd": "K21.9",
        "reflux": "K21.9",
        "ulcer": "K27.9",
        "gastritis": "K29.70",
        "crohn's disease": "K50.90",
        "ulcerative colitis": "K51.90",
        "ibs": "K58.9",
        "constipation": "K59.1",
        "diarrhea": "K59.1",
        "hemorrhoids": "K64.9",
        "thyroid disorder": "E07.9",
        "cancer": "C80.1",
        "malignancy": "C80.1",
        "hiv": "B20",
        "aids": "B20",
        "covid-19": "U07.1",
        "hep c": "B18.2",
        "hepatitis c": "B18.2",
        "herpes": "B00.9",
        "shingles": "B02.9",
        "influenza": "J10.1",
        "flu": "J10.1",
        "sinusitis": "J32.9",
        "allergies": "Z88.9",
        "allergy": "Z88.9",
        "eczema": "L30.9",
        "psoriasis": "L40.9",
        "acne": "L70.9",
        "urinary tract infection": "N39.0",
        "uti": "N39.0",
        "prostate disorder": "N42.9",
        "benign prostatic hyperplasia": "N40.1",
        "bph": "N40.1",
        "erectile dysfunction": "F52.21",
        "infertility": "N46.9",
        "menopause": "N95.1",
        "osteoporosis": "M81.90",
        "fracture": "T02.90XA",
        "broken bone": "T02.90XA",
        "back pain": "M54.5",
        "neck pain": "M54.2",
        "shoulder pain": "M25.51",
        "knee pain": "M25.561",
        "ankle pain": "M25.571",
        "wrist pain": "M25.53",
        "musculoskeletal pain": "M79.1",
        "fibromyalgia": "M79.7",
        "lupus": "M32.9",
        "diabetes mellitus": "E11.9",
        "dyslipidemias": "E78.5",
        "metabolic syndrome": "E88.81",
        "pcos": "E28.2",
        "polycystic ovary syndrome": "E28.2",
        "pregnancy": "Z33.3",
        "postpartum depression": "F53",
        "hypertensive": "I10",
        "hypotensive": "I95.9",
        "arrhythmia": "I49.9",
        "tachycardia": "R00.0",
        "bradycardia": "R00.1",
        "angina": "I20.0",
        "myocardial infarction": "I21.9",
        "heart attack": "I21.9",
        "heart failure": "I50.9",
        "congestive heart failure": "I50.9",
        "chf": "I50.9",
        "peripheral vascular disease": "I73.9",
        "dvt": "I82.90",
        "deep vein thrombosis": "I82.90",
        "pulmonary embolism": "I26.99",
        "pe": "I26.99",
        "varicose veins": "I83.9",
        "hypertensive urgency": "I16.1",
        "hypertensive emergency": "I16.1",
    }
    
    # Try direct lookup
    if condition_lower in icd10_lookup:
        return icd10_lookup[condition_lower]
    
    # Try partial matching for compound terms
    for key, code in icd10_lookup.items():
        if key in condition_lower or condition_lower in key:
            return code
    
    # Default fallback for unspecified conditions
    return "R00.0"


def format_soap_template(subjective: str, objective: str, assessment: str, plan: str) -> str:
    """
    Format SOAP note components into a structured markdown document.
    
    Args:
        subjective: Subjective section (patient's symptoms/complaints)
        objective: Objective section (clinical findings/measurements)
        assessment: Assessment section (diagnosis/interpretation)
        plan: Plan section (treatment/follow-up)
        
    Returns:
        Formatted SOAP note as markdown string
    """
    soap_note = f"""# SOAP Note

## **S (Subjective)**
{subjective}

## **O (Objective)**
{objective}

## **A (Assessment)**
{assessment}

## **P (Plan)**
{plan}
"""
    return soap_note
