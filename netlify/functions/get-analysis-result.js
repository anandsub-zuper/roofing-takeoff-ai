// netlify/functions/get-analysis-result.js
exports.handler = async function(event, context) {
  // Set CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };

  // Handle preflight OPTIONS request
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }

  // Handle GET request
  if (event.httpMethod === 'GET') {
    const { projectId } = event.queryStringParameters || {};
    
    if (!projectId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Project ID is required' })
      };
    }
    
    // Access global variable storage
    const results = global.analysisResults || {};
    const resultData = results[projectId];
    
    console.log(`Checking result for project ${projectId}. Result found:`, !!resultData);
    
    if (!resultData) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          status: 'processing',
          message: 'Analysis still processing or not found'
        })
      };
    }
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: resultData.status || 'completed',
        result: resultData.result,
        error: resultData.error,
        timestamp: resultData.timestamp
      })
    };
  }
  
  // Handle unsupported methods
  return {
    statusCode: 405,
    headers,
    body: JSON.stringify({ error: 'Method not allowed' })
  };
};
