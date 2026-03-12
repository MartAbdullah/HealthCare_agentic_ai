import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import BasicAgentPage from './pages/BasicAgentPage';
import IntermediateAgentPage from './pages/IntermediateAgentPage';
import AdvancedAgentPage from './pages/AdvancedAgentPage';
import SpecialistPage from './pages/SpecialistPage';
import PatientPage from './pages/PatientPage';
import './App.css';

function AppContent() {
  const [specialistsCount, setSpecialistsCount] = useState(3);

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Sidebar 
        specialistsCount={specialistsCount} 
        onSpecialistsCountChange={setSpecialistsCount}
      />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/patient-intake" element={<BasicAgentPage />} />
          <Route path="/specialist-consultation" element={<IntermediateAgentPage specialistsCount={specialistsCount} />} />
          <Route path="/clinical-document" element={<AdvancedAgentPage />} />
          <Route path="/specialist" element={<SpecialistPage />} />
          <Route path="/patient" element={<PatientPage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
