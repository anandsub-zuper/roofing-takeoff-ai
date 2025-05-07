// netlify/functions/analyze-roof-background.js
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

// Initialize global storage
global.analysisResults = global.analysisResults || {};

exports.handler = async function(event, context) {
  // This is a background function
  console.log("Background function invoked");
  
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { image, projectDetails } = body;
    
    console.log("Request received for project:", projectDetails?.name);
    
    if (!image) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Image data is required' }) };
    }
    
    // Return immediately with 202 Accepted
    console.log("Returning immediate 202 response, processing will continue");
    
    // Process in background (after returning response)
    processInBackground(image, projectDetails).catch(error => {
      console.error('Background processing error:', error);
    });
    
    return {
      statusCode: 202,
      body: JSON.stringify({ 
        message: 'Analysis started', 
        status: 'processing',
        projectId: projectDetails.projectId
      })
    };
  } catch (error) {
    console.error('Error starting analysis:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to start analysis' })
    };
  }
};

async function processInBackground(image, projectDetails) {
  try {
    console.log("Starting background processing for project:", projectDetails.projectId);
    
    // Initialize OpenAI API
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    console.log("Calling OpenAI API...");
    
    // Call OpenAI API
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert roofing contractor with extensive experience in measurements and material estimation. Analyze the provided roof plan or image and extract key measurements, identify roof sections, and provide material estimates."
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: `Analyze this roof plan for project "${projectDetails.name || 'Unnamed'}". Provide detailed measurements, identify different roof sections, calculate the total roof area, estimate the roof pitch, and recommend required materials.` 
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    });

    console.log("OpenAI API response received");
    
    // Process the response
    const analysisText = response.choices[0].message.content;
    
    // Extract structured data (your existing functions)
    const result = {
      totalArea: extractAreaFromText(analysisText) || 2000,
      pitch: extractPitchFromText(analysisText) || 4.0,
      sections: extractSectionsFromText(analysisText) || [{
        name: "Main Roof",
        area: 2000,
        pitch: 4.0
      }],
      materials: extractMaterialsFromText(analysisText) || {
        shingles: { quantity: 20, unit: 'squares', unitPrice: 95.50 },
        underlayment: { quantity: 22, unit: 'rolls', unitPrice: 45.75 },
        nails: { quantity: 30, unit: 'lbs', unitPrice: 3.80 }
      },
      rawAnalysis: analysisText
    };
    
    console.log("Analysis complete, storing results in memory");
    
    // Store in global variable
    global.analysisResults[projectDetails.projectId] = {
      result,
      timestamp: Date.now(),
      status: 'completed'
    };

    // Also store in file system as backup
    try {
      const tmpDir = '/tmp';
      // Ensure directory exists
      if (!fs.existsSync(tmpDir)) {
        fs.mkdirSync(tmpDir, { recursive: true });
      }
      
      const resultFile = path.join(tmpDir, `result-${projectDetails.projectId}.json`);
      fs.writeFileSync(resultFile, JSON.stringify(result));
      console.log(`Result also stored in file: ${resultFile}`);
    } catch (fileError) {
      console.error('Error writing result to file:', fileError);
    }
    
    console.log(`Stored result for project ${projectDetails.projectId} in memory`);
  } catch (error) {
    console.error('Error in background processing:', error);
    throw error;
  }
}

// Helper functions
function extractAreaFromText(text) {
  const areaMatch = text.match(/total\s+area.*?(\d[\d,\.]+)\s*(?:sq\.?\s*ft|square\s*feet)/i);
  return areaMatch ? parseFloat(areaMatch[1].replace(/,/g, '')) : 0;
}

function extractPitchFromText(text) {
  const pitchMatch = text.match(/pitch.*?(\d+(?:\.\d+)?)[:/]12/i);
  return pitchMatch ? parseFloat(pitchMatch[1]) : 0;
}

function extractSectionsFromText(text) {
  const sections = [];
  
  const sectionMatches = text.matchAll(/(?:section|area)(?:[:\s-]+)([^:]+?)(?::|is|measures|approximately|about).*?(\d[\d,\.]+)\s*(?:sq\.?\s*ft|square\s*feet)/gi);
  
  for (const match of sectionMatches) {
    sections.push({
      name: match[1].trim(),
      area: parseFloat(match[2].replace(/,/g, '')),
      pitch: 0
    });
  }
  
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
  
  if (Object.keys(materials).length === 0) {
    const totalArea = extractAreaFromText(text);
    if (totalArea > 0) {
      const squares = Math.ceil(totalArea / 100);
      
      materials.shingles = {
        quantity: squares,
        unit: 'squares',
        unitPrice: 95.50
      };
      
      materials.underlayment = {
        quantity: Math.ceil(squares * 1.15),
        unit: 'rolls',
        unitPrice: 45.75
      };
      
      materials.nails = {
        quantity: Math.ceil(squares * 1.5),
        unit: 'lbs',
        unitPrice: 3.80
      };
    }
  }
  
  return materials;
}

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
