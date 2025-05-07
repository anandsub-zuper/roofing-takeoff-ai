// netlify/functions/analyze-roof.js
const { OpenAI } = require('openai');

exports.handler = async function(event, context) {
  // Add detailed logging
  console.log("Function invoked with method:", event.httpMethod);
  
  // Check for POST method
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body);
    console.log("Request received. Image data length:", body.image ? body.image.length : 'no image data');
    
    if (!body.image) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Image data is required' }) 
      };
    }
    
    // Check API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("API key is missing");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'API configuration error' })
      };
    }
    
    // Initialize OpenAI with server-side API key
    const openai = new OpenAI({
      apiKey: apiKey
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
              text: `Analyze this roof plan for project "${body.projectDetails?.name || 'Unnamed'}". Provide detailed measurements, identify different roof sections, calculate the total roof area, estimate the roof pitch, and recommend required materials.` 
            },
            {
              type: "image_url",
              image_url: {
                url: body.image
              }
            }
          ]
        }
      ],
      max_tokens: 1500
    });
    
    console.log("OpenAI API response received");
    
    // Return the successful response
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        result: response.choices[0].message.content,
        // Add more structured data as needed
      })
    };
  } catch (error) {
    console.error('Error processing roof image:', error);
    
    // Provide detailed error information
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process roof image',
        details: error.message,
        stack: error.stack
      })
    };
  }
};
