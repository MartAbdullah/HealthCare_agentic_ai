#!/usr/bin/env python3
"""Test script for Medical Agent API"""

import requests
import json
import time

API_BASE_URL = "http://localhost:8000"

def test_health():
    """Test /health endpoint"""
    print("\n=== Testing /health endpoint ===")
    try:
        response = requests.get(f"{API_BASE_URL}/health", timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error: {e}")
        return False

def test_analyze():
    """Test /analyze endpoint"""
    print("\n=== Testing /analyze endpoint ===")
    
    test_case = {
        "text": "68-year-old female with progressive shortness of breath, bilateral leg swelling, orthopnea. 5 kg weight gain. PMHx: hypertension, diabetes. Exam: elevated JVP, bilateral crackles, pitting edema. ECG: sinus tachycardia, LBBB. BNP: 1450 pg/mL. CXR: cardiomegaly, pulmonary congestion.",
        "top_k": 2
    }
    
    try:
        print(f"Sending request with top_k={test_case['top_k']}...")
        start_time = time.time()
        
        response = requests.post(
            f"{API_BASE_URL}/analyze",
            json=test_case,
            timeout=180
        )
        
        elapsed = time.time() - start_time
        print(f"Status: {response.status_code}")
        print(f"Time elapsed: {elapsed:.2f} seconds")
        
        if response.status_code == 200:
            result = response.json()
            print(f"\n✅ SUCCESS!")
            print(f"Number of specialist assessments: {len(result['assessments'])}")
            
            print(f"\n📋 Final Summary (first 500 chars):")
            print(result['final_summary'][:500])
            
            print(f"\n👨‍⚕️ Specialists:")
            for assess in result['assessments']:
                print(f"  - {assess['role']} ({assess['specialist_key']})")
                print(f"    Assessment (first 200 chars): {assess['assessment'][:200]}...")
            
            return True
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

def test_invalid_top_k():
    """Test validation - top_k out of range"""
    print("\n=== Testing validation (top_k > 20) ===")
    
    test_case = {
        "text": "Test case",
        "top_k": 25  # Invalid
    }
    
    try:
        response = requests.post(
            f"{API_BASE_URL}/analyze",
            json=test_case,
            timeout=10
        )
        
        if response.status_code == 400:
            print(f"✅ Validation works! Got 400 error as expected")
            print(f"Error message: {response.json()['detail']}")
            return True
        else:
            print(f"❌ Expected 400, got {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print("🧪 Medical Agent API Test Suite")
    print("=" * 50)
    
    results = {
        "health": test_health(),
        "validation": test_invalid_top_k(),
        "analyze": test_analyze()
    }
    
    print("\n" + "=" * 50)
    print("\n📊 Test Results:")
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"  {test_name}: {status}")
    
    all_passed = all(results.values())
    print(f"\n{'✅ All tests passed!' if all_passed else '❌ Some tests failed!'}")
