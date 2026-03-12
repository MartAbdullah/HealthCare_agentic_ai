import { useState, useEffect } from 'react';
import { UploadIcon, Loader2Icon, Edit2Icon, CheckIcon, XIcon, FileTextIcon, CheckCircleIcon } from '../icons';
import Footer from '../components/Footer';

interface ExtractionResult {
  conditions: string[];
  medications: string[];
  condition_codes: Array<{ condition: string; code: string }>;
  medication_codes: Array<{ medication: string; code: string }>;
}

interface ProcessingState {
  threadId: string;
  status: 'idle' | 'processing' | 'awaiting_approval' | 'completed';
  soapDraft: string;
  extractions: ExtractionResult | null;
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

export default function AdvancedAgentPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [storageFiles, setStorageFiles] = useState<string[]>([]);
  const [selectedStorageFiles, setSelectedStorageFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingState, setProcessingState] = useState<ProcessingState>({
    threadId: '',
    status: 'idle',
    soapDraft: '',
    extractions: null,
  });
  const [editedSoap, setEditedSoap] = useState('');
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'upload' | 'storage'>('upload');
  const [showHowItWorks, setShowHowItWorks] = useState(true);
  const [showPatientMenu, setShowPatientMenu] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  // Check localStorage for "Don't show again" preference
  useEffect(() => {
    const dontShow = localStorage.getItem('advanced-dontShowHowItWorks') === 'true';
    setShowHowItWorks(!dontShow);
  }, []);

