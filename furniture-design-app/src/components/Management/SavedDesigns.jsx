import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDesign } from '../../contexts/DesignContext';
import {
  getAllDesigns,
  deleteDesign,
} from '../../models/designData';

/**
 * Props
 * ─────
 * • setSidebarOpen?: (boolean) => void   ← optional; close sidebar on mobile
 */
const SavedDesigns = ({ setSidebarOpen }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { loadDesign, createNewDesign } = useDesign();

  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');

  /** ─────────────────────────────────────────
   * Fetch the logged-in user’s designs
   * ───────────────────────────────────────── */
  const fetchDesigns = () => {
    try {
      const all = getAllDesigns() || [];
      const mine = all.filter(
        (d) => d.createdBy === currentUser?.id
      );
      setDesigns(mine);
    } catch (err) {
      console.error('Error fetching designs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) fetchDesigns();
  }, [currentUser?.id]);

  /** ───────────────────────────────
   * Open / delete / NEW design
   * ─────────────────────────────── */
  const handleOpenDesign = (id) => {
    loadDesign(id);
    navigate('/design-view');
    if (typeof setSidebarOpen === 'function') setSidebarOpen(false);
  };

  const handleDeleteDesign = (id, name) => {
    if (
      window.confirm(
        `Are you sure you want to delete “${name}”?`
      )
    ) {
      try {
        deleteDesign(id);
        setDesigns((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        console.error('Error deleting design:', err);
        alert('Failed to delete the design. Please try again.');
      }
    }
  };

  /**  NEW DESIGN handler  */
  const handleNewDesign = () => {
    if (
      window.confirm(
        'Create a new design? Any unsaved changes will be lost.'
      )
    ) {
      createNewDesign(currentUser.id);
      navigate('/design-view');
      if (typeof setSidebarOpen === 'function') setSidebarOpen(false);
    }
  };

  /** util */
  const formatDate = (ts) =>
    new Date(ts).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const handleSortChange = (field) => {
    if (sortBy === field)
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else {
      setSortBy(field);
      setSortDirection('desc');
    }
  };

  /** filter + sort */
  const filtered = designs
    .filter((d) => {
      const q = searchQuery.toLowerCase();
      return (
        d.name.toLowerCase().includes(q) ||
        d.room?.shape.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'createdAt')
        cmp = new Date(a.createdAt) - new Date(b.createdAt);
      else if (sortBy === 'updatedAt')
        cmp = new Date(a.updatedAt) - new Date(b.updatedAt);
      else if (sortBy === 'furnitureCount')
        cmp =
          (a.furniture?.length || 0) - (b.furniture?.length || 0);
      return sortDirection === 'asc' ? cmp : -cmp;
    });

  /* ─────────────────────────── render ─────────────────────────── */
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          {/* header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">
              Saved Designs
            </h2>

            {/* search box */}
            <div className="relative w-full md:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search designs…"
                className="w-64 border text-gray-500 border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
                🔍
              </span>
            </div>
          </div>

          {/* body */}
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading saved designs…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-4">
                You don’t have any saved designs yet.
              </p>
              <button
                onClick={handleNewDesign}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md"
              >
                Create Your First Design
              </button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      {['name', 'updatedAt', 'createdAt', 'furnitureCount'].map(
                        (f) => (
                          <th
                            key={f}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                            onClick={() => handleSortChange(f)}
                          >
                            <div className="flex items-center">
                              {f === 'name' && 'Design Name'}
                              {f === 'updatedAt' && 'Last Updated'}
                              {f === 'createdAt' && 'Created'}
                              {f === 'furnitureCount' && 'Furniture Count'}
                              {sortBy === f && (
                                <span className="ml-1">
                                  {sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                              )}
                            </div>
                          </th>
                        )
                      )}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room Shape
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filtered.map((d) => (
                      <tr key={d.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {d.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(d.updatedAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {formatDate(d.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap capitalize">
                          <div className="text-sm text-gray-500">
                            {d.room?.shape || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {d.furniture?.length || 0} items
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button
                            onClick={() => handleOpenDesign(d.id)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            Open
                          </button>
                          <button
                            onClick={() =>
                              handleDeleteDesign(d.id, d.name)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* footer */}
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>
                  Showing {filtered.length} of {designs.length} designs
                </div>
                <button
                  onClick={handleNewDesign}
                  className="text-primary-600 hover:text-primary-800 font-medium"
                >
                  + Create New Design
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedDesigns;
