// netlify/functions/analyze-roof.js
const { OpenAI } = require('openai');

exports.handler = async function(event, context) {
  // Check for POST method
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    const { image, projectDetails } = body;
    
    if (!image) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Image data is required' }) 
      };
    }
    
    // Initialize OpenAI with server-side API key
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
    // Call OpenAI API
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
            { 
              type: "text", 
              text: `Analyze this roof plan for project "${projectDetails?.name || 'Unnamed'}". Provide detailed measurements, identify different roof sections, calculate the total roof area, estimate the roof pitch, and recommend required materials.` 
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
    
    // Process and extract structured data
    const analysisText = response.choices[0].message.content;
    const structuredData = {
      totalArea: extractAreaFromText(analysisText),
      pitch: extractPitchFromText(analysisText),
      sections: extractSectionsFromText(analysisText),
      materials: extractMaterialsFromText(analysisText),
      rawAnalysis: analysisText
    };
    
    return {
      statusCode: 200,
      body: JSON.stringify(structuredData)
    };
  } catch (error) {
    console.error('Error processing roof image:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process roof image',
        details: error.message 
      })
    };
  }
};

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

// Include the other helper functions from your original code
// extractSectionsFromText and extractMaterialsFromText
