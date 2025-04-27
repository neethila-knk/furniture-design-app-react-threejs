import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getAllDesigns } from '../../models/designData';
import { useDesign } from '../../contexts/DesignContext';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { loadDesign, createNewDesign } = useDesign();

  const [recentDesigns, setRecentDesigns] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ────────────────────── fetch the five latest ────────────────────── */
  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchDesigns = () => {
      try {
        const all = getAllDesigns() || [];
        const mine = all
          .filter((d) => d.createdBy === currentUser.id)
          .sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          )
          .slice(0, 5);
        setRecentDesigns(mine);
      } catch (err) {
        console.error('Error fetching designs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDesigns();
  }, [currentUser?.id]);

  /* ────────────────────── helpers ────────────────────── */
  const handleNewDesign = () => {
    if (
      window.confirm(
        'Create a new design? Any unsaved changes will be lost.'
      )
    ) {
      createNewDesign(currentUser.id);
      navigate('/design-view');
    }
  };

  const handleOpenDesign = (id) => {
    if (
      window.confirm(
        'Open this design? Any unsaved changes in your current work will be lost.'
      )
    ) {
      loadDesign(id);
      navigate('/design-view');
    }
  };

  const formatDate = (ts) => {
    const d = new Date(ts);
    /* hide time on screens < 640 px */
    if (window.innerWidth < 640)
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /* ────────────────────── render ────────────────────── */
  return (
    <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <h1 className="text-2xl font-bold text-gray-800 text-right sm:text-left">
            Welcome, {currentUser.name}
          </h1>
          <button
            onClick={handleNewDesign}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center justify-center sm:justify-start"
          >
            <span className="mr-2">+ New Design</span>
          </button>
        </div>

        {/* quick actions */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* … unchanged links … */}
            <Link
              to="/room-setup"
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-500 rounded-full flex items-center justify-center text-white mb-2 sm:mb-3">
                <span className="text-lg sm:text-xl">🏠</span>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base text-center">
                Room Setup
              </span>
            </Link>
            <Link
              to="/furniture-library"
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-500 rounded-full flex items-center justify-center text-white mb-2 sm:mb-3">
                <span className="text-lg sm:text-xl">🪑</span>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base text-center">
                Furniture Library
              </span>
            </Link>
            <Link
              to="/saved-designs"
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-500 rounded-full flex items-center justify-center text-white mb-2 sm:mb-3">
                <span className="text-lg sm:text-xl">💾</span>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base text-center">
                Saved Designs
              </span>
            </Link>
            <Link
              to="/customization"
              className="flex flex-col items-center justify-center p-3 sm:p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-500 rounded-full flex items-center justify-center text-white mb-2 sm:mb-3">
                <span className="text-lg sm:text-xl">🎨</span>
              </div>
              <span className="font-medium text-gray-900 text-sm sm:text-base text-center">
                Customization
              </span>
            </Link>
          </div>
        </div>

        {/* recent designs */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Designs
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading recent designs…</p>
            </div>
          ) : recentDesigns.length ? (
            <div className="overflow-x-auto -mx-4 sm:mx-0">
              {/* desktop table */}
              <table className="hidden sm:table min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Design Name
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Updated
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room Type
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Furniture Count
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentDesigns.map((d) => (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {d.name}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {formatDate(d.updatedAt)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap capitalize">
                        <div className="text-sm text-gray-500">
                          {d.room.shape}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {d.furniture.length} items
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleOpenDesign(d.id)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Open
                        </button>
                       
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* mobile cards */}
              <div className="sm:hidden space-y-4 px-4">
                {recentDesigns.map((d) => (
                  <div
                    key={d.id}
                    className="bg-gray-50 p-4 rounded-lg"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium">{d.name}</h3>
                      <span className="text-xs bg-gray-200 text-gray-800 px-2 py-1 rounded capitalize">
                        {d.room.shape}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      Updated: {formatDate(d.updatedAt)}
                    </div>
                    <div className="text-xs text-gray-500 mb-3">
                      {d.furniture.length} furniture items
                    </div>
                    <div className="flex justify-end space-x-3">
                      <button
                        onClick={() => handleOpenDesign(d.id)}
                        className="text-sm text-blue-600 font-medium hover:text-blue-900"
                      >
                        Open
                      </button>
                      <Link
                        to={`/design/${d.id}`}
                        className="text-sm text-blue-600 font-medium hover:text-blue-900"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-4">
                You don’t have any saved designs yet.
              </p>
              <button
                onClick={handleNewDesign}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Create Your First Design
              </button>
            </div>
          )}

          {recentDesigns.length > 0 && (
            <div className="mt-4 text-right">
              <Link
                to="/saved-designs"
                className="text-blue-600 hover:text-blue-900 font-medium"
              >
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
