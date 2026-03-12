#!/usr/bin/env python3
"""End-to-end test with detailed response analysis"""

import requests
import json
import time

API_URL = "http://localhost:8000/analyze"

def test_full_pipeline():
    """Test full specialist pipeline"""
    print("\n" + "="*60)
    print("🏥 END-TO-END TEST: Medical Multi-Specialist System")
    print("="*60)
    
    test_case = {
        "text": """75-year-old male admitted with acute chest pain for 3 hours, 
        radiating to left arm. Associated with dyspnea, diaphoresis. 
        Risk factors: hypertension, diabetes, hyperlipidemia, smoking (30 pack-years).
        Vital signs: BP 145/90, HR 102, RR 22, SaO2 94% on room air.
        Physical exam: distressed, pale, cold extremities.
        ECG: ST elevation in leads II, III, aVF (inferior STEMI pattern).
        Troponin I: 2.5 ng/mL (elevated), CK-MB: 8.2 ng/mL.
        Chest X-ray: mild pulmonary edema.
        Echocardiogram pending.""",
        "top_k": 4
    }
    
    print(f"\n📝 Test Case: Acute MI in elderly patient")
    print(f"   Specialists to consult: {test_case['top_k']}")
    print(f"   Case length: {len(test_case['text'])} characters")
    
    print(f"\n⏱️  Sending request to API...")
    start_time = time.time()
    
    try:
        response = requests.post(
            API_URL,
            json=test_case,
            timeout=180
        )
        
        elapsed = time.time() - start_time
        
        print(f"\n✅ Response received in {elapsed:.2f} seconds")
        print(f"   Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            
            # Analysis Summary
            print(f"\n📊 RESPONSE ANALYSIS:")
            print(f"   • Specialists consulted: {len(result['assessments'])}")
            
            print(f"\n🎯 SPECIALIST ROLES INVOLVED:")
            for i, assessment in enumerate(result['assessments'], 1):
                role = assessment['role']
                key = assessment['specialist_key']
                assessment_len = len(assessment['assessment'])
                print(f"   {i}. {role} ({key})")
                print(f"      └─ Assessment length: {assessment_len} chars")
            
            print(f"\n📋 FINAL SUMMARY ANALYSIS:")
            summary = result['final_summary']
            print(f"   • Total length: {len(summary)} characters")
            print(f"   • First 300 characters:")
            print(f"   " + "-"*56)
            print("   " + summary[:300].replace("\n", "\n   "))
            print(f"   " + "-"*56)
            
            # Validate structure
            print(f"\n✓ VALIDATION CHECKS:")
            checks = [
                ("Has final summary", bool(summary and len(summary) > 50)),
                ("Has specialist assessments", len(result['assessments']) > 0),
                ("Correct number of specialists", len(result['assessments']) == test_case['top_k']),
                ("All assessments have role", all('role' in a for a in result['assessments'])),
                ("All assessments have text", all(len(a.get('assessment', '')) > 0 for a in result['assessments'])),
            ]
            
            for check_name, check_result in checks:
                status = "✓" if check_result else "✗"
                print(f"   {status} {check_name}")
            
            all_passed = all(check[1] for check in checks)
            
            print(f"\n{'='*60}")
            if all_passed:
                print("✅ END-TO-END TEST PASSED!")
            else:
                print("⚠️  END-TO-END TEST PARTIALLY PASSED")
            print(f"{'='*60}")
            
            return all_passed
            
        else:
            print(f"❌ ERROR: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print(f"❌ Request timed out after 180 seconds")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    import sys
    success = test_full_pipeline()
    sys.exit(0 if success else 1)
