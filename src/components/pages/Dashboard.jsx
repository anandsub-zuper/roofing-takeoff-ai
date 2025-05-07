// 8. Dashboard.jsx - Dashboard Overview Component
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, LayoutGrid } from 'lucide-react';
import { useApp } from '../../context/AppContext';

function Dashboard() {
  const navigate = useNavigate();
  const { projects } = useApp();
  
  // Format a number with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Get counts of projects by status
  const getProjectCounts = () => {
    const counts = {
      active: 0,
      completed: 0,
      total: projects.length
    };
    
    projects.forEach(project => {
      if (project.status === 'analyzed') {
        counts.active++;
      }
      if (project.status === 'completed') {
        counts.completed++;
      }
    });
    
    return counts;
  };
  
  const projectCounts = getProjectCounts();
  
  // Get recent projects
  const getRecentProjects = () => {
    return [...projects]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);
  };
  
  const recentProjects = getRecentProjects();
  
  // Get status label
  const getStatusLabel = (status) => {
    switch (status) {
      case 'new':
        return <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">New</span>;
      case 'analyzed':
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs">Analyzed</span>;
      case 'completed':
        return <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">Completed</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-blue-700 mb-2">Active Projects</h3>
          <p className="text-3xl font-bold">{projectCounts.active}</p>
          <p className="text-sm text-gray-500 mt-2">{projects.length > 0 ? 'Ready for materials' : 'No active projects'}</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-green-700 mb-2">Completed Projects</h3>
          <p className="text-3xl font-bold">{projectCounts.completed}</p>
          <p className="text-sm text-gray-500 mt-2">{projectCounts.completed > 0 ? `${projectCounts.completed} projects finished` : 'No completed projects'}</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg shadow">
          <h3 className="font-semibold text-purple-700 mb-2">Total Projects</h3>
          <p className="text-3xl font-bold">{projectCounts.total}</p>
          <p className="text-sm text-gray-500 mt-2">{projectCounts.total > 0 ? 'All-time projects' : 'Start your first project'}</p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Recent Projects</h3>
        </div>
        <div className="p-4">
          {recentProjects.length > 0 ? (
            <table className="w-full">
              <thead>
                <tr className="text-left text-gray-500 text-sm">
                  <th className="pb-2">Project Name</th>
                  <th className="pb-2">Address</th>
                  <th className="pb-2">Status</th>
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentProjects.map((project) => (
                  <tr key={project.id} className="border-t">
                    <td className="py-3">{project.name}</td>
                    <td className="py-3">{project.address || 'N/A'}</td>
                    <td className="py-3">{getStatusLabel(project.status)}</td>
                    <td className="py-3">{new Date(project.createdAt).toLocaleDateString()}</td>
                    <td className="py-3">
                      {project.status === 'analyzed' && (
                        <button
                          onClick={() => navigate(`/takeoff-result/${project.id}`)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          View Results
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>No projects yet. Create your first takeoff to get started.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Quick Actions</h3>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            className="flex items-center justify-center gap-2 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition"
            onClick={() => navigate('/new-takeoff')}
          >
            <Upload size={18} />
            New Project
          </button>
          <button className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition">
            <FileText size={18} />
            Generate Report
          </button>
          <button className="flex items-center justify-center gap-2 bg-gray-200 text-gray-800 py-2 px-4 rounded hover:bg-gray-300 transition">
            <LayoutGrid size={18} />
            Material Inventory
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
