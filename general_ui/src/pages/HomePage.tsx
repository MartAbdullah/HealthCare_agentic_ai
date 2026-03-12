import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../icons';
import Footer from '../components/Footer';

export default function HomePage() {
  const agents = [
    {
      id: 1,
      title: 'Patient Intake',
      description: 'Analyze patient symptoms and medical history with AI-powered diagnosis support. Review case details for acute conditions like meningitis, heart failure, and thyroid disorders.',
      link: '/patient-intake',
      color: 'from-blue-400 to-cyan-600',
      ctaColor: 'bg-cyan-600 hover:bg-cyan-700',
      icon: '⚡',
      cta: 'Start Analysis',
      complexity: 'Beginner',
    },
    {
      id: 2,
      title: 'Specialist Consultation',
      description: 'Get multi-specialist assessments on complex medical cases. Receive insights from different medical specialists and unified clinical summaries for comprehensive case analysis.',
      link: '/specialist-consultation',
      color: 'from-purple-400 to-pink-600',
      ctaColor: 'bg-pink-600 hover:bg-pink-700',
      icon: '🧠',
      cta: 'Request Consultation',
      complexity: 'Intermediate',
    },
    {
      id: 3,
      title: 'Clinical Document',
      description: 'Process and analyze clinical documents with intelligent extraction. Auto-identify medical conditions, medications, and relevant medical codes with human-in-the-loop verification.',
      link: '/clinical-document',
      color: 'from-orange-400 to-red-600',
      ctaColor: 'bg-red-600 hover:bg-red-700',
      icon: '🏥',
      cta: 'Process Document',
      complexity: 'Advanced',
    },
  ];

  return (
    <main className="flex flex-col min-h-full overflow-auto">
      {/* Agents Grid */}
      <section className="px-4 py-6 sm:py-8 md:py-10 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 sm:mb-8 md:mb-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4">Welcome HealthCare Center</h2>
            <p className="text-gray-400 text-sm sm:text-base md:text-lg">Intelligent AI-powered medical agents for patient diagnosis, specialist consultation, and clinical document analysis</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-6 auto-rows-max\">
            {agents.map((agent) => (
              <Link key={agent.id} to={agent.link}>
                  <div className="min-h-80 sm:min-h-96 bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 hover:border-purple-500 transition-all group cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 flex flex-col justify-between">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`text-4xl bg-gradient-to-br ${agent.color} bg-clip-text text-transparent`}>
                      {agent.icon}
                    </div>
                    <span className="text-xs font-semibold px-3 py-1 bg-slate-700 text-gray-300 rounded-full">
                      {agent.complexity}
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3 group-hover:text-purple-400 transition-colors">
                    {agent.title}
                  </h3>
                  <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    {agent.description}
                  </p>

                  {/* CTA Button */}
                  <button className={`w-full ${agent.ctaColor} text-white font-bold py-2 sm:py-3 px-4 rounded-lg transition-all transform hover:scale-105 active:scale-95 flex items-center justify-center space-x-1 sm:space-x-2 shadow-lg text-sm sm:text-base`}>
                    <span>{agent.cta}</span>
                    <ArrowRightIcon size={18} />
                  </button>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer showNews={true} />
    </main>
  );
}
