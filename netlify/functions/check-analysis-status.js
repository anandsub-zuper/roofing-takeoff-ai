// netlify/functions/check-analysis-status.js

// In-memory storage shared with the background function
// In production, use a database
const analysisJobs = new Map();

exports.handler = async function(event, context) {
  const { id } = event.queryStringParameters || {};
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Analysis ID is required' })
    };
  }
  
  // Get job status
  const jobStatus = analysisJobs.get(id);
  
  if (!jobStatus) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: 'Analysis job not found' })
    };
  }
  
  // Return current status
  return {
    statusCode: 200,
    body: JSON.stringify(jobStatus)
  };
};
