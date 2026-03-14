import { useState } from 'react';
import { MailIcon, PhoneIcon, MapPinIcon, ClockIcon, SearchIcon, StethoscopeIcon, SPECIALTY_ICONS } from '../icons';

const DOCTOR_PHOTOS: Record<string, string> = {
  general_practitioner: 'https://randomuser.me/api/portraits/women/44.jpg',
  cardiologist: 'https://randomuser.me/api/portraits/men/32.jpg',
  neurologist: 'https://randomuser.me/api/portraits/women/65.jpg',
  nephrologist: 'https://randomuser.me/api/portraits/men/52.jpg',
  pulmonologist: 'https://randomuser.me/api/portraits/women/47.jpg',
  hematologist: 'https://randomuser.me/api/portraits/men/73.jpg',
  endocrinologist: 'https://randomuser.me/api/portraits/women/28.jpg',
  oncologist: 'https://randomuser.me/api/portraits/men/41.jpg',
  geriatrician: 'https://randomuser.me/api/portraits/women/53.jpg',
  psychiatrist: 'https://randomuser.me/api/portraits/men/15.jpg',
  infectious_disease: 'https://randomuser.me/api/portraits/women/36.jpg',
  rheumatologist: 'https://randomuser.me/api/portraits/men/61.jpg',
  vascular_surgeon: 'https://randomuser.me/api/portraits/men/75.jpg',
  cardiothoracic_surgeon: 'https://randomuser.me/api/portraits/men/26.jpg',
  radiologist: 'https://randomuser.me/api/portraits/women/57.jpg',
  clinical_pharmacist: 'https://randomuser.me/api/portraits/men/36.jpg',
  dietitian: 'https://randomuser.me/api/portraits/women/49.jpg',
  physiotherapist: 'https://randomuser.me/api/portraits/men/45.jpg',
  palliative_care: 'https://randomuser.me/api/portraits/women/33.jpg',
  emergency_physician: 'https://randomuser.me/api/portraits/men/58.jpg',
};

