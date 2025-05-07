// src/services/openai.js
import axios from 'axios';

// Function to analyze roof plans
export async function analyzeRoofPlans(files, projectDetails) {
  try {
    // Get the first image file
    const imageFile = files.find(file => file.type.startsWith('image/'));
    
    if (!imageFile) {
      throw new Error('No image files provided');
    }
    
    // Convert to base64
    const base64Image = await fileToBase64(imageFile);
    
    // Call our Netlify function
    const response = await axios.post('/.netlify/functions/analyze-roof', {
      image: base64Image,
      projectDetails
    });
    
    return response.data;
  } catch (error) {
    console.error('Error analyzing roof plans:', error);
    throw error;
  }
}

// Function to ask the AI assistant
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

// Helper function to convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
