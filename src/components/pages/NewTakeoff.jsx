// src/components/pages/NewTakeoff.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Cloud, Calculator, X, FileText, RefreshCw } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { analyzeRoofPlans, checkAnalysisStatus } from '../../services/openai';

function NewTakeoff() {
  const navigate = useNavigate();
  const { 
    addProject, 
    files, 
    updateFiles, 
    removeFile,
    isProcessing,
    startAnalysis,
    completeAnalysis
  } = useApp();
  
  const [projectDetails, setProjectDetails] = useState({
    name: '',
    address: '',
    customerName: '',
    date: new Date().toISOString().split('T')[0],
    type: 'Residential'
  });
  
  const [currentProject, setCurrentProject] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusCheckCount, setStatusCheckCount] = useState(0);
  
  // Handle project details changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails({
      ...projectDetails,
      [name]: value
    });
  };
  
  // Automatically poll for status updates
  useEffect(() => {
    let interval;
    
    if (isProcessing && currentProject?.id) {
      interval = setInterval(() => {
        checkStatus(currentProject.id);
        setStatusCheckCount(prev => prev + 1);
      }, 10000); // Check every 10 seconds
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isProcessing, currentProject]);
  
  // Handle file upload
  const handleFileUpload = (e) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        data: file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }));
      
      updateFiles(newFiles);
    }
  };
  
  // Check analysis status
  const checkStatus = async (projectId) => {
    if (checkingStatus) return;
    
    try {
      setCheckingStatus(true);
      console.log("Manually checking status for project:", projectId);
      
      const status = await checkAnalysisStatus(projectId);
      console.log("Status check result:", status);
      
      if (status.status === 'completed' && status.result) {
        // Analysis is complete
        completeAnalysis(status.result);
        
        // Navigate to results page
        navigate(`/takeoff-result/${projectId}`);
      }
    } catch (error) {
      console.error("Error checking status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };
  
  // Process files with background function
  const processFiles = async () => {
    // Validate project details
    if (!projectDetails.name.trim()) {
      alert('Please enter a project name');
      return;
    }
    
    // Validate files
    if (files.length === 0) {
      alert('Please upload at least one file');
      return;
    }
    
    try {
      // Create a new project
      const newProject = addProject(projectDetails);
      setCurrentProject(newProject);
      
      // Start analysis process
      startAnalysis();
      
      // Call the background function to analyze files
      const response = await analyzeRoofPlans(files.map(f => f.data), {
        ...projectDetails,
        projectId: newProject.id
      });
      
      console.log("Analysis started:", response);
      
      // First status check after 10 seconds
      setTimeout(() => {
        checkStatus(newProject.id);
      }, 10000);
      
    } catch (error) {
      console.error('Error during analysis:', error);
      alert(`Analysis failed: ${error.message}`);
      startAnalysis(false);
    }
  };
  
  const getPollingStatus = () => {
    if (statusCheckCount === 0) return '';
    return `Checking status (${statusCheckCount})...`;
  };
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">New Takeoff Project</h2>
      
      {/* Project details form */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Project Details</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
              <input 
                type="text" 
                name="name"
                value={projectDetails.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
              <input 
                type="text" 
                name="address"
                value={projectDetails.address}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter project address"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
              <input 
                type="text" 
                name="customerName"
                value={projectDetails.customerName}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter customer name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Date</label>
              <input 
                type="date" 
                name="date"
                value={projectDetails.date}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
              <select 
                name="type"
                value={projectDetails.type}
                onChange={handleInputChange}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* File upload section */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b">
          <h3 className="font-semibold">Upload Files</h3>
          <p className="text-sm text-gray-500 mt-1">Upload roof plans, images, or CAD files for AI analysis</p>
        </div>
        <div className="p-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mb-4">
            <input
              type="file"
              multiple
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf,.dwg,.dxf"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="flex flex-col items-center justify-center">
                <Cloud size={48} className="text-blue-500 mb-2" />
                <p className="text-sm text-gray-700 mb-1">Drag and drop files here, or click to browse</p>
                <p className="text-xs text-gray-500">Supports PDF, JPG, PNG, DWG, DXF</p>
              </div>
            </label>
          </div>
          
          {files.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Uploaded Files ({files.length})</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <div className="flex items-center">
                      <FileText size={18} className="text-gray-500 mr-2" />
                      <span className="text-sm">{file.name}</span>
                    </div>
                    <button 
                      className="text-red-500 hover:text-red-700"
                      onClick={() => removeFile(index)}
                      disabled={isProcessing}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ))}
              </div>
              
              {!isProcessing ? (
                <button 
                  className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  onClick={processFiles}
                >
                  <Calculator size={18} />
                  Process with AI
                </button>
              ) : (
                <div className="mt-4">
                  <div className="bg-blue-50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-center mb-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                      <p className="text-blue-700">Processing Files... {getPollingStatus()}</p>
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      Analysis is running in the background and may take 1-2 minutes.
                    </p>
                  </div>
                  
                  <button 
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-green-300"
                    onClick={() => currentProject && checkStatus(currentProject.id)}
                    disabled={checkingStatus}
                  >
                    {checkingStatus ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Checking Status...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} />
                        Check if Analysis is Complete
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NewTakeoff;
