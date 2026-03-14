import { useState, useEffect } from 'react';
import { UploadIcon, Loader2Icon, Edit2Icon, CheckIcon, XIcon, FileTextIcon } from '../icons';
import { MdFileUpload, MdNotes, MdLocalPharmacy, MdNumbers, MdEdit, MdDescription } from 'react-icons/md';
import { API_ENDPOINTS } from '../config/api';
import Footer from '../components/Footer';

interface ExtractionResult {
  conditions: string[];
  medications: any[];
  extractions: Array<{
    chunk: string;
    entity_type: string;
    ICD10?: string;
    RxNorm?: string;
  }>;
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

export default function ClinicalDocumentPage() {
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
  const [expandedJsonPanels, setExpandedJsonPanels] = useState<Set<string>>(new Set());
  const [showStatusSnackbar, setShowStatusSnackbar] = useState(false);

  const toggleJsonPanel = (panelId: string) => {
    setExpandedJsonPanels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(panelId)) {
        newSet.delete(panelId);
      } else {
        newSet.add(panelId);
      }
      return newSet;
    });
  };

  // Check localStorage for "Don't show again" preference
  useEffect(() => {
    const dontShow = localStorage.getItem('advanced-dontShowHowItWorks') === 'true';
    setShowHowItWorks(!dontShow);
  }, []);

  // Show status snackbar when awaiting approval
  useEffect(() => {
    if (processingState.status === 'awaiting_approval') {
      setShowStatusSnackbar(true);
    }
  }, [processingState.status]);

  // Load storage files on mount
  useEffect(() => {
    const loadStorageFiles = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.advanced.files);
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

      const response = await fetch(API_ENDPOINTS.advanced.upload, {
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
      const response = await fetch(API_ENDPOINTS.advanced.processStorage, {
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
      const response = await fetch(API_ENDPOINTS.advanced.approve, {
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
    setExpandedJsonPanels(new Set());
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
          {/* Processing Pipeline Timeline */}
          <div className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm shadow-lg">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-8 tracking-widest">Complete Processing Pipeline</h3>
            
            {/* Timeline Container */}
            <div className="relative">
              {/* Connection Line Background */}
              <div className="absolute top-6 left-0 right-0 h-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-full"></div>
              
              {/* Active Progress Line */}
              {processingState.status !== 'idle' && (
                <div
                  className={`absolute top-6 left-0 h-1 bg-gradient-to-r rounded-full transition-all duration-500 ${
                    processingState.status === 'completed'
                      ? 'from-green-500 via-green-400 to-green-500 w-full'
                      : processingState.status === 'awaiting_approval'
                      ? 'from-green-500 via-green-400 via-blue-300 to-blue-300 w-4/5'
                      : 'from-green-500 to-blue-300 w-1/5'
                  }`}
                ></div>
              )}

              {/* Timeline Nodes */}
              <div className="flex justify-between relative z-10">
                {[
                  { id: 0, name: 'Document\nUpload', Icon: MdFileUpload },
                  { id: 1, name: 'Condition\nExtractor', Icon: MdNotes },
                  { id: 2, name: 'Medication\nExtractor', Icon: MdLocalPharmacy },
                  { id: 3, name: 'Condition\nCoder', Icon: MdNumbers },
                  { id: 4, name: 'Medication\nCoder', Icon: MdEdit },
                  { id: 5, name: 'SOAP\nDrafter', Icon: MdDescription },
                ].map((node: any, idx) => {
                  const IconComponent = node.Icon;
                  const isUpload = node.id === 0;
                  const isCompleted =
                    processingState.status === 'completed'
                      ? idx <= 5
                      : processingState.status === 'awaiting_approval'
                      ? idx < 5
                      : false;
                  const isActive = processingState.status !== 'idle' && idx === 1;

                  return (
                    <div key={node.id} className="flex flex-col items-center flex-1">
                      {/* Node Bead */}
                      <div
                        className={`w-14 h-14 rounded-full flex flex-col items-center justify-center font-bold text-center transition-all duration-300 transform hover:scale-110 ${
                          isUpload && processingState.status !== 'idle'
                            ? 'bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-400 text-white shadow-lg shadow-green-500/50 scale-105'
                            : processingState.status === 'idle'
                            ? 'bg-slate-700 border-2 border-slate-600 text-slate-400 shadow-md'
                            : isCompleted
                            ? 'bg-gradient-to-br from-green-500 to-green-600 border-2 border-green-400 text-white shadow-lg shadow-green-500/50 scale-105'
                            : isActive
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-2 border-blue-400 text-white shadow-lg shadow-blue-500/50 animate-pulse'
                            : 'bg-slate-700/50 border-2 border-slate-600/50 text-slate-500'
                        }`}
                      >
                        <IconComponent size={28} />
                      </div>

                      {/* Node Label */}
                      <p
                        className={`text-xs font-semibold mt-3 text-center leading-tight whitespace-pre-line transition-colors duration-300 ${
                          isUpload && processingState.status !== 'idle'
                            ? 'text-green-400'
                            : processingState.status === 'idle'
                            ? 'text-slate-400'
                            : isCompleted
                            ? 'text-green-400'
                            : isActive
                            ? 'text-blue-300 font-bold'
                            : 'text-slate-500'
                        }`}
                      >
                        {node.name}
                      </p>

                      {/* Status Indicator */}
                      {processingState.status !== 'idle' && (
                        <div className="mt-2">
                          {isCompleted ? (
                            <span className="text-[10px] font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">
                              ✓ Done
                            </span>
                          ) : isActive ? (
                            <span className="text-[10px] font-bold text-blue-300 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 animate-pulse">
                              ⏳ Active
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-700/10 px-2 py-0.5 rounded-full border border-slate-600/20">
                              ⏸ Pending
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Status Message */}
            {processingState.status !== 'idle' && (
              <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-between">
                  {processingState.status === 'awaiting_approval' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
                      <p className="text-sm text-blue-300 font-medium">
                        ✓ Pipeline completed — awaiting your review and approval
                      </p>
                    </div>
                  )}
                  {processingState.status === 'completed' && (
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-400"></div>
                      <p className="text-sm text-green-300 font-medium">
                        ✓ All processing steps completed successfully
                      </p>
                    </div>
                  )}
                  {processingState.status === 'awaiting_approval' && (
                    <span className="text-xs font-semibold px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full">
                      Ready for Review
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

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
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Conditions Found</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {processingState.extractions.extractions?.filter(e => e.entity_type === 'medical_condition').length || 0}
                        </p>
                      </div>
                      <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                        <p className="text-xs text-gray-400 font-semibold uppercase mb-2">Medications Found</p>
                        <p className="text-2xl font-bold text-orange-400">
                          {processingState.extractions.extractions?.filter(e => e.entity_type === 'drug').length || 0}
                        </p>
                      </div>
                    </div>

                    {/* Detailed Extractions with Codes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Medical Conditions Table */}
                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="bg-slate-700/50 px-4 py-2 border-b border-slate-700">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Medical Conditions (ICD-10)</h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="text-xs text-gray-400 uppercase bg-slate-800 sticky top-0">
                              <tr>
                                <th className="px-4 py-2">Entity (Chunk)</th>
                                <th className="px-4 py-2 text-right">ICD-10 Code</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                              {processingState.extractions.extractions
                                .filter(e => e.entity_type === 'medical_condition')
                                .map((e, i) => (
                                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-2.5 text-gray-300 font-medium">{e.chunk}</td>
                                    <td className="px-4 py-2.5 text-right">
                                      <span className="bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20 font-mono text-xs">
                                        {e.ICD10 || 'N/A'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              {processingState.extractions.extractions.filter(e => e.entity_type === 'medical_condition').length === 0 && (
                                <tr>
                                  <td colSpan={2} className="px-4 py-4 text-center text-gray-500 italic">No conditions identified</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Medications Table */}
                      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
                        <div className="bg-slate-700/50 px-4 py-2 border-b border-slate-700">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Medications (RxNorm)</h4>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          <table className="w-full text-left text-sm">
                            <thead className="text-xs text-gray-400 uppercase bg-slate-800 sticky top-0">
                              <tr>
                                <th className="px-4 py-2">Entity (Chunk)</th>
                                <th className="px-4 py-2 text-right">RxNorm Code</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                              {processingState.extractions.extractions
                                .filter(e => e.entity_type === 'drug')
                                .map((e, i) => (
                                  <tr key={i} className="hover:bg-slate-700/30 transition-colors">
                                    <td className="px-4 py-2.5 text-gray-300 font-medium">{e.chunk}</td>
                                    <td className="px-4 py-2.5 text-right">
                                      <span className="bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 font-mono text-xs">
                                        {e.RxNorm || 'N/A'}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              {processingState.extractions.extractions.filter(e => e.entity_type === 'drug').length === 0 && (
                                <tr>
                                  <td colSpan={2} className="px-4 py-4 text-center text-gray-500 italic">No medications identified</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Raw JSON Panels */}
                    <div className="space-y-2 border-t border-slate-700 pt-4 mt-4">
                      {/* Conditions JSON Panel */}
                      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleJsonPanel('conditions-json')}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors text-left"
                        >
                          <span className="text-sm font-semibold text-gray-300">
                            📋 View Raw Conditions JSON
                          </span>
                          <span className={`text-gray-400 transition-transform ${expandedJsonPanels.has('conditions-json') ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        {expandedJsonPanels.has('conditions-json') && (
                          <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700/50">
                            <pre className="text-xs text-gray-400 overflow-x-auto bg-slate-800 p-3 rounded border border-slate-700 max-h-40 overflow-y-auto">
                              {JSON.stringify(
                                processingState.extractions.extractions.filter(
                                  e => e.entity_type === 'medical_condition'
                                ),
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                      </div>

                      {/* Medications JSON Panel */}
                      <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg overflow-hidden">
                        <button
                          onClick={() => toggleJsonPanel('medications-json')}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-700/30 transition-colors text-left"
                        >
                          <span className="text-sm font-semibold text-gray-300">
                            💊 View Raw Medications JSON
                          </span>
                          <span className={`text-gray-400 transition-transform ${expandedJsonPanels.has('medications-json') ? 'rotate-180' : ''}`}>
                            ▼
                          </span>
                        </button>
                        {expandedJsonPanels.has('medications-json') && (
                          <div className="px-4 py-3 bg-slate-900/50 border-t border-slate-700/50">
                            <pre className="text-xs text-gray-400 overflow-x-auto bg-slate-800 p-3 rounded border border-slate-700 max-h-40 overflow-y-auto">
                              {JSON.stringify(
                                processingState.extractions.extractions.filter(
                                  e => e.entity_type === 'drug'
                                ),
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
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
      </div>

      {/* Status Snackbar */}
      {showStatusSnackbar && processingState.status === 'awaiting_approval' && (
        <>
          {/* Overlay - Click anywhere to dismiss */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setShowStatusSnackbar(false)}
          ></div>
          {/* Snackbar */}
          <div 
            className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 hover:shadow-2xl transition-all cursor-pointer"
            onClick={() => setShowStatusSnackbar(false)}
          >
            <div className="bg-yellow-600 border border-yellow-500 rounded-lg p-6 shadow-2xl flex items-center space-x-4">
              <div className="w-2 h-2 rounded-full bg-yellow-200 animate-pulse"></div>
              <p className="text-yellow-50 font-semibold">Status: Awaiting Review</p>
              <p className="text-yellow-200 text-xs ml-2">Click anywhere to dismiss</p>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <Footer showNews={false} />
    </div>
  );
}
