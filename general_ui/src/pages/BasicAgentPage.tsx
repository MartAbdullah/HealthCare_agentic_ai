import { useState, useEffect } from 'react';
import { SendIcon, Loader2Icon, CheckCircleIcon, AlertCircleIcon } from '../icons';

interface AnalysisResult {
  final_summary: string;
  history: string[];
  status?: string;
}

interface Patient {
  id: string;
  name: string;
  condition: string;
  caseId: string;
  caseText: string;
}

const PATIENTS: Record<string, Patient> = {
  patient1: {
    id: 'PAT-2026-00451',
    name: 'James Wilson (Acute Meningitis)',
    condition: 'Acute Meningitis',
    caseId: 'case1',
    caseText: 'Patient is a 45-year-old male with a 3-day history of:\n- Severe headache (9/10 intensity), photophobia, neck stiffness\n- Nausea and one episode of vomiting\n- Temperature 38.7°C, HR 94\n- CBC: WBC 14,200 (elevated), neutrophils 85%\n- CSF: cloudy, protein elevated, glucose low',
  },
  patient2: {
    id: 'PAT-2026-00452',
    name: 'Margaret Thompson (Heart Failure)',
    condition: 'Decompensated Heart Failure',
    caseId: 'case2',
    caseText: '68-year-old female with a 2-week history of progressive shortness of breath,\nbilateral leg swelling, and orthopnea. She reports a 5 kg weight gain over\nthe past month. Past medical history: hypertension, type 2 diabetes.\nMedications: metformin, amlodipine. Exam: JVP elevated, bilateral crackles,\npitting edema to knees. ECG: sinus tachycardia, LBBB.\nBNP: 1,450 pg/mL (elevated). CXR: cardiomegaly, pulmonary congestion.',
  },
  patient3: {
    id: 'PAT-2026-00453',
    name: 'Sarah Anderson (Hypothyroidism)',
    condition: 'Primary Hypothyroidism',
    caseId: 'case3',
    caseText: 'Patient: 58-year-old female\nChief complaint: fatigue, weight gain, cold intolerance\n\nHistory: 6-month history of progressive fatigue, 8 kg weight gain, constipation,\ncold intolerance, and dry skin. No chest pain or dyspnea.\n\nMedications: atorvastatin 40 MG Oral, lisinopril 10 MG Oral\n\nExam: HR 58, BP 138/88, BMI 31. Skin dry, hair brittle, delayed reflexes.\nThyroid: diffusely enlarged, non-tender.\n\nLabs: TSH 18.4 mIU/L (elevated), Free T4 0.5 ng/dL (low), Total cholesterol 268 mg/dL',
  },
};