  // Load storage files on mount
  useEffect(() => {
    const loadStorageFiles = async () => {
      try {
        const response = await fetch('http://localhost:8001/advanced/files');
        if (response.ok) {
          const data = await response.json();
          setStorageFiles(data.files || []);
        }
      } catch (err) {
        console.error('Failed to load storage files:', err);
      }
    };

    loadStorageFiles();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleStorageFileToggle = (filename: string) => {
    setSelectedStorageFiles((prev) =>
      prev.includes(filename)
        ? prev.filter((f) => f !== filename)
        : [...prev, filename]
    );
  };

  const handleProcessUpload = async () => {
    if (files.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = new FormData();
      files.forEach((file) => formData.append('files', file));

      const response = await fetch('http://localhost:8001/advanced/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload error: ${response.statusText}`);
      }

      const data = await response.json();
      setProcessingState({
        threadId: data.thread_id,
        status: 'awaiting_approval',
        soapDraft: data.soap_draft,
        extractions: data,
      });
      setEditedSoap(data.soap_draft);
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessStorage = async () => {
    if (selectedStorageFiles.length === 0) {
      setError('Please select files from storage');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8001/advanced/process-storage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filenames: selectedStorageFiles }),
      });

      if (!response.ok) {
        throw new Error(`Processing error: ${response.statusText}`);
      }

      const data = await response.json();
      setProcessingState({
        threadId: data.thread_id,
        status: 'awaiting_approval',
        soapDraft: data.soap_draft,
        extractions: data,
      });
      setEditedSoap(data.soap_draft);
      setSelectedStorageFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process files');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!processingState.threadId) {
      setError('No active processing thread');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8001/advanced/approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          thread_id: processingState.threadId,
          updated_soap: editedSoap,
        }),
      });

      if (!response.ok) {
        throw new Error(`Approval error: ${response.statusText}`);
      }

      const data = await response.json();
      setProcessingState({
        ...processingState,
        status: 'completed',
        soapDraft: data.final_soap,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve SOAP note');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setProcessingState({
      threadId: '',
      status: 'idle',
      soapDraft: '',
      extractions: null,
    });
    setEditedSoap('');
    setError('');
    setFiles([]);
    setSelectedStorageFiles([]);
  };

  const handleSelectPatient = (patient: Patient) => {
    // For Advanced Agent, we'll create a text file for processing
    const patientFile = new File([patient.caseText], `${patient.name}.txt`, { type: 'text/plain' });
    setFiles([patientFile]);
    setShowPatientMenu(false);
  };

  return (
    <div className="flex flex-col min-h-screen">
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
            <div className="bg-orange-600 border border-orange-500 rounded-lg p-8 shadow-2xl max-w-md">
              <h3 className="font-semibold text-white mb-4 text-lg">How This Works</h3>
              <ol className="text-orange-100 text-sm space-y-3">
                <li>1. <strong>Upload</strong> clinical documents (PDFs, images, text)</li>
                <li>2. <strong>Extract</strong> medical entities and conditions automatically</li>
                <li>3. <strong>Assign</strong> clinical codes to extracted entities</li>
                <li>4. <strong>Draft</strong> SOAP notes with human review and approval</li>
              </ol>
              <div className="mt-6 flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="advanced-dontShow"
                  checked={dontShowAgain}
                  onChange={(e) => {
                    setDontShowAgain(e.target.checked);
                    if (e.target.checked) {
                      localStorage.setItem('advanced-dontShowHowItWorks', 'true');
                      setShowHowItWorks(false);
                    }
                  }}
                  className="w-4 h-4 rounded cursor-pointer"
                />
                <label htmlFor="advanced-dontShow" className="text-orange-200 text-sm cursor-pointer">Don't show again</label>
              </div>
              <p className="text-orange-200 text-xs mt-4 font-semibold text-center cursor-pointer hover:text-white" onClick={() => setShowHowItWorks(false)}>Click anywhere to dismiss</p>
            </div>
          </div>
        </>
      )}
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-3 bg-orange-500/10 border border-orange-500/20 rounded-lg px-4 py-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">03</span>
            </div>
            <span className="text-orange-300 font-semibold">Advanced Agent</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Clinical Document Processing</h1>
          <p className="text-gray-400 text-lg">
            A 5-node pipeline that extracts medical entities, assigns codes, and drafts SOAP notes with human-in-the-loop review.
          </p>
        </div>

        {/* Main Content - Vertical Stack */}
        <div className="space-y-8">
          {/* Upload Section - Full Width Top */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            {/* Header with Title and Tabs */}
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-white">Upload Documents</h2>
              <div className="flex space-x-2">
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

                <div className="flex space-x-2 bg-slate-700 p-1 rounded-lg">
                  <button
                    onClick={() => setActiveTab('upload')}
                    className={`py-2 px-4 rounded font-medium text-sm transition-all ${
                      activeTab === 'upload'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    Upload Files
                  </button>
                  <button
                    onClick={() => setActiveTab('storage')}
                    className={`py-2 px-4 rounded font-medium text-sm transition-all ${
                      activeTab === 'storage'
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-300 hover:text-white'
                    }`}
                  >
                    From Storage
                  </button>
                </div>
              </div>
            </div>

              {processingState.status === 'idle' ? (
                <div className="space-y-6">
                  {/* Upload Tab */}
                  {activeTab === 'upload' && (
                    <div>
                      <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-orange-500 transition-colors cursor-pointer">
                        <label className="cursor-pointer">
                          <div className="flex flex-col items-center space-y-2">
                            <UploadIcon size={32} className="text-orange-400" />
                            <p className="text-white font-semibold">Drop files here</p>
                            <p className="text-sm text-gray-400">or click to select</p>
                            <input
                              type="file"
                              multiple
                              accept=".pdf,.txt,.csv"
                              onChange={handleFileSelect}
                              className="hidden"
                            />
                          </div>
                        </label>
                      </div>
                      {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {files.map((file) => (
                            <div
                              key={file.name}
                              className="bg-slate-700 border border-slate-600 rounded p-3 flex items-center space-x-2"
                            >
                              <FileTextIcon size={18} className="text-orange-400" />
                              <span className="text-sm text-gray-300">{file.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={handleProcessUpload}
                        disabled={loading || files.length === 0}
                        className="w-full mt-6 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <Loader2Icon size={20} className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <UploadIcon size={20} />
                            <span>Process Files</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {/* Storage Tab */}
                  {activeTab === 'storage' && (
                    <div>
                      <p className="text-white font-semibold mb-4">Select from Storage</p>
                      {storageFiles.length > 0 ? (
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {storageFiles.map((file) => (
                            <label key={file} className="flex items-center space-x-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedStorageFiles.includes(file)}
                                onChange={() => handleStorageFileToggle(file)}
                                className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                              />
                              <span className="text-gray-300 text-sm">{file}</span>
                            </label>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400">No files in storage</p>
                      )}
                      <button
                        onClick={handleProcessStorage}
                        disabled={loading || selectedStorageFiles.length === 0}
                        className="w-full mt-6 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <Loader2Icon size={20} className="animate-spin" />
                            <span>Processing...</span>
                          </>
                        ) : (
                          <>
                            <UploadIcon size={20} />
                            <span>Process Selected</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h2 className="text-xl font-bold text-white">Processing Status</h2>
                  <div className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                    <p className="text-sm text-gray-300">
                      <span className="font-semibold">Thread ID:</span><br />
                      <code className="text-xs text-gray-400 break-all">{processingState.threadId}</code>
                    </p>
                  </div>
                  <div className={`border rounded-lg p-4 ${processingState.status === 'completed' ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                    <p className="text-sm font-semibold capitalize">
                      Status: {processingState.status === 'awaiting_approval' ? 'Awaiting Review' : 'Completed'}
                    </p>
                  </div>
                  {processingState.status === 'completed' && (
                    <button
                      onClick={handleReset}
                      className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition-all"
                    >
                      Process Another
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Output Section - Full Width Below */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm shadow-2xl">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-6 mb-6">
                <h3 className="font-semibold text-red-300 mb-1">Error</h3>
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {loading && processingState.status === 'idle' && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                <Loader2Icon size={48} className="animate-spin text-orange-400 mx-auto mb-4" />
                <p className="text-gray-400">
                  Processing clinical documents...<br />
                  <span className="text-sm">Extracting conditions, medications, and generating SOAP note</span>
                </p>
              </div>
            )}

            {processingState.status !== 'idle' && (
              <div className="space-y-6">
                {/* Extractions Overview */}
                {processingState.extractions && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Conditions Found</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {processingState.extractions.conditions?.length || 0}
                      </p>
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                      <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Medications Found</p>
                      <p className="text-2xl font-bold text-orange-400">
                        {processingState.extractions.medications?.length || 0}
                      </p>
                    </div>
                  </div>
                )}

                {/* SOAP Note Editor */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                      <Edit2Icon size={20} className="text-orange-400" />
                      <span>SOAP Note Draft</span>
                    </h3>
                    {processingState.status === 'awaiting_approval' && (
                      <span className="text-xs font-semibold px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
                        Ready for Review
                      </span>
                    )}
                  </div>
                  <textarea
                    value={editedSoap}
                    onChange={(e) => setEditedSoap(e.target.value)}
                    disabled={processingState.status === 'completed'}
                    className="w-full h-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 resize-none disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Action Buttons */}
                {processingState.status === 'awaiting_approval' && (
                  <div className="flex space-x-3">
                    <button
                      onClick={handleApprove}
                      disabled={loading}
                      className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      {loading ? (
                        <>
                          <Loader2Icon size={20} className="animate-spin" />
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <CheckIcon size={20} />
                          <span>Approve & Finalize</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 px-4 rounded-lg transition-all flex items-center justify-center space-x-2"
                    >
                      <XIcon size={20} />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}

                {processingState.status === 'completed' && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-6">
                    <div className="flex items-center space-x-3">
                      <CheckIcon size={24} className="text-green-400" />
                      <div>
                        <p className="font-semibold text-green-300">SOAP Note Finalized</p>
                        <p className="text-sm text-green-200">The clinical document has been processed and approved.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {processingState.status === 'idle' && !loading && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-12 text-center">
                <div className="w-16 h-16 bg-orange-500/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileTextIcon size={32} className="text-orange-400" />
                </div>
                <p className="text-gray-400 mb-4">
                  Upload or select clinical documents to process.
                </p>
                <p className="text-sm text-gray-500">
                  Supported formats: PDF, TXT, CSV
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Pipeline Info */}
        {processingState.status !== 'idle' && (
          <div className="mt-12 bg-orange-500/10 border border-orange-500/30 rounded-lg p-6">
            <h3 className="font-semibold text-orange-300 mb-3">Processing Pipeline</h3>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm">
              {['Condition Extractor', 'Medication Extractor', 'Condition Coder', 'Medication Coder', 'SOAP Drafter'].map(
                (stage, i) => (
                  <div key={i} className="bg-slate-800 border border-slate-700 rounded p-3 text-center">
                    <p className="text-orange-400 font-semibold">{i + 1}</p>
                    <p className="text-gray-300">{stage}</p>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <Footer showNews={false} />
    </div>
  );
}
