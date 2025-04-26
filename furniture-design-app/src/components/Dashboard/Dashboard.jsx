import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllDesigns } from '../../models/designData';
import { useDesign } from '../../contexts/DesignContext';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { loadDesign, createNewDesign } = useDesign();
  const [recentDesigns, setRecentDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDesigns = () => {
      try {
        const allDesigns = getAllDesigns();
        const userDesigns = allDesigns.filter(design => design.createdBy === currentUser.id);
        
        // Sort by last updated
        userDesigns.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        
        // Get the 5 most recent
        setRecentDesigns(userDesigns.slice(0, 5));
      } catch (error) {
        console.error('Error fetching designs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [currentUser.id]);

  const handleNewDesign = () => {
    createNewDesign(currentUser.id);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Welcome, {currentUser.name}</h1>
          <button
            onClick={handleNewDesign}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <span className="mr-2">+ New Design</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/room-setup"
              className="flex flex-col items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-3">
                <span className="text-xl">🏠</span>
              </div>
              <span className="font-medium text-gray-900">Room Setup</span>
            </Link>
            <Link
              to="/furniture-library"
              className="flex flex-col items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="h-12 w-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-3">
                <span className="text-xl">🪑</span>
              </div>
              <span className="font-medium text-gray-900">Furniture Library</span>
            </Link>
            <Link
              to="/saved-designs"
              className="flex flex-col items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="h-12 w-12 bg-purple-500 rounded-full flex items-center justify-center text-white mb-3">
                <span className="text-xl">💾</span>
              </div>
              <span className="font-medium text-gray-900">Saved Designs</span>
            </Link>
            <Link
              to="/customization"
              className="flex flex-col items-center justify-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div className="h-12 w-12 bg-yellow-500 rounded-full flex items-center justify-center text-white mb-3">
                <span className="text-xl">🎨</span>
              </div>
              <span className="font-medium text-gray-900">Customization</span>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Designs</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading recent designs...</p>
            </div>
          ) : recentDesigns.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Design Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Furniture Count
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentDesigns.map((design) => (
                    <tr key={design.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{design.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(design.updatedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500 capitalize">{design.room.shape}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{design.furniture.length} items</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => loadDesign(design.id)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Open
                        </button>
                        <Link to={`/design/${design.id}`} className="text-primary-600 hover:text-primary-900">
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-4">You don't have any saved designs yet.</p>
              <button
                onClick={handleNewDesign}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
              >
                Create Your First Design
              </button>
            </div>
          )}
          
          {recentDesigns.length > 0 && (
            <div className="mt-4 text-right">
              <Link to="/saved-designs" className="text-primary-600 hover:text-primary-900 font-medium">
                View All Designs →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;