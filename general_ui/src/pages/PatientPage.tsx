import { useState } from 'react';
import { UserIcon, CalendarIcon, FileTextIcon, HeartIcon } from '../icons';
import Footer from '../components/Footer';

export default function PatientPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [copiedCase, setCopiedCase] = useState<string | null>(null);

  const exampleCases = [
    {
      id: 'case1',
      title: 'Acute Meningitis',
      pageType: 'Patient Intake',
      color: 'blue',
      icon: '🧠',
      description: '45-year-old male with severe headache, photophobia, and neck stiffness',
      text: 'Patient is a 45-year-old male with a 3-day history of:\n- Severe headache (9/10 intensity), photophobia, neck stiffness\n- Nausea and one episode of vomiting\n- Temperature 38.7°C, HR 94\n- CBC: WBC 14,200 (elevated), neutrophils 85%\n- CSF: cloudy, protein elevated, glucose low',
    },
    {
      id: 'case2',
      title: 'Decompensated Heart Failure',
      pageType: 'Specialist Consultation',
      color: 'purple',
      icon: '❤️',
      description: '68-year-old female with progressive dyspnea, leg swelling, and orthopnea',
      text: '68-year-old female with a 2-week history of progressive shortness of breath,\nbilateral leg swelling, and orthopnea. She reports a 5 kg weight gain over\nthe past month. Past medical history: hypertension, type 2 diabetes.\nMedications: metformin, amlodipine. Exam: JVP elevated, bilateral crackles,\npitting edema to knees. ECG: sinus tachycardia, LBBB.\nBNP: 1,450 pg/mL (elevated). CXR: cardiomegaly, pulmonary congestion.',
    },
    {
      id: 'case3',
      title: 'Primary Hypothyroidism',
      pageType: 'Clinical Document',
      color: 'orange',
      icon: '⚙️',
      description: '58-year-old female with fatigue, weight gain, and cold intolerance',
      text: 'Patient: 58-year-old female\nChief complaint: fatigue, weight gain, cold intolerance\n\nHistory: 6-month history of progressive fatigue, 8 kg weight gain, constipation,\ncold intolerance, and dry skin. No chest pain or dyspnea.\n\nMedications: atorvastatin 40 MG Oral, lisinopril 10 MG Oral\n\nExam: HR 58, BP 138/88, BMI 31. Skin dry, hair brittle, delayed reflexes.\nThyroid: diffusely enlarged, non-tender.\n\nLabs: TSH 18.4 mIU/L (elevated), Free T4 0.5 ng/dL (low), Total cholesterol 268 mg/dL',
    },
  ];

  const copyToClipboard = (text: string, caseId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCase(caseId);
    setTimeout(() => setCopiedCase(null), 2000);
  };

  const [selectedPatient, setSelectedPatient] = useState('patient1');

  const patientProfiles = {
    patient1: {
      id: 'PAT-2026-00451',
      name: 'James Wilson',
      avatarUrl: 'https://i.pravatar.cc/160?img=1',
      age: 45,
      bloodType: 'O+',
      gender: 'Male',
      allergies: ['Penicillin', 'Latex', 'Sulfonamides'],
      medications: ['No current medications'],
      lastCheckup: '2026-03-08',
      nextAppointment: '2026-03-15',
      condition: 'Acute Meningitis',
      severity: 'Critical',
      colorBg: 'from-blue-500/20 to-blue-400/10',
      colorBorder: 'border-blue-500/30',
      colorText: 'text-blue-400',
      caseId: 'case1',
      medicalHistory: [
        {
          date: '2026-03-12',
          condition: 'Severe Headache with Photophobia',
          treatment: 'CSF analysis performed, meningitis suspected - urgent hospitalization',
          specialist: 'Dr. Robert Lee (Infectious Disease)',
        },
        {
          date: '2026-03-11',
          condition: 'High Fever (38.7°C) & Neck Stiffness',
          treatment: 'Emergency room evaluation, CBC performed (WBC 14,200)',
          specialist: 'Dr. Jennifer Smith (Emergency)',
        },
        {
          date: '2026-02-15',
          condition: 'Annual Physical Exam',
          treatment: 'General health checkup - no abnormalities',
          specialist: 'Dr. Michael Chen',
        },
      ],
      appointments: [
        {
          id: 1,
          date: '2026-03-13',
          time: '09:00 AM',
          specialist: 'Dr. Robert Lee',
          specialty: 'Infectious Disease',
          status: 'Urgent',
        },
        {
          id: 2,
          date: '2026-03-15',
          time: '02:00 PM',
          specialist: 'Dr. Susan Williams',
          specialty: 'Neurology',
          status: 'Scheduled',
        },
      ],
    },
    patient2: {
      id: 'PAT-2026-00452',
      name: 'Margaret Thompson',
      avatarUrl: 'https://i.pravatar.cc/160?img=47',
      age: 68,
      bloodType: 'A-',
      gender: 'Female',
      allergies: ['Sulfonamides'],
      medications: ['Metformin 500mg', 'Amlodipine 5mg', 'Furosemide 20mg', 'Lisinopril 10mg'],
      lastCheckup: '2026-02-28',
      nextAppointment: '2026-03-22',
      condition: 'Decompensated Heart Failure',
      severity: 'High',
      colorBg: 'from-purple-500/20 to-purple-400/10',
      colorBorder: 'border-purple-500/30',
      colorText: 'text-purple-400',
      caseId: 'case2',
      medicalHistory: [
        {
          date: '2026-03-10',
          condition: 'Shortness of Breath & Bilateral Leg Swelling',
          treatment: 'Echocardiogram ordered, BNP 1,450 pg/mL (elevated), CXR shows cardiomegaly',
          specialist: 'Dr. James Anderson (Cardiology)',
        },
        {
          date: '2026-02-28',
          condition: 'Hypertension & Type 2 Diabetes',
          treatment: 'Medication adjustment, weight monitoring, dietary consultation',
          specialist: 'Dr. Patricia Davis (Internal Medicine)',
        },
        {
          date: '2025-10-15',
          condition: 'Type 2 Diabetes Management',
          treatment: 'Regular glucose monitoring and medication review',
          specialist: 'Dr. Michael Chen (Endocrinology)',
        },
      ],
      appointments: [
        {
          id: 1,
          date: '2026-03-15',
          time: '10:00 AM',
          specialist: 'Dr. James Anderson',
          specialty: 'Cardiology',
          status: 'Scheduled',
        },
        {
          id: 2,
          date: '2026-03-22',
          time: '03:30 PM',
          specialist: 'Dr. Patricia Davis',
          specialty: 'Internal Medicine',
          status: 'Pending',
        },
      ],
    },
    patient3: {
      id: 'PAT-2026-00453',
      name: 'Sarah Anderson',
      avatarUrl: 'https://i.pravatar.cc/160?img=42',
      age: 58,
      bloodType: 'B+',
      gender: 'Female',
      allergies: ['None reported'],
      medications: ['Atorvastatin 40mg', 'Lisinopril 10mg', 'Levothyroxine 50mcg'],
      lastCheckup: '2026-02-20',
      nextAppointment: '2026-03-25',
      condition: 'Primary Hypothyroidism',
      severity: 'Moderate',
      colorBg: 'from-orange-500/20 to-orange-400/10',
      colorBorder: 'border-orange-500/30',
      colorText: 'text-orange-400',
      caseId: 'case3',
      medicalHistory: [
        {
          date: '2026-03-08',
          condition: 'Fatigue, Weight Gain & Cold Intolerance',
          treatment: 'TSH 18.4 mIU/L (elevated), Free T4 0.5 ng/dL (low) - primary hypothyroidism confirmed',
          specialist: 'Dr. Elizabeth Taylor (Endocrinology)',
        },
        {
          date: '2026-02-20',
          condition: 'Thyroid Enlargement & Metabolic Investigation',
          treatment: 'Physical exam: diffusely enlarged non-tender thyroid, delayed reflexes noted',
          specialist: 'Dr. Mark Johnson (Internal Medicine)',
        },
        {
          date: '2025-08-10',
          condition: 'Hyperlipidemia & Hypertension',
          treatment: 'Total cholesterol 268 mg/dL - started on statin therapy',
          specialist: 'Dr. Sarah Wilson (Cardiology)',
        },
      ],
      appointments: [
        {
          id: 1,
          date: '2026-03-18',
          time: '11:00 AM',
          specialist: 'Dr. Elizabeth Taylor',
          specialty: 'Endocrinology',
          status: 'Scheduled',
        },
        {
          id: 2,
          date: '2026-03-25',
          time: '01:30 PM',
          specialist: 'Dr. Mark Johnson',
          specialty: 'Internal Medicine',
          status: 'Pending',
        },
      ],
    },
  };

  const currentPatient = patientProfiles[selectedPatient as keyof typeof patientProfiles];

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 overflow-auto">
        <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-3 bg-blue-500/10 border border-blue-500/20 rounded-lg px-4 py-2 mb-4">
            <UserIcon size={20} className="text-blue-400" />
            <span className="text-blue-300 font-semibold">Patient Portal</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">Patient Dashboard</h1>
          <p className="text-gray-400 text-lg">
            Manage your health records and appointments
          </p>
        </div>

        {/* Patient Selection Cards */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">Patient Records</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(patientProfiles).map(([key, patient]) => (
              <button
                key={key}
                onClick={() => setSelectedPatient(key)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedPatient === key
                    ? `${patient.colorBorder} ${patient.colorBg} bg-gradient-to-br`
                    : 'border-slate-700 bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center space-x-3 mb-3">
                  <img
                    src={patient.avatarUrl}
                    alt={patient.name}
                    className="w-12 h-12 rounded-full border border-slate-600"
                  />
                  <div>
                    <h3 className="font-bold text-white">{patient.name}</h3>
                    <p className={`text-sm ${patient.colorText}`}>{patient.condition}</p>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>{patient.age} y/o</span>
                  <span className={`font-semibold ${
                    patient.severity === 'Critical' ? 'text-red-400' :
                    patient.severity === 'High' ? 'text-yellow-400' :
                    'text-green-400'
                  }`}>{patient.severity}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Patient Info Card */}
        <div className={`bg-gradient-to-br ${currentPatient.colorBg} border-2 ${currentPatient.colorBorder} rounded-lg p-8 mb-8`}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">{currentPatient.name}</h2>
              <p className="text-gray-400">Patient ID: {currentPatient.id}</p>
            </div>
            <div className={`w-20 h-20 rounded-full overflow-hidden border-2 ${currentPatient.colorText}`}>
              <img
                src={currentPatient.avatarUrl}
                alt={`${currentPatient.name} avatar`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Age</p>
              <p className="text-white font-bold text-lg">{currentPatient.age} years</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Blood Type</p>
              <p className="text-white font-bold text-lg">{currentPatient.bloodType}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Last Checkup</p>
              <p className="text-white font-bold text-sm">{currentPatient.lastCheckup}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Next Appointment</p>
              <p className="text-white font-bold text-sm">{currentPatient.nextAppointment}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap space-x-2 bg-slate-800 p-2 rounded-lg border border-slate-700">
          {[
            { id: 'examples', label: 'Patient History', icon: FileTextIcon },
            { id: 'profile', label: 'Medical Info', icon: HeartIcon },
            { id: 'history', label: 'Medical History', icon: FileTextIcon },
            { id: 'appointments', label: 'Appointments', icon: CalendarIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
          {/* Medical Info Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
                  <HeartIcon size={24} className="text-red-400" />
                  <span>Allergies</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                  {currentPatient.allergies.map((allergy, index) => (
                    <div
                      key={index}
                      className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg text-sm font-semibold"
                    >
                      ⚠️ {allergy}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-4">Current Medications</h3>
                <div className="space-y-3">
                  {currentPatient.medications.map((med, index) => (
                    <div key={index} className="bg-slate-700 border border-slate-600 rounded-lg p-4">
                      <p className="text-white font-semibold">{med}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Medical History Tab */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              {currentPatient.medicalHistory.map((record, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-6 py-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="text-white font-bold">{record.condition}</h4>
                      <p className="text-gray-400 text-sm">{record.date}</p>
                    </div>
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full">
                      {record.specialist}
                    </span>
                  </div>
                  <p className="text-gray-300 text-sm">{record.treatment}</p>
                </div>
              ))}
            </div>
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            <div className="space-y-4">
              {currentPatient.appointments.map((appt) => (
                <div
                  key={appt.id}
                  className="bg-slate-700 border border-slate-600 rounded-lg p-6 hover:border-blue-500 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <CalendarIcon size={20} className="text-blue-400" />
                        <h4 className="text-white font-bold">{appt.specialist}</h4>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">{appt.specialty}</p>
                      <p className="text-gray-300 text-sm">
                        {appt.date} at {appt.time}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        appt.status === 'Scheduled'
                          ? 'bg-green-500/20 text-green-400'
                          : appt.status === 'Urgent'
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}
                    >
                      {appt.status}
                    </span>
                  </div>
                  <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-semibold">
                    View Details →
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Example Cases Tab */}
          {activeTab === 'examples' && (
            <div className="space-y-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Patient Case Details for {currentPatient.name}</h3>
                <p className="text-gray-400 text-sm">
                  This is the case file for <strong>{currentPatient.name}</strong> ({currentPatient.condition}). Copy the text below to use in the <strong>{exampleCases.find(c => c.id === currentPatient.caseId)?.pageType}</strong> page.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {exampleCases.filter(caseItem => caseItem.id === currentPatient.caseId).map((caseItem) => {
                  const colorClasses = {
                    blue: 'border-blue-500/30 bg-blue-500/10 hover:border-blue-500/50',
                    purple: 'border-purple-500/30 bg-purple-500/10 hover:border-purple-500/50',
                    orange: 'border-orange-500/30 bg-orange-500/10 hover:border-orange-500/50',
                  };

                  const textColorClasses = {
                    blue: 'text-blue-400',
                    purple: 'text-purple-400',
                    orange: 'text-orange-400',
                  };

                  const buttonClasses = {
                    blue: 'bg-blue-600 hover:bg-blue-700',
                    purple: 'bg-purple-600 hover:bg-purple-700',
                    orange: 'bg-orange-600 hover:bg-orange-700',
                  };

                  return (
                    <div
                      key={caseItem.id}
                      className={`border rounded-lg p-6 transition-all ${
                        colorClasses[caseItem.color as keyof typeof colorClasses]
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-3xl">{caseItem.icon}</span>
                            <h4 className="text-xl font-bold text-white">{caseItem.title}</h4>
                          </div>
                          <p className="text-gray-400 text-sm mb-3">{caseItem.description}</p>
                          <div
                            className={`inline-block text-xs font-semibold px-3 py-1 rounded-full ${textColorClasses[caseItem.color as keyof typeof textColorClasses]} bg-opacity-20`}
                          >
                            {caseItem.pageType}
                          </div>
                        </div>
                      </div>

                      <div className="bg-slate-700/50 rounded-lg p-4 mb-4 border border-slate-600/50">
                        <p className="text-gray-300 text-sm whitespace-pre-wrap font-mono">
                          {caseItem.text}
                        </p>
                      </div>

                      <button
                        onClick={() => copyToClipboard(caseItem.text, caseItem.id)}
                        className={`w-full py-2 rounded-lg font-semibold text-white transition-all ${
                          buttonClasses[caseItem.color as keyof typeof buttonClasses]
                        }`}
                      >
                        {copiedCase === caseItem.id ? '✓ Copied to Clipboard!' : 'Copy Case Text'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Footer */}
      <Footer showNews={false} />
    </div>
  );
}