export default function SpecialistPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const specialists = [
    {
      key: 'general_practitioner',
      name: 'Dr. Sarah Johnson',
      specialty: 'General Practitioner',
      description: 'Provides primary care assessment, medical history synthesis, and general health overview.',
      experience: '18 years',
      location: 'Downtown Medical Center',
      email: 'sarah.johnson@medicalcenter.com',
      phone: '+1 (555) 123-4567',
      status: 'Available',
    },
    {
      key: 'cardiologist',
      name: 'Dr. Michael Chen',
      specialty: 'Cardiologist',
      description: 'Specializes in cardiovascular system assessment, including heart disease, arrhythmias, and hemodynamic status.',
      experience: '15 years',
      location: 'Cardiovascular Institute',
      email: 'michael.chen@medicalcenter.com',
      phone: '+1 (555) 234-5678',
      status: 'In Consultation',
    },
    {
      key: 'neurologist',
      name: 'Dr. Emily Rodriguez',
      specialty: 'Neurologist',
      description: 'Evaluates neurological symptoms, CNS disorders, and neurological emergencies.',
      experience: '16 years',
      location: 'Neurology Department',
      email: 'emily.rodriguez@medicalcenter.com',
      phone: '+1 (555) 345-6789',
      status: 'Available',
    },
    {
      key: 'nephrologist',
      name: 'Dr. James Wilson',
      specialty: 'Nephrologist',
      description: 'Assesses renal function, electrolyte abnormalities, and kidney disease.',
      experience: '14 years',
      location: 'Nephrology Clinic',
      email: 'james.wilson@medicalcenter.com',
      phone: '+1 (555) 456-7890',
      status: 'Available',
    },
    {
      key: 'pulmonologist',
      name: 'Dr. Lisa Anderson',
      specialty: 'Pulmonologist',
      description: 'Evaluates respiratory system, lung disease, and breathing abnormalities.',
      experience: '17 years',
      location: 'Respiratory Care Center',
      email: 'lisa.anderson@medicalcenter.com',
      phone: '+1 (555) 567-8901',
      status: 'Available',
    },
    {
      key: 'hematologist',
      name: 'Dr. Robert Kumar',
      specialty: 'Hematologist',
      description: 'Specializes in blood disorders, anemia, and coagulation issues.',
      experience: '19 years',
      location: 'Hematology Department',
      email: 'robert.kumar@medicalcenter.com',
      phone: '+1 (555) 678-9012',
      status: 'In Consultation',
    },
    {
      key: 'endocrinologist',
      name: 'Dr. Patricia Martinez',
      specialty: 'Endocrinologist',
      description: 'Assesses metabolic disorders, diabetes, and hormonal imbalances.',
      experience: '15 years',
      location: 'Endocrinology Clinic',
      email: 'patricia.martinez@medicalcenter.com',
      phone: '+1 (555) 789-0123',
      status: 'Available',
    },
    {
      key: 'oncologist',
      name: 'Dr. David Thompson',
      specialty: 'Oncologist',
      description: 'Evaluates malignancy risk and cancer-related complications.',
      experience: '20 years',
      location: 'Cancer Research Institute',
      email: 'david.thompson@medicalcenter.com',
      phone: '+1 (555) 890-1234',
      status: 'Available',
    },
    {
      key: 'geriatrician',
      name: 'Dr. Catherine Lee',
      specialty: 'Geriatrician',
      description: 'Provides specialized assessment for age-related health issues and polypharmacy.',
      experience: '16 years',
      location: 'Senior Health Center',
      email: 'catherine.lee@medicalcenter.com',
      phone: '+1 (555) 901-2345',
      status: 'Available',
    },
    {
      key: 'psychiatrist',
      name: 'Dr. Alexander Patel',
      specialty: 'Psychiatrist',
      description: 'Evaluates mental health status, psychiatric symptoms, and psychological factors in presentation.',
      experience: '17 years',
      location: 'Mental Health Services',
      email: 'alexander.patel@medicalcenter.com',
      phone: '+1 (555) 012-3456',
      status: 'Available',
    },
    {
      key: 'infectious_disease',
      name: 'Dr. Jennifer Brown',
      specialty: 'Infectious Disease Specialist',
      description: 'Assesses infectious risks, microbiological findings, and antimicrobial therapy.',
      experience: '18 years',
      location: 'Infectious Disease Clinic',
      email: 'jennifer.brown@medicalcenter.com',
      phone: '+1 (555) 123-0456',
      status: 'In Consultation',
    },
    {
      key: 'rheumatologist',
      name: 'Dr. Mark Stevens',
      specialty: 'Rheumatologist',
      description: 'Evaluates autoimmune and rheumatologic conditions.',
      experience: '14 years',
      location: 'Rheumatology Department',
      email: 'mark.stevens@medicalcenter.com',
      phone: '+1 (555) 234-0567',
      status: 'Available',
    },
    {
      key: 'vascular_surgeon',
      name: 'Dr. Thomas Garcia',
      specialty: 'Vascular Surgeon',
      description: 'Assesses vascular pathology and peripheral vascular disease.',
      experience: '19 years',
      location: 'Vascular Surgery Center',
      email: 'thomas.garcia@medicalcenter.com',
      phone: '+1 (555) 345-0678',
      status: 'Available',
    },
    {
      key: 'cardiothoracic_surgeon',
      name: 'Dr. William Foster',
      specialty: 'Cardiothoracic Surgeon',
      description: 'Evaluates surgical candidacy for cardiac and thoracic conditions.',
      experience: '21 years',
      location: 'Cardiothoracic Surgery',
      email: 'william.foster@medicalcenter.com',
      phone: '+1 (555) 456-0789',
      status: 'Available',
    },
    {
      key: 'radiologist',
      name: 'Dr. Susan Hayes',
      specialty: 'Radiologist',
      description: 'Interprets imaging findings and recommends additional imaging workup.',
      experience: '16 years',
      location: 'Radiology Department',
      email: 'susan.hayes@medicalcenter.com',
      phone: '+1 (555) 567-0890',
      status: 'In Consultation',
    },
    {
      key: 'clinical_pharmacist',
      name: 'Dr. Kevin White',
      specialty: 'Clinical Pharmacist',
      description: 'Reviews medications, identifies drug interactions, and optimizes drug therapy.',
      experience: '13 years',
      location: 'Pharmacy Services',
      email: 'kevin.white@medicalcenter.com',
      phone: '+1 (555) 678-0901',
      status: 'Available',
    },
    {
      key: 'dietitian',
      name: 'Dr. Amanda Clark',
      specialty: 'Dietitian',
      description: 'Provides nutritional assessment and dietary recommendations.',
      experience: '12 years',
      location: 'Nutrition Center',
      email: 'amanda.clark@medicalcenter.com',
      phone: '+1 (555) 789-0012',
      status: 'Available',
    },
    {
      key: 'physiotherapist',
      name: 'Dr. Christopher Scott',
      specialty: 'Physiotherapist',
      description: 'Evaluates functional status and recommends rehabilitation strategies.',
      experience: '15 years',
      location: 'Physical Therapy Center',
      email: 'christopher.scott@medicalcenter.com',
      phone: '+1 (555) 890-0123',
      status: 'Available',
    },
    {
      key: 'palliative_care',
      name: 'Dr. Michelle Green',
      specialty: 'Palliative Care Specialist',
      description: 'Provides symptom management and quality-of-life considerations.',
      experience: '17 years',
      location: 'Palliative Care Unit',
      email: 'michelle.green@medicalcenter.com',
      phone: '+1 (555) 901-0234',
      status: 'Available',
    },
    {
      key: 'emergency_physician',
      name: 'Dr. Richard Moore',
      specialty: 'Emergency Physician',
      description: 'Assesses acute presentation, critical findings, and emergency management priorities.',
      experience: '18 years',
      location: 'Emergency Department',
      email: 'richard.moore@medicalcenter.com',
      phone: '+1 (555) 012-0345',
      status: 'In Consultation',
    },
  ];

  const filteredSpecialists = specialists.filter(
    (specialist) =>
      specialist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      specialist.specialty.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-full px-4 py-8 sm:px-6 lg:px-8 overflow-auto">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center space-x-3 bg-purple-500/10 border border-purple-500/20 rounded-lg px-4 py-2 mb-4">
            <StethoscopeIcon size={20} className="text-purple-400" />
            <span className="text-purple-300 font-semibold">Specialist Portal</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">AI Specialist Dashboard</h1>
          <p className="text-gray-400 text-lg mb-8">
            Experience intelligent medical analysis with our AI specialist network. Each AI agent specializes in specific medical domains, providing rapid assessment, clinical insights, and evidence-based recommendations for comprehensive patient care. Available 24/7 without wait times.
          </p>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <SearchIcon size={20} className="absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
            />
          </div>
        </div>

        {/* Specialists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSpecialists.map((specialist) => {
            const SpecialtyIcon = SPECIALTY_ICONS[specialist.key as keyof typeof SPECIALTY_ICONS];
            return (
            <div
              key={specialist.key}
              className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden hover:border-purple-500 transition-all hover:shadow-lg hover:shadow-purple-500/20"
            >
              {/* Card Header with Doctor Photo + Specialty Icon */}
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={DOCTOR_PHOTOS[specialist.key]}
                    alt={`${specialist.name} profile`}
                    className="w-16 h-16 rounded-full object-cover border-2 border-white/40 flex-shrink-0"
                    loading="lazy"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1 truncate">{specialist.name}</h3>
                    <p className="text-purple-100 font-semibold truncate">{specialist.specialty}</p>
                  </div>
                </div>
                {SpecialtyIcon && <SpecialtyIcon size={48} className="flex-shrink-0 ml-4" />}
              </div>

              {/* Card Body */}
              <div className="p-6 space-y-4">
                {/* Description */}
                <p className="text-gray-300 text-sm">{specialist.description}</p>

                {/* Info Grid */}
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <ClockIcon size={18} className="text-blue-400 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-xs">Experience</p>
                      <p className="text-white font-semibold">{specialist.experience}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPinIcon size={18} className="text-green-400 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-xs">Location</p>
                      <p className="text-white font-semibold text-sm">{specialist.location}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MailIcon size={18} className="text-orange-400 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-xs">Email</p>
                      <p className="text-white font-semibold text-sm break-all">{specialist.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <PhoneIcon size={18} className="text-red-400 mt-0.5" />
                    <div>
                      <p className="text-gray-400 text-xs">Phone</p>
                      <p className="text-white font-semibold">{specialist.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="pt-4 border-t border-slate-700">
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full inline-block ${
                      specialist.status === 'Available'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {specialist.status === 'Available' ? '🟢' : '🟡'} {specialist.status}
                  </span>
                </div>

                {/* Contact Button */}
                <button className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors">
                  Contact Specialist
                </button>
              </div>
            </div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredSpecialists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No specialists found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
