import { useState, useEffect } from 'react';
import { SendIcon, Loader2Icon, UsersIcon } from '../icons';
import { API_ENDPOINTS } from '../config/api';

interface SpecialistAnalysis {
  specialist: string;
  assessment: string;
}

interface AnalysisResult {
  case_summary: string;
  specialist_assessments: SpecialistAnalysis[];
  unified_summary: string;
  specialists_count: number;
}

interface SpecialistConsultationPageProps {
  specialistsCount: number;
}

interface Patient {
  id: string;
  name: string;
  condition: string;
  caseId: string;
  caseText: string;
  avatar: string;
}

const PATIENTS: Record<string, Patient> = {
  patient1: {
    id: 'PAT-2026-00451',
    name: 'James Wilson (Acute Meningitis)',
    condition: 'Acute Meningitis',
    caseId: 'case1',
    caseText: 'Patient is a 45-year-old male with a 3-day history of:\n- Severe headache (9/10 intensity), photophobia, neck stiffness\n- Nausea and one episode of vomiting\n- Temperature 38.7°C, HR 94\n- CBC: WBC 14,200 (elevated), neutrophils 85%\n- CSF: cloudy, protein elevated, glucose low',
    avatar: 'https://i.pravatar.cc/160?img=1',
  },
  patient2: {
    id: 'PAT-2026-00452',
    name: 'Margaret Thompson (Heart Failure)',
    condition: 'Decompensated Heart Failure',
    caseId: 'case2',
    caseText: '68-year-old female with a 2-week history of progressive shortness of breath,\nbilateral leg swelling, and orthopnea. She reports a 5 kg weight gain over\nthe past month. Past medical history: hypertension, type 2 diabetes.\nMedications: metformin, amlodipine. Exam: JVP elevated, bilateral crackles,\npitting edema to knees. ECG: sinus tachycardia, LBBB.\nBNP: 1,450 pg/mL (elevated). CXR: cardiomegaly, pulmonary congestion.',
    avatar: 'https://i.pravatar.cc/160?img=47',
  },
  patient3: {
    id: 'PAT-2026-00453',
    name: 'Sarah Anderson (Hypothyroidism)',
    condition: 'Primary Hypothyroidism',
    caseId: 'case3',
    caseText: 'Patient: 58-year-old female\nChief complaint: fatigue, weight gain, cold intolerance\n\nHistory: 6-month history of progressive fatigue, 8 kg weight gain, constipation,\ncold intolerance, and dry skin. No chest pain or dyspnea.\n\nMedications: atorvastatin 40 MG Oral, lisinopril 10 MG Oral\n\nExam: HR 58, BP 138/88, BMI 31. Skin dry, hair brittle, delayed reflexes.\nThyroid: diffusely enlarged, non-tender.\n\nLabs: TSH 18.4 mIU/L (elevated), Free T4 0.5 ng/dL (low), Total cholesterol 268 mg/dL',
    avatar: 'https://i.pravatar.cc/160?img=42',
  },
};

