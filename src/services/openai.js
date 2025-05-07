// src/services/openai.js
import axios from 'axios';

/**
 * Start the roof analysis process using a background function
 * @param {Array} files - Array of uploaded files
 * @param {Object} projectDetails - Details about the project
 * @returns {Object} - Response with project ID and status
 */
export async function analyzeRoofPlans(files, projectDetails) {
  try {
    console.log("Starting analysis with files:", files.map(f => f.name));
    
    // Get the first image file
    const imageFile = files.find(file => file.type.startsWith('image/'));
    console.log("Selected image file:", imageFile?.name);
    
    if (!imageFile) {
      throw new Error('No image files provided');
    }
    
    // Convert to base64
    const base64Image = await fileToBase64(imageFile);
    console.log("Image converted to base64, length:", base64Image.length);
    
    // Call the background function
    const response = await axios.post('/.netlify/functions/analyze-roof-background', {
      image: base64Image,
      projectDetails
    });
    
    console.log("Background function response:", response.status, response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error starting roof analysis:', error);
    throw error;
  }
}

/**
 * Check the status of an analysis job
 * @param {String} projectId - ID of the project
 * @returns {Promise<Object>} - Current status and result if available
 */
export async function checkAnalysisStatus(projectId) {
  try {
    console.log("Checking analysis status for project:", projectId);
    
    const response = await axios.get(`/.netlify/functions/get-analysis-result?projectId=${projectId}`);
    console.log("Status check response:", response.data);
    
    return response.data;
  } catch (error) {
    console.error('Error checking analysis status:', error);
    // If we get a 404, the result is not ready yet
    if (error.response && error.response.status === 404) {
      return { status: 'processing' };
    }
    throw error;
  }
}

/**
 * Ask AI Assistant a question about the analysis
 */
export async function askAssistant(question, roofData) {
  try {
    const response = await axios.post('/.netlify/functions/ask-assistant', {
      question,
      roofData
    });
    
    return response.data.answer;
  } catch (error) {
    console.error('Error asking assistant:', error);
    throw error;
  }
}

/**
 * Convert file to base64
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
