// src/components/pages/NewTakeoff.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Cloud, Calculator, X, FileText, RefreshCw } from 'lucide-react';
import axios from 'axios'; // Make sure to import axios
import { useApp } from '../../context/AppContext';
import { analyzeRoofPlans } from '../../services/openai';

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
  const [pollingInterval, setPollingInterval] = useState(null);
  const [checkingResults, setCheckingResults] = useState(false);
  
  // Clean up polling interval on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);
  
  // Handle project details changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProjectDetails({
      ...projectDetails,
      [name]: value
    });
  };
  
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
  
  // Check for analysis results
  // In your checkResults function in NewTakeoff.jsx
const checkResults = async (projectId) => {
  if (checkingResults) return;
  
  try {
    setCheckingResults(true);
    console.log("Checking results for project:", projectId);
    
    const response = await axios.get(
      `/.netlify/functions/get-analysis-result?projectId=${projectId}`
    );
    
    console.log("Results check response:", response.status, response.data);
    
    if (response.status === 200 && response.data) {
      // We have results
      completeAnalysis(response.data);
      navigate(`/takeoff-result/${projectId}`);
      return true;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log("Results not ready yet");
      return false;
    } else {
      console.error("Error checking results:", error);
    }
  } finally {
    setCheckingResults(false);
  }
  
  return false;
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
      
      // Get the image file and convert to base64
      const imageFile = files.find(file => file.type.startsWith('image/'));
      if (!imageFile || !imageFile.data) {
        throw new Error('No valid image file selected');
      }
      
      // Convert to base64
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(imageFile.data);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      
      // Call background function to start processing
      await axios.post('/.netlify/functions/analyze-roof-background', {
        image: base64Image,
        projectDetails: {
          ...projectDetails,
          projectId: newProject.id
        }
      });
      
      console.log("Background processing started for project:", newProject.id);
      
      // Start polling for results
      const interval = setInterval(async () => {
        const hasResults = await checkResults(newProject.id);
        if (hasResults) {
          clearInterval(interval);
        }
      }, 5000); // Check every 5 seconds
      
      setPollingInterval(interval);
      
    } catch (error) {
      console.error('Error starting analysis:', error);
      alert(`Failed to start analysis: ${error.message}`);
      startAnalysis(false);
    }
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
                <div className="mt-4 space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-center mb-2">
                      <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                      <p className="text-blue-700">Processing in Background...</p>
                    </div>
                    <p className="text-sm text-center text-gray-600">
                      AI is analyzing your roof image. This may take 1-2 minutes.
                    </p>
                  </div>
                  
                  <button 
                    className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition flex items-center justify-center gap-2 disabled:bg-green-300"
                    onClick={() => currentProject && checkResults(currentProject.id)}
                    disabled={checkingResults}
                  >
                    {checkingResults ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Checking Results...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} />
                        Check for Results
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