// Specialist Database with Descriptions
const SPECIALIST_DATABASE: Record<string, { fullName: string; description: string; emoji: string; color: string }> = {
  'General Practitioner': { fullName: 'Dr. Sarah Johnson', description: 'Primary Care & Medical Assessment Specialist', emoji: '👨‍⚕️', color: 'from-blue-400 to-blue-500' },
  'Cardiologist': { fullName: 'Dr. Sarah Mitchell', description: 'Heart & Cardiovascular System Specialist', emoji: '❤️', color: 'from-red-500 to-red-600' },
  'Nephrologist': { fullName: 'Dr. Ahmed Hassan', description: 'Kidney & Renal System Specialist', emoji: '🫘', color: 'from-blue-500 to-blue-600' },
  'Endocrinologist': { fullName: 'Dr. Emily Johnson', description: 'Metabolic & Hormonal Disorders Specialist', emoji: '⚗️', color: 'from-purple-500 to-purple-600' },
  'Clinical Pharmacist': { fullName: 'Dr. Michael Chen', description: 'Medication & Drug Therapy Expert', emoji: '💊', color: 'from-green-500 to-green-600' },
  'Pulmonologist': { fullName: 'Dr. Lisa Anderson', description: 'Respiratory & Lung System Specialist', emoji: '💨', color: 'from-cyan-500 to-cyan-600' },
  'Geriatrician': { fullName: 'Dr. Robert Williams', description: 'Elderly Health & Aging Specialist', emoji: '👴', color: 'from-amber-500 to-amber-600' },
  'Neurologist': { fullName: 'Dr. James Brown', description: 'Nervous System & Brain Specialist', emoji: '🧠', color: 'from-violet-500 to-violet-600' },
  'Psychiatrist': { fullName: 'Dr. Maria Garcia', description: 'Mental Health & Psychology Specialist', emoji: '🧘', color: 'from-pink-500 to-pink-600' },
  'Rheumatologist': { fullName: 'Dr. David Kumar', description: 'Autoimmune & Joint Disorders Specialist', emoji: '🦴', color: 'from-orange-500 to-orange-600' },
  'Radiologist': { fullName: 'Dr. Emma Thompson', description: 'Medical Imaging & Diagnostics Expert', emoji: '🖼️', color: 'from-slate-500 to-slate-600' },
  'Hematologist': { fullName: 'Dr. Robert Kumar', description: 'Blood Disorders & Hematology Specialist', emoji: '🩸', color: 'from-red-600 to-red-700' },
  'Oncologist': { fullName: 'Dr. David Thompson', description: 'Cancer & Malignancy Specialist', emoji: '🎯', color: 'from-indigo-500 to-indigo-600' },
  'Infectious Disease Specialist': { fullName: 'Dr. Jennifer Brown', description: 'Infection & Antimicrobial Therapy Expert', emoji: '🦠', color: 'from-yellow-500 to-yellow-600' },
  'Vascular Surgeon': { fullName: 'Dr. Thomas Garcia', description: 'Vascular Pathology & Surgery Specialist', emoji: '🩺', color: 'from-rose-500 to-rose-600' },
  'Cardiothoracic Surgeon': { fullName: 'Dr. William Foster', description: 'Cardiac & Thoracic Surgery Specialist', emoji: '🏥', color: 'from-red-400 to-red-600' },
  'Dietitian': { fullName: 'Dr. Amanda Clark', description: 'Nutritional Assessment & Dietary Expert', emoji: '🥗', color: 'from-green-400 to-green-500' },
  'Physiotherapist': { fullName: 'Dr. Christopher Scott', description: 'Physical Rehabilitation & Function Expert', emoji: '🏃', color: 'from-teal-500 to-teal-600' },
  'Palliative Care Specialist': { fullName: 'Dr. Michelle Green', description: 'Symptom Management & Quality of Life Expert', emoji: '🌸', color: 'from-pink-400 to-pink-600' },
  'Emergency Physician': { fullName: 'Dr. Richard Moore', description: 'Acute & Emergency Medicine Specialist', emoji: '🚑', color: 'from-red-600 to-red-700' },
};

