// netlify/functions/ask-assistant.js
const { OpenAI } = require('openai');

exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body);
    const { question, roofData } = body;
    
    if (!question || !roofData) {
      return { 
        statusCode: 400, 
        body: JSON.stringify({ error: 'Question and roof data are required' }) 
      };
    }
    
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
    
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
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        answer: response.choices[0].message.content 
      })
    };
  } catch (error) {
    console.error('Error asking assistant:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to process question',
        details: error.message 
      })
    };
  }
};
