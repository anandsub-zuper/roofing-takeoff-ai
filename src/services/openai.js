// 3. OpenAI Service - For Handling AI API Calls
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: For production, use a backend proxy
});

// Analyze roof plans using OpenAI
export async function analyzeRoofPlans(files) {
  try {
    // For image files, use Vision API
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/')
    );
    
    if (imageFiles.length === 0) {
      throw new Error('No image files provided');
    }
    
    // Convert the first image file to base64
    const imageFile = imageFiles[0];
    const base64Image = await fileToBase64(imageFile);
    
    // Call OpenAI API with the image
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: "You are an expert roofing contractor with extensive experience in measurements and material estimation. Analyze the provided roof plan or image and extract key measurements, identify roof sections, and provide material estimates."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Analyze this roof plan and provide detailed measurements, identify different roof sections, calculate the total roof area, estimate the roof pitch, and recommend required materials." },
            {
              type: "image_url",
              image_url: {
                url: base64Image
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    });
    
    // Process the response
    const analysisText = response.choices[0].message.content;
    
    // Parse the analysis text to extract structured data
    // Note: This is a simple implementation for Phase 1
    // A more robust parsing would be needed in later phases
    const roofData = {
      totalArea: extractAreaFromText(analysisText),
      pitch: extractPitchFromText(analysisText),
      sections: extractSectionsFromText(analysisText),
      materials: extractMaterialsFromText(analysisText)
    };
    
    return roofData;
  } catch (error) {
    console.error('Error analyzing roof plans:', error);
    throw error;
  }
}

// Ask AI Assistant a question about the current analysis
export async function askAssistant(question, roofData) {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are an expert roofing assistant. Provide accurate, helpful answers about roofing measurements, materials, and costs."
        },
        {
          role: "user",
          content: `Roof data: ${JSON.stringify(roofData)}\n\nQuestion: ${question}`
        }
      ],
      max_tokens: 500
    });
    
    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error asking assistant:', error);
    throw error;
  }
}

// Helper functions for parsing OpenAI responses
function extractAreaFromText(text) {
  // Simple regex to find area values
  const areaMatch = text.match(/total\s+area.*?(\d[\d,\.]+)\s*(?:sq\.?\s*ft|square\s*feet)/i);
  return areaMatch ? parseFloat(areaMatch[1].replace(/,/g, '')) : 0;
}

function extractPitchFromText(text) {
  // Simple regex to find pitch values
  const pitchMatch = text.match(/pitch.*?(\d+(?:\.\d+)?)[:/]12/i);
  return pitchMatch ? parseFloat(pitchMatch[1]) : 0;
}

function extractSectionsFromText(text) {
  // This is a simplified implementation
  // In a real app, you'd need more sophisticated parsing
  const sections = [];
  
  // Look for sections like "main roof", "garage", etc.
  const sectionMatches = text.matchAll(/(?:section|area)(?:[:\s-]+)([^:]+?)(?::|is|measures|approximately|about).*?(\d[\d,\.]+)\s*(?:sq\.?\s*ft|square\s*feet)/gi);
  
  for (const match of sectionMatches) {
    sections.push({
      name: match[1].trim(),
      area: parseFloat(match[2].replace(/,/g, '')),
      pitch: 0 // Would need more complex parsing to get per-section pitch
    });
  }
  
  // If no sections were found but we have a total area, create a default section
  if (sections.length === 0) {
    const totalArea = extractAreaFromText(text);
    if (totalArea > 0) {
      sections.push({
        name: "Main Roof",
        area: totalArea,
        pitch: extractPitchFromText(text)
      });
    }
  }
  
  return sections;
}

function extractMaterialsFromText(text) {
  const materials = {};
  
  // Common roofing materials to look for
  const materialTypes = [
    'shingles', 'tiles', 'underlayment', 'felt', 'nails', 
    'ridge', 'vents', 'flashing', 'drip edge'
  ];
  
  for (const material of materialTypes) {
    const regex = new RegExp(`${material}.*?(?:need|require|approximately|about|:)\\s*(\\d+(?:\\.\\d+)?)\\s*((?:squares|bundles|rolls|pieces|lbs|kg|feet|ft))?`, 'i');
    const match = text.match(regex);
    
    if (match) {
      materials[material] = {
        quantity: parseFloat(match[1]),
        unit: match[2] ? match[2].trim().toLowerCase() : 'pieces',
        unitPrice: getDefaultPrice(material)
      };
    }
  }
  
  // If no materials were extracted, provide some defaults based on area
  if (Object.keys(materials).length === 0) {
    const totalArea = extractAreaFromText(text);
    if (totalArea > 0) {
      // Standard estimation: 3 bundles per square (100 sq ft)
      const squares = Math.ceil(totalArea / 100);
      
      materials.shingles = {
        quantity: squares,
        unit: 'squares',
        unitPrice: 95.50
      };
      
      materials.underlayment = {
        quantity: Math.ceil(squares * 1.15), // 15% extra for overlap
        unit: 'rolls',
        unitPrice: 45.75
      };
      
      // Add other default materials
      materials.nails = {
        quantity: Math.ceil(squares * 1.5),
        unit: 'lbs',
        unitPrice: 3.80
      };
    }
  }
  
  return materials;
}

// Default prices for common materials
function getDefaultPrice(material) {
  const prices = {
    shingles: 95.50,
    tiles: 125.00,
    underlayment: 45.75,
    felt: 35.20,
    nails: 3.80,
    ridge: 32.25,
    vents: 42.00,
    flashing: 18.50,
    'drip edge': 8.75
  };
  
  return prices[material.toLowerCase()] || 20.00;
}

// Convert file to base64
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
