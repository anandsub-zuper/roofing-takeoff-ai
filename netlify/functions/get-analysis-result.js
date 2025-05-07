// netlify/functions/get-analysis-result.js
const fs = require('fs');
const path = require('path');

exports.handler = async function(event, context) {
  const { projectId } = event.queryStringParameters || {};
  
  if (!projectId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Project ID is required' })
    };
  }
  
  // Add CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
  
  // Check global variable first
  if (global.analysisResults && global.analysisResults[projectId]) {
    console.log(`Found result for project ${projectId} in memory`);
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(global.analysisResults[projectId].result)
    };
  }
  
  // Try to read from /tmp as fallback
  const tmpDir = '/tmp';
  const resultFile = path.join(tmpDir, `result-${projectId}.json`);
  
  try {
    if (fs.existsSync(resultFile)) {
      console.log(`Found result file at ${resultFile}`);
      const resultData = fs.readFileSync(resultFile, 'utf-8');
      return {
        statusCode: 200,
        headers,
        body: resultData
      };
    } else {
      console.log(`No result file found for project ${projectId}`);
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ 
          status: 'processing',
          message: 'Results not ready yet'
        })
      };
    }
  } catch (error) {
    console.error('Error retrieving result:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Failed to retrieve results' })
    };
  }
};
