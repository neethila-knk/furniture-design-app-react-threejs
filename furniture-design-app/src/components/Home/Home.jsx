// src/components/Home/Home.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Design tips data
  const designTips = [
    {
      id: 1,
      title: "Balance Light and Space",
      content: "Natural light enhances colors and creates a sense of spaciousness. Position mirrors strategically to reflect light in darker areas."
    },
    {
      id: 2,
      title: "Rule of Thirds",
      content: "Divide spaces visually into thirds for balanced, harmonious design. This applies to furniture placement, wall art, and color distribution."
    },
    {
      id: 3,
      title: "Create a Focal Point",
      content: "Every room needs a focal point—a fireplace, statement furniture piece, or artwork that immediately draws attention."
    },
    {
      id: 4,
      title: "Layer Textures",
      content: "Combine different textures like wood, metal, glass, and textiles to create visual depth and tactile interest in your spaces."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header/Navigation */}
      <header className="bg-slate-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-white">Interior Design Studio</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium mr-2">
                  {currentUser.name.charAt(0)}
                </div>
                <span className="text-white mr-2">{currentUser.name}</span>
                <span className="bg-indigo-600 text-xs font-semibold px-2 py-1 rounded-full text-white">
                  {currentUser.role}
                </span>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main>
        {/* Hero Section with Background Image - Increased Height */}
        <section className="relative py-32 md:py-48 flex items-center min-h-[500px] md:min-h-[600px]">
          {/* Background image */}
          <div className="absolute inset-0 z-0 bg-center bg-cover" 
               style={{ 
                 backgroundImage: "url('https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')", 
                 backgroundPosition: "center" 
               }}>
            {/* Dark overlay */}
            <div className="absolute inset-0 bg-slate-900 opacity-70"></div>
          </div>
          
          {/* Centered content */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center w-full">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-6">
              Welcome to Your Design Space
            </h2>
            <p className="mt-4 text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
              Transform your ideas into stunning interior designs with our professional tools and resources.
            </p>
            <button 
              onClick={() => navigate('/dashboard')}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-md text-lg font-medium transition-colors duration-200 shadow-lg inline-flex items-center"
            >
              Go to Dashboard
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </section>

        {/* Design Tips Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800">Professional Design Tips</h2>
              <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
                Elevate your interior designs with these expert recommendations from our professional designers.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {designTips.map(tip => (
                <div key={tip.id} className="bg-slate-50 p-6 rounded-lg shadow-md border border-slate-100 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-slate-800">{tip.title}</h3>
                      <p className="mt-2 text-slate-600">{tip.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Projects Section */}
        <section className="py-16 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-slate-800">Your Recent Activity</h2>
              <p className="mt-4 text-xl text-slate-600 max-w-3xl mx-auto">
                Continue where you left off or start a new project.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-xl shadow-md">
              <div className="flex flex-col md:flex-row items-center justify-between mb-8">
                <div>
                  <h3 className="text-xl font-semibold text-slate-800">Continue Your Current Project</h3>
                  <p className="text-slate-600 mt-1">Pick up right where you left off.</p>
                </div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="mt-4 md:mt-0 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Open Dashboard
                </button>
              </div>
              
              <div className="border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-500">
                  Access your saved designs, room setups, and furniture libraries through the dashboard.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-indigo-700 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl font-bold text-white">Ready to create your next design masterpiece?</h2>
            <p className="mt-4 text-lg text-indigo-100 max-w-3xl mx-auto">
              Use our professional design tools to bring your vision to life.
            </p>
            <div className="mt-8">
              <button 
                onClick={() => navigate('/dashboard')}
                className="bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3 rounded-md text-lg font-medium transition-colors duration-200 shadow-lg"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-slate-300">© 2025 Interior Design Studio. All rights reserved.</p>
            </div>
            <div>
              <p className="text-slate-300">User Portal v1.0</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;