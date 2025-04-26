import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useDesign } from '../../contexts/DesignContext';
import { getAllDesigns, deleteDesign } from '../../models/designData';

const SavedDesigns = () => {
  const { currentUser } = useAuth();
  const { loadDesign } = useDesign();
  const navigate = useNavigate();
  
  const [designs, setDesigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Fetch designs when component mounts
  useEffect(() => {
    const fetchDesigns = () => {
      try {
        const allDesigns = getAllDesigns();
        const userDesigns = allDesigns.filter(design => design.createdBy === currentUser.id);
        setDesigns(userDesigns);
      } catch (error) {
        console.error('Error fetching designs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDesigns();
  }, [currentUser.id]);
  
  // Handle opening a design
  const handleOpenDesign = (designId) => {
    loadDesign(designId);
    navigate('/design-view');
  };
  
  // Handle deleting a design
  const handleDeleteDesign = (designId, designName) => {
    if (window.confirm(`Are you sure you want to delete the design "${designName}"?`)) {
      try {
        deleteDesign(designId);
        // Update the local state after deletion
        setDesigns(prevDesigns => prevDesigns.filter(design => design.id !== designId));
      } catch (error) {
        console.error('Error deleting design:', error);
        alert('Failed to delete the design. Please try again.');
      }
    }
  };
  
  // Format date for display
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
  
  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set it and default to descending
      setSortBy(field);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort designs
  const filteredAndSortedDesigns = designs
    .filter(design => {
      const searchLower = searchQuery.toLowerCase();
      return (
        design.name.toLowerCase().includes(searchLower) ||
        design.room.shape.toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      
      // Handle different sort fields
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'createdAt') {
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
      } else if (sortBy === 'updatedAt') {
        comparison = new Date(a.updatedAt) - new Date(b.updatedAt);
      } else if (sortBy === 'furnitureCount') {
        comparison = a.furniture.length - b.furniture.length;
      }
      
      // Reverse for descending order
      return sortDirection === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Saved Designs</h2>
            <div className="flex space-x-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search designs..."
                  className="w-full md:w-64 border border-gray-300 rounded-md pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p className="text-gray-500">Loading saved designs...</p>
            </div>
          ) : designs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40">
              <p className="text-gray-500 mb-4">You don't have any saved designs yet.</p>
              <button
                onClick={() => navigate('/design-view')}
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
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange('name')}
                      >
                        <div className="flex items-center">
                          Design Name
                          {sortBy === 'name' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange('updatedAt')}
                      >
                        <div className="flex items-center">
                          Last Updated
                          {sortBy === 'updatedAt' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange('createdAt')}
                      >
                        <div className="flex items-center">
                          Created
                          {sortBy === 'createdAt' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Room Shape
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSortChange('furnitureCount')}
                      >
                        <div className="flex items-center">
                          Furniture Count
                          {sortBy === 'furnitureCount' && (
                            <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAndSortedDesigns.map((design) => (
                      <tr key={design.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{design.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(design.updatedAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(design.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500 capitalize">{design.room.shape}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{design.furniture.length} items</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOpenDesign(design.id)}
                            className="text-primary-600 hover:text-primary-900 mr-4"
                          >
                            Open
                          </button>
                          <button
                            onClick={() => handleDeleteDesign(design.id, design.name)}
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
              
              <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                <div>
                  Showing {filteredAndSortedDesigns.length} of {designs.length} designs
                </div>
                <div>
                  <button
                    onClick={() => navigate('/design-view')}
                    className="text-primary-600 hover:text-primary-800 font-medium"
                  >
                    + Create New Design
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SavedDesigns;