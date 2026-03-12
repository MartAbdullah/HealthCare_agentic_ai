import React from 'react';

// Lucide Icons
import { 
  Home, Zap, Brain, Database, User, Stethoscope,
  Mail, Phone, MapPin, Clock, Search,
  Menu, ArrowRight, Send, Loader2, CheckCircle, AlertCircle,
  Upload, Edit2, Check, X, FileText, Users, Calendar, Heart, Newspaper
} from 'lucide-react';

// React Icons - Medical Specialties  
import { 
  GiHeartBeats, GiBrain, GiKidneys, GiLungs, GiBlood,
  GiVial, GiJoint, GiAmbulance, GiPill
} from 'react-icons/gi';
import { 
  MdEmergency, MdLocalHospital, MdHealthAndSafety, 
  MdOutlineChildCare 
} from 'react-icons/md';
import { 
  FaXRay, FaStethoscope, FaLeaf, FaHandsHelping
} from 'react-icons/fa';
import { AiOutlineMedicineBox } from 'react-icons/ai';

// Icon Wrapper Type
type IconProps = {
  className?: string;
  size?: number;
};

// ===== Lucide Icon Wrappers =====
export const HomeIcon = ({ className, size = 24 }: IconProps) => (
  <Home className={className} size={size} />
);

export const ZapIcon = ({ className, size = 24 }: IconProps) => (
  <Zap className={className} size={size} />
);

export const BrainIcon = ({ className, size = 24 }: IconProps) => (
  <Brain className={className} size={size} />
);

export const DatabaseIcon = ({ className, size = 24 }: IconProps) => (
  <Database className={className} size={size} />
);

export const UserIcon = ({ className, size = 24 }: IconProps) => (
  <User className={className} size={size} />
);

export const StethoscopeIcon = ({ className, size = 24 }: IconProps) => (
  <Stethoscope className={className} size={size} />
);

export const MailIcon = ({ className, size = 24 }: IconProps) => (
  <Mail className={className} size={size} />
);

export const PhoneIcon = ({ className, size = 24 }: IconProps) => (
  <Phone className={className} size={size} />
);

export const MapPinIcon = ({ className, size = 24 }: IconProps) => (
  <MapPin className={className} size={size} />
);

export const ClockIcon = ({ className, size = 24 }: IconProps) => (
  <Clock className={className} size={size} />
);

export const SearchIcon = ({ className, size = 24 }: IconProps) => (
  <Search className={className} size={size} />
);

export const MenuIcon = ({ className, size = 24 }: IconProps) => (
  <Menu className={className} size={size} />
);

export const ArrowRightIcon = ({ className, size = 24 }: IconProps) => (
  <ArrowRight className={className} size={size} />
);

export const SendIcon = ({ className, size = 24 }: IconProps) => (
  <Send className={className} size={size} />
);

export const Loader2Icon = ({ className, size = 24 }: IconProps) => (
  <Loader2 className={className} size={size} />
);

export const CheckCircleIcon = ({ className, size = 24 }: IconProps) => (
  <CheckCircle className={className} size={size} />
);

export const AlertCircleIcon = ({ className, size = 24 }: IconProps) => (
  <AlertCircle className={className} size={size} />
);

export const UploadIcon = ({ className, size = 24 }: IconProps) => (
  <Upload className={className} size={size} />
);

export const Edit2Icon = ({ className, size = 24 }: IconProps) => (
  <Edit2 className={className} size={size} />
);

export const CheckIcon = ({ className, size = 24 }: IconProps) => (
  <Check className={className} size={size} />
);

export const XIcon = ({ className, size = 24 }: IconProps) => (
  <X className={className} size={size} />
);

export const FileTextIcon = ({ className, size = 24 }: IconProps) => (
  <FileText className={className} size={size} />
);

export const UsersIcon = ({ className, size = 24 }: IconProps) => (
  <Users className={className} size={size} />
);

export const CalendarIcon = ({ className, size = 24 }: IconProps) => (
  <Calendar className={className} size={size} />
);

