// netlify/functions/store-analysis-result.js

// In-memory storage (note: this will reset whenever the function cold starts)
// For production use, you should use a database
const analysisResults = {};

exports.handler = async function(event, context) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Handle storing the analysis result
  if (event.httpMethod === 'POST') {
    try {
      const body = JSON.parse(event.body);
      const { projectId, result } = body;
      
      if (!projectId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Project ID is required' })
        };
      }
      
      // Store the result
      analysisResults[projectId] = {
        result,
        timestamp: Date.now(),
        status: 'completed'
      };
      
      console.log(`Stored analysis result for project ${projectId}`);
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ success: true })
      };
    } catch (error) {
      console.error('Error storing analysis result:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to store analysis result' })
      };
    }
  }
  
  // Handle retrieving the analysis result
  if (event.httpMethod === 'GET') {
    try {
      const { projectId } = event.queryStringParameters || {};
      
      if (!projectId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Project ID is required' })
        };
      }
      
      const resultData = analysisResults[projectId];
      
      if (!resultData) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ 
            status: 'processing',
            message: 'Analysis result not found, it may still be processing'
          })
        };
      }
      
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          status: 'completed',
          result: resultData.result,
          timestamp: resultData.timestamp
        })
      };
    } catch (error) {
      console.error('Error retrieving analysis result:', error);
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Failed to retrieve analysis result' })
      };
    }
  }
  
  // Handle unsupported methods
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
