// src/components/pages/NewTakeoff.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Cloud, Calculator, X, FileText } from 'lucide-react';
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
  
  // Process files - now waits for complete analysis
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
      
      // Start analysis process
      startAnalysis();
      
      // Call function and wait for complete analysis (may take 10-20 seconds)
      const response = await analyzeRoofPlans(files.map(f => f.data), {
        ...projectDetails,
        projectId: newProject.id
      });
      
      console.log("Analysis complete:", response);
      
      // Process the completed analysis
      if (response) {
      completeAnalysis(response);
      navigate(`/takeoff-result/${newProject.id}`);
      } else {
        throw new Error('Analysis completed but returned invalid result');
      }
    } catch (error) {
      console.error('Error during analysis:', error);
      alert(`Analysis failed: ${error.message}`);
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
              
              <button 
                className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:bg-blue-300"
                onClick={processFiles}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Processing Files... (this may take 20-30 seconds)
                  </>
                ) : (
                  <>
                    <Calculator size={18} />
                    Process with AI
                  </>
                )}
              </button>
              
              {isProcessing && (
                <div className="mt-4 bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-center text-gray-600">
                    AI is analyzing your roof image. This process may take 20-30 seconds. Please wait...
                  </p>
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