export const HeartIcon = ({ className, size = 24 }: IconProps) => (
  <Heart className={className} size={size} />
);

export const NewspaperIcon = ({ className, size = 24 }: IconProps) => (
  <Newspaper className={className} size={size} />
);

export const LoaderIcon = ({ className, size = 24 }: IconProps) => (
  <Loader2 className={className} size={size} />
);

// ===== Medical Specialty Icon Wrappers (React Icons) =====
// Using React.createElement with 'as any' to work around typing issues

// General Practitioner
export const GeneralPractitionerIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(MdHealthAndSafety, { className, size });

// Cardiologist  
export const CardiologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiHeartBeats, { className: `${className} text-red-400`, size });

// Neurologist
export const NeurologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiBrain, { className: `${className} text-purple-400`, size });

// Nephrologist
export const NephrologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiKidneys, { className: `${className} text-amber-400`, size });

// Pulmonologist
export const PulmonologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiLungs, { className: `${className} text-blue-400`, size });

// Hematologist
export const HematologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiBlood, { className: `${className} text-red-500`, size });

// Endocrinologist
export const EndocrinologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(MdOutlineChildCare, { className: `${className} text-pink-400`, size });

// Oncologist
export const OncologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(MdEmergency, { className: `${className} text-orange-400`, size });

// Geriatrician
export const GeriatricianIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(MdLocalHospital, { className: `${className} text-teal-400`, size });

// Psychiatrist
export const PsychiatristIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiBrain, { className: `${className} text-indigo-400`, size });

// Infectious Disease Specialist
export const InfectiousDiseaseIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiVial, { className: `${className} text-yellow-400`, size });

// Rheumatologist
export const RheumatologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiJoint, { className: `${className} text-cyan-400`, size });

// Vascular Surgeon
export const VascularSurgeonIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiHeartBeats, { className: `${className} text-rose-400`, size });

// Cardiothoracic Surgeon
export const CardiothoracicSurgeonIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(FaStethoscope, { className: `${className} text-red-600`, size });

// Radiologist
export const RadiologistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(FaXRay, { className: `${className} text-lime-400`, size });

// Clinical Pharmacist
export const ClinicalPharmacistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiPill, { className: `${className} text-green-400`, size });

// Dietitian
export const DietitianIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(FaLeaf, { className: `${className} text-green-500`, size });

// Physiotherapist
export const PhysiotherapistIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(AiOutlineMedicineBox, { className: `${className} text-orange-500`, size });

// Palliative Care Specialist
export const PalliativeCareIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(FaHandsHelping, { className: `${className} text-violet-400`, size });

// Emergency Physician
export const EmergencyPhysicianIcon = ({ className, size = 48 }: IconProps) => 
  (React.createElement as any)(GiAmbulance, { className: `${className} text-red-400`, size });

// ===== Icon Registry by Specialty Key =====
export const SPECIALTY_ICONS: Record<string, React.ComponentType<IconProps>> = {
  general_practitioner: GeneralPractitionerIcon,
  cardiologist: CardiologistIcon,
  neurologist: NeurologistIcon,
  nephrologist: NephrologistIcon,
  pulmonologist: PulmonologistIcon,
  hematologist: HematologistIcon,
  endocrinologist: EndocrinologistIcon,
  oncologist: OncologistIcon,
  geriatrician: GeriatricianIcon,
  psychiatrist: PsychiatristIcon,
  infectious_disease: InfectiousDiseaseIcon,
  rheumatologist: RheumatologistIcon,
  vascular_surgeon: VascularSurgeonIcon,
  cardiothoracic_surgeon: CardiothoracicSurgeonIcon,
  radiologist: RadiologistIcon,
  clinical_pharmacist: ClinicalPharmacistIcon,
  dietitian: DietitianIcon,
  physiotherapist: PhysiotherapistIcon,
  palliative_care: PalliativeCareIcon,
  emergency_physician: EmergencyPhysicianIcon,
};
