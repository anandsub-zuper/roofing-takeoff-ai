// src/services/openai.js
import axios from 'axios';

/**
 * Start the roof analysis process using a background function
 * @param {Array} files - Array of uploaded files
 * @param {Object} projectDetails - Details about the project
 * @returns {Object} - Response with analysis results
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
    
    // Call the background function and wait for it to complete
    console.log("Calling background function and waiting for completion...");
    const response = await axios.post('/.netlify/functions/analyze-roof-background', {
      image: base64Image,
      projectDetails
    });
    
    console.log("Received complete response from background function:", response.status);
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing roof plans:', error);
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
