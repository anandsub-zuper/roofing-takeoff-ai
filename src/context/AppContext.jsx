// 2. AppContext.jsx - Application Context for State Management
import React, { createContext, useState, useContext } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Add a new project
  const addProject = (project) => {
    const newProject = {
      id: Date.now().toString(),
      createdAt: new Date(),
      status: 'new',
      ...project
    };
    setProjects([...projects, newProject]);
    setCurrentProject(newProject);
    return newProject;
  };
  
  // Update files for current project
  const updateFiles = (newFiles) => {
    setFiles([...files, ...newFiles]);
  };
  
  // Clear files
  const clearFiles = () => {
    setFiles([]);
  };
  
  // Remove a file
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };
  
  // Update project status
  const updateProjectStatus = (projectId, status) => {
    const updatedProjects = projects.map(project => 
      project.id === projectId ? { ...project, status } : project
    );
    setProjects(updatedProjects);
    
    if (currentProject && currentProject.id === projectId) {
      setCurrentProject({ ...currentProject, status });
    }
  };
  
  // Start analysis process
  const startAnalysis = () => {
    setIsProcessing(true);
  };
  
  // Complete analysis
  const completeAnalysis = (result) => {
  console.log("Complete analysis called with result type:", typeof result);
  console.log("Result has properties:", Object.keys(result).join(", "));
  setIsProcessing(false);
  setAnalysisResult(result);
};
    if (currentProject) {
      updateProjectStatus(currentProject.id, 'analyzed');
    }
  };
  
  return (
    <AppContext.Provider value={{
      projects,
      currentProject,
      files,
      isProcessing,
      analysisResult,
      addProject,
      setCurrentProject,
      updateFiles,
      clearFiles,
      removeFile,
      updateProjectStatus,
      startAnalysis,
      completeAnalysis
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