export default function SpecialistConsultationPage({ specialistsCount }: SpecialistConsultationPageProps) {
  const [medicalCase, setMedicalCase] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [popupSpec, setPopupSpec] = useState<string | null>(null);
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const [showPatientMenu, setShowPatientMenu] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check localStorage for "Don't show again" preference
  useEffect(() => {
    const dontShow = localStorage.getItem('intermediate-dontShowHowItWorks') === 'true';
    setShowHowItWorks(!dontShow);
  }, []);

  // Auto-hide snackbar after 5 seconds
  useEffect(() => {
    if (popupSpec) {
      const timer = setTimeout(() => {
        setPopupSpec(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [popupSpec]);

  const handleAnalyze = async () => {
    if (!medicalCase.trim()) {
      setError('Please enter a medical case');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);
    setActiveTab(null);

    try {
      const response = await fetch(API_ENDPOINTS.intermediate.analyze, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          case: medicalCase,
          top_k: specialistsCount,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      if (data.specialist_assessments?.length > 0) {
        setActiveTab(data.specialist_assessments[0].specialist);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze case');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMedicalCase('');
    setResult(null);
    setError('');
    setActiveTab(null);
  };

  const handleSelectPatient = (patient: Patient) => {
    setMedicalCase(patient.caseText);
    setShowPatientMenu(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 px-4 py-12 sm:px-6 lg:px-8 overflow-auto">
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
            <div className="bg-purple-600 border border-purple-500 rounded-lg p-8 shadow-2xl max-w-md">
              <h3 className="font-semibold text-white mb-4 text-lg">How This Works</h3>
              <ol className="text-purple-100 text-sm space-y-3">
                <li>1. <strong>Input</strong> a patient case description</li>
                <li>2. <strong>AI routes</strong> case to relevant specialists</li>
                <li>3. <strong>Each specialist</strong> analyzes from their perspective</li>
                <li>4. <strong>Unified assessment</strong> combines all expert insights</li>
              </ol>
              <div className="mt-6 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="intermediate-dontShow"
                  checked={dontShowAgain}
                  onChange={(e) => {
                    setDontShowAgain(e.target.checked);
                    if (e.target.checked) {
                      localStorage.setItem('intermediate-dontShowHowItWorks', 'true');
                      setShowHowItWorks(false);
                    }
                  }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="intermediate-dontShow" className="text-purple-200 text-sm cursor-pointer">Don't show again</label>
              </div>
              <p className="text-purple-200 text-xs mt-4 font-semibold text-center cursor-pointer hover:text-white" onClick={() => setShowHowItWorks(false)}>Click anywhere to dismiss</p>
            </div>
          </div>
        </>
      )}

      <div className="px-4 py-12 sm:px-6 lg:px-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-16">
            <div className="inline-flex items-center space-x-3 bg-purple-500/20 border border-purple-500/40 rounded-full px-6 py-3 mb-6 backdrop-blur-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">02</span>
              </div>
              <span className="text-purple-200 font-semibold text-sm">Multi-Specialist Agent</span>
            </div>

            <h1 className="text-5xl font-bold text-white mb-4 leading-tight">Medical Case Analysis</h1>
            <p className="text-gray-300 text-lg max-w-2xl">
              Enter a patient case and let AI specialists analyze it in parallel. Get comprehensive, multi-perspective medical insights.
            </p>
          </div>

          {/* Patient Case Card */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm shadow-2xl mb-8">
            <div className="flex justify-between items-center mb-6">
              <label className="text-white font-bold text-lg">Patient Case</label>
              <div className="flex space-x-2 relative">
                {/* Select Patient Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowPatientMenu(!showPatientMenu)}
                    className="bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-6 rounded-xl transition-all flex items-center space-x-2"
                  >
                    <span style={{ filter: 'brightness(0) invert(1)' }}>👤</span> Select Patient
                  </button>
                  
                  {showPatientMenu && (
                    <>
                      {/* Dropdown Overlay */}
                      <div 
                        className="fixed inset-0 z-40"
                        onClick={() => setShowPatientMenu(false)}
                      />
                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-80 bg-slate-700 border border-slate-600 rounded-lg shadow-xl z-50">
                        {Object.values(PATIENTS).map((patient) => (
                          <button
                            key={patient.id}
                            onClick={() => handleSelectPatient(patient)}
                            className="w-full text-left px-4 py-3 hover:bg-slate-600 first:rounded-t-lg last:rounded-b-lg transition-all border-b border-slate-600 last:border-b-0"
                          >
                            <div className="flex items-center space-x-3">
                              <img 
                                src={patient.avatar} 
                                alt={patient.name}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                              />
                              <div className="flex-1">
                                <p className="text-white font-semibold">{patient.name}</p>
                                <p className="text-gray-400 text-sm">{patient.condition}</p>
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading || !medicalCase.trim()}
                  className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-xl transition-all transform hover:scale-105 active:scale-95 flex items-center space-x-2 shadow-lg"
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
                  className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-6 rounded-xl transition-all"
                >
                  Reset
                </button>
              </div>
            </div>
            
            <div>
              <textarea
                value={medicalCase}
                onChange={(e) => setMedicalCase(e.target.value)}
                placeholder="68-year-old female with shortness of breath, bilateral leg swelling, and weight gain. PMH: hypertension, type 2 diabetes..."
                className="w-full h-64 bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/30 resize-none transition-all backdrop-blur-sm"
              />
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-8">
            {loading && (
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-16 text-center backdrop-blur-sm">
                <Loader2Icon size={64} className="animate-spin text-purple-400 mx-auto mb-6" />
                <p className="text-gray-300 text-xl font-semibold">
                  Analyzing case with {specialistsCount} specialist{specialistsCount !== 1 ? 's' : ''}...
                </p>
                <p className="text-gray-400 text-sm mt-3">Running specialist analyses in parallel</p>
              </div>
            )}

          {result && !loading && (
            <div className="space-y-8">
              {/* Case Overview - Full Width */}
              <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                <div className="flex items-start space-x-3 mb-4">
                  <div className="text-2xl">📋</div>
                  <h3 className="text-2xl font-bold text-white">Case Overview</h3>
                </div>
                <p className="text-gray-300 leading-relaxed text-base">{result.case_summary}</p>
              </div>

              {/* Specialist Assessments - Full Width */}
              {result.specialist_assessments && result.specialist_assessments.length > 0 && (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <UsersIcon size={28} className="text-purple-400" />
                    <h3 className="text-2xl font-bold text-white">
                      Specialist Assessments 
                      <span className="text-purple-400 ml-3">({result.specialists_count})</span>
                    </h3>
                  </div>

                  {/* Tabs - Full Width */}
                  <div className="flex flex-wrap gap-2 mb-6 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30 backdrop-blur-sm overflow-visible relative">
                    {result.specialist_assessments.map((assessment) => {
                      return (
                        <div key={assessment.specialist} className="relative">
                          <button
                            onClick={() => {
                              setActiveTab(assessment.specialist);
                              setPopupSpec(assessment.specialist);
                            }}
                            className={`px-5 py-2 rounded-lg font-semibold text-sm transition-all whitespace-nowrap ${
                              activeTab === assessment.specialist
                                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg'
                                : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50'
                            }`}
                          >
                            {assessment.specialist}
                          </button>

                          {/* Popup Card - Shows on click */}
                          {popupSpec === assessment.specialist && (
                            <>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Tab Content - Full Width */}
                  {activeTab && (
                    <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm animate-fadeIn">
                      {result.specialist_assessments
                        .filter((a) => a.specialist === activeTab)
                        .map((assessment) => (
                          <div key={assessment.specialist}>
                            <h4 className="text-2xl font-bold text-purple-400 mb-4">{assessment.specialist}</h4>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap text-base">
                              {assessment.assessment}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {/* Unified Summary - Full Width */}
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="text-2xl">✨</div>
                  <h3 className="text-2xl font-bold text-white">Unified Assessment</h3>
                </div>
                <div className="bg-gradient-to-r from-purple-600/20 via-purple-600/10 to-transparent border border-purple-500/40 rounded-2xl p-8 backdrop-blur-sm">
                  <p className="text-gray-200 leading-relaxed whitespace-pre-wrap text-base">
                    {result.unified_summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {!result && !loading && !error && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/20 border border-slate-700/30 rounded-2xl p-16 text-center backdrop-blur-sm">
              <div className="text-6xl mb-4">🏥</div>
              <p className="text-gray-400 text-lg">
                Enter a medical case above to get started
              </p>
            </div>
          )}
          </div>
        </div>
      </div>

      {/* Snackbar - Top Center (Always on top, page level) */}
      {popupSpec && result?.specialist_assessments && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 pointer-events-auto" style={{
          animation: 'snackbarSlideDown 0.4s ease-out forwards',
          zIndex: 9999
        }}>
          <style>{`
            @keyframes snackbarSlideDown {
              from {
                opacity: 0;
                transform: translateY(-20px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
          {(() => {
            const assessment = result.specialist_assessments.find((a) => a.specialist === popupSpec);
            const specInfo = SPECIALIST_DATABASE[popupSpec] || {
              fullName: 'Dr. Medical Specialist',
              description: 'Medical Specialist',
              emoji: '👨‍⚕️',
              color: 'from-blue-500 to-blue-600',
            };
            return assessment ? (
              <div className={`bg-gradient-to-br ${specInfo.color} rounded-xl p-6 text-white shadow-2xl max-w-md border border-white/30 pointer-events-auto`}>
                <div className="flex items-start gap-4">
                  <span className="text-5xl flex-shrink-0">{specInfo.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-white mb-1">{specInfo.fullName}</h4>
                    <p className="text-sm font-semibold text-white/95 mb-2">{popupSpec}</p>
                    <p className="text-xs text-white/85 leading-relaxed">{specInfo.description}</p>
                  </div>
                </div>
              </div>
            ) : null;
          })()}
        </div>
      )}

      {/* Error Container - Bottom Fixed */}
      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-2xl w-full mx-auto pointer-events-auto">
          <div className="bg-red-500/15 border border-red-500/40 rounded-2xl p-8 backdrop-blur-sm">
            <div className="flex items-start space-x-4">
              <div className="text-3xl">⚠️</div>
              <div>
                <h3 className="font-bold text-red-300 mb-1 text-lg">Analysis Error</h3>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
