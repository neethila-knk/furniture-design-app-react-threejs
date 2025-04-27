import React from 'react';
import { useNavigate } from 'react-router-dom';

const CustomizationTools = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center">
            <span className="text-blue-600 mr-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            Customization Tools
          </h1>
          <button 
            onClick={() => navigate(-1)} 
            className="text-gray-500 hover:text-gray-700 flex items-center text-sm font-medium focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
            </svg>
            Back
          </button>
        </div>
      </div>

      {/* Subtitle */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <p className="text-sm md:text-base">Select a customization option to personalize your interior design.</p>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Color Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              {/* Card header with gradient */}
              <div className="bg-gradient-to-r from-blue-400 to-indigo-600 p-4 text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <h2 className="text-lg font-semibold ml-2">Color Customization</h2>
              </div>
              
              {/* Card content */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-gray-600 mb-6">Change colors of furniture items or room elements.</p>
                
                <div className="flex-1 flex items-end justify-center">
                  <button
                    onClick={() => navigate('/customization/color')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                  >
                    <span>Open Color Picker</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Shading Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              {/* Card header with gradient */}
              <div className="bg-gradient-to-r from-purple-400 to-pink-600 p-4 text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <h2 className="text-lg font-semibold ml-2">Shading Controls</h2>
              </div>
              
              {/* Card content */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-gray-600 mb-6">Adjust light and shadow effects for realistic appearance.</p>
                
                <div className="flex-1 flex items-end justify-center">
                  <button
                    onClick={() => navigate('/customization/shading')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                  >
                    <span>Open Shading Controls</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Scaling Card */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden flex flex-col h-full border border-gray-100 hover:shadow-lg transition-shadow duration-300">
              {/* Card header with gradient */}
              <div className="bg-gradient-to-r from-green-400 to-teal-600 p-4 text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
                </svg>
                <h2 className="text-lg font-semibold ml-2">Scaling Controls</h2>
              </div>
              
              {/* Card content */}
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-gray-600 mb-6">Resize furniture items to fit perfectly in your room.</p>
                
                <div className="flex-1 flex items-end justify-center">
                  <button
                    onClick={() => navigate('/customization/scaling')}
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center transition-colors duration-200"
                  >
                    <span>Open Scaling Controls</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white shadow-md border-t border-gray-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-2 md:mb-0">
            Customize your design with these powerful tools.
          </p>
          <div className="flex space-x-2">
            <button 
              onClick={() => navigate('/help/customization')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Need Help?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationTools;