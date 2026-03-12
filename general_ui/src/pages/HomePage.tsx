import { Link } from 'react-router-dom';
import { ArrowRightIcon } from '../icons';
import Footer from '../components/Footer';

export default function HomePage() {
  const agents = [
    {
      id: 1,
      title: 'Patient Intake',
      description: 'A simple agent that demonstrates fundamental agentic patterns. Perfect for learning the basics.',
      link: '/patient-intake',
      color: 'from-blue-400 to-cyan-600',
      icon: '⚡',
      complexity: 'Beginner',
    },
    {
      id: 2,
      title: 'Specialist Consultation',
      description: 'A more advanced agent with state management, memory, and conditional logic.',
      link: '/specialist-consultation',
      color: 'from-purple-400 to-pink-600',
      icon: '🧠',
      complexity: 'Intermediate',
    },
    {
      id: 3,
      title: 'Clinical Document',
      description: 'A production-ready clinical document processing pipeline with human-in-the-loop review.',
      link: '/clinical-document',
      color: 'from-orange-400 to-red-600',
      icon: '🏥',
      complexity: 'Advanced',
    },
  ];

  return (
    <main className="flex flex-col min-h-full overflow-auto">
      {/* Agents Grid */}
      <section className="px-4 py-12 sm:px-6 lg:px-8 flex-1">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Welcome HealthCare Center</h2>
            <p className="text-gray-400 text-lg">Choose your learning path</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-max">
            {agents.map((agent) => (
              <Link key={agent.id} to={agent.link}>
                <div className="min-h-96 bg-slate-800 border border-slate-700 rounded-2xl p-8 hover:border-purple-500 transition-all group cursor-pointer hover:shadow-xl hover:shadow-purple-500/20 flex flex-col justify-between">
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
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">
                    {agent.title}
                  </h3>
                  <p className="text-gray-400 mb-6 leading-relaxed">
                    {agent.description}
                  </p>

                  {/* Arrow */}
                  <div className="flex items-center space-x-2 text-purple-400 group-hover:translate-x-2 transition-transform">
                    <span className="font-semibold">Explore</span>
                    <ArrowRightIcon size={20} />
                  </div>
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
