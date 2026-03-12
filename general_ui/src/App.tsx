import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import PatientIntakePage from './pages/PatientIntakePage';
import SpecialistConsultationPage from './pages/SpecialistConsultationPage';
import ClinicalDocumentPage from './pages/ClinicalDocumentPage';
import SpecialistPage from './pages/SpecialistPage';
import PatientPage from './pages/PatientPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

import Navbar from './components/Navbar';

function AppContent({ specialistsCount, setSpecialistsCount, onLogout, userEmail, profileData }: any) {
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar userEmail={userEmail} onLogout={onLogout} profileData={profileData} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar 
          specialistsCount={specialistsCount} 
          onSpecialistsCountChange={setSpecialistsCount}
          onLogout={onLogout}
        />
        <main className="flex-1 overflow-auto w-full">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/patient-intake" element={<PatientIntakePage />} />
            <Route path="/specialist-consultation" element={<SpecialistConsultationPage specialistsCount={specialistsCount} />} />
            <Route path="/clinical-document" element={<ClinicalDocumentPage />} />
            <Route path="/specialist" element={<SpecialistPage />} />
            <Route path="/patient" element={<PatientPage />} />
            <Route path="/profile" element={<ProfilePage userEmail={userEmail} profileData={profileData} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  const [specialistsCount, setSpecialistsCount] = useState(3);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [profileData, setProfileData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: '',
    phone: '+31687888785',
    title: 'Medical Professional',
    country: 'Netherlands',
    city: 'Amsterdam',
    street: 'Europalaan',
    postalCode: '5700XL',
  });

  // Check if user is already logged in from localStorage
  useEffect(() => {
    const authenticated = localStorage.getItem('isAuthenticated') === 'true';
    const email = localStorage.getItem('userEmail') || '';
    setIsAuthenticated(authenticated);
    setUserEmail(email);
  }, []);

  const handleLogin = (email: string) => {
    setIsAuthenticated(true);
    setUserEmail(email);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserEmail('');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
  };

  return (
    <Router>
      {!isAuthenticated ? (
        <LoginPage onLogin={handleLogin} />
      ) : (
        <AppContent specialistsCount={specialistsCount} setSpecialistsCount={setSpecialistsCount} onLogout={handleLogout} userEmail={userEmail} profileData={profileData} setProfileData={setProfileData} />
      )}
    </Router>
  );
}

export default App;