export default function BasicAgentPage() {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const [showPatientMenu, setShowPatientMenu] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check localStorage for "Don't show again" preference
  useEffect(() => {
    const dontShow = localStorage.getItem('basic-dontShowHowItWorks') === 'true';
    setShowHowItWorks(!dontShow);
  }, []);

  useEffect(() => {
    if (showSnackbar) {
      const timer = setTimeout(() => setShowSnackbar(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);

  const handleAnalyze = async () => {
    if (!symptoms.trim()) {
      setError('Please enter patient symptoms');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:8001/basic/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: symptoms }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      // Determine status from history (last CRITIC message)
      const lastCritic = data.history.reverse().find((msg: string) => msg.includes('[CRITIC]'));
      const isApproved = lastCritic?.includes('approved=True') || lastCritic?.includes('is_approved": true');
      
      setResult({
        ...data,
        status: isApproved ? 'approved' : 'in review'
      });
      
      // Show snackbar
      setSnackbarMessage(isApproved ? 'Summary approved!' : 'Summary in review');
      setShowSnackbar(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze symptoms');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setResult(null);
    setError('');
    setShowSnackbar(false);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSymptoms(patient.caseText);
    setShowPatientMenu(false);
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8 overflow-auto">
      {/* Snackbar */}
      {showSnackbar && (
        <div className="fixed top-0 left-1/2 transform -translate-x-1/2 z-50 mt-4">
          <div className={`px-6 py-3 rounded-lg shadow-lg text-white font-semibold flex items-center space-x-2 ${
            snackbarMessage.includes('approved') 
              ? 'bg-green-600' 
              : 'bg-yellow-600'
          }`}>
            <CheckCircleIcon size={20} />
            <span>{snackbarMessage}</span>
          </div>
        </div>
      )}

      {/* How It Works Snackbar */}
      {showHowItWorks && (
        <>
          {/* Overlay Background */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" 
            onClick={() => setShowHowItWorks(false)}
          />
          {/* Centered Snackbar */}
          <div 
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 hover:shadow-2xl transition-all"
          >
            <div className="bg-blue-600 border border-blue-500 rounded-lg p-8 shadow-2xl max-w-md">
              <h3 className="font-semibold text-white mb-4 text-lg">How This Works</h3>
              <ol className="text-blue-100 text-sm space-y-3">
                <li>1. <strong>Generator</strong> creates a medical summary from symptoms</li>
                <li>2. <strong>Critic</strong> reviews it for safety and accuracy</li>
                <li>3. If rejected, Generator refines the draft using feedback</li>
                <li>4. Loop continues until summary is approved (max 5 iterations)</li>
              </ol>
              <div className="mt-6 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="basic-dontShow"
                  checked={dontShowAgain}
                  onChange={(e) => {
                    setDontShowAgain(e.target.checked);
                    if (e.target.checked) {
                      localStorage.setItem('basic-dontShowHowItWorks', 'true');
                      setShowHowItWorks(false);
                    }
                  }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="basic-dontShow" className="text-blue-200 text-sm cursor-pointer">Don't show again</label>
              </div>
              <p className="text-blue-200 text-xs mt-4 font-semibold text-center cursor-pointer hover:text-white" onClick={() => setShowHowItWorks(false)}>Click anywhere to dismiss</p>
            </div>
          </div>
        </>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-3 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">01</span>
            </div>
            <span className="text-blue-300 font-semibold">Basic Agent</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Medical Summary Generator</h1>
          <p className="text-gray-400 text-lg">
            A two-agent reflection loop that generates and critiques a medical summary until it is approved.
          </p>
        </div>

        {/* Main Content - Vertical Layout */}
        <div className="space-y-8">
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6">
              <div className="flex items-start space-x-4">
                <AlertCircleIcon size={24} className="text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-300 mb-1">Error</h3>
                  <p className="text-red-200">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* 1. Patient Symptoms Section */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Patient Symptoms</h2>
              <div className="flex space-x-2 relative">
                {/* Select Patient Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowPatientMenu(!showPatientMenu)}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center space-x-2"
                  >
                    <span>👤 Select Patient</span>
                  </button>
                  
                  {showPatientMenu && (
                    <>
                      {/* Dropdown Overlay */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPatientMenu(false)}
                      />
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-64 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-50">
                        {Object.values(PATIENTS).map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg transition-all border-b border-slate-600 last:border-b-0"
                          >
                            <p className="text-white font-semibold">{patient.name}</p>
                            <p className="text-gray-400 text-sm">{patient.condition}</p>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !symptoms.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition-all flex items-center space-x-2"
                >
                  {loading ? (
                    <>
                      <Loader2Icon size={18} className="animate-spin" />
                      <span>Analyzing...</span>
                    </>
                  ) : (
                    <>
                      <SendIcon size={18} />
                      <span>Analyze</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleReset}
                  className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Enter patient symptoms and medical history..."
                className="w-full h-80 bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <Loader2Icon size={48} className="animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-400">
                Running reflection loop...<br />
                <span className="text-sm">Generating and critiquing summary</span>
              </p>
            </div>
          )}

          {/* 2. Generated Summary Section */}
          {result && !loading && (
            <>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Generated Summary</h3>
                <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{result.final_summary}</p>
                </div>
              </div>

              {/* 3. Agent Thinking History Section */}
              {result.history && result.history.length > 0 && (
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Agent Thinking History</h3>
                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4 space-y-2 max-h-80 overflow-y-auto">
                    {result.history.map((msg, idx) => (
                      <p key={idx} className="text-gray-300 text-sm font-mono">{msg}</p>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Empty State */}
          {!result && !loading && !error && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
              <div className="w-16 h-16 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">📋</span>
              </div>
              <p className="text-gray-400">
                Enter patient symptoms to generate a medical summary with AI validation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
