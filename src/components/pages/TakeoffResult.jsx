// 5. TakeoffResult.jsx - Results Display Component
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { CornerDownRight, FileText, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { askAssistant } from '../../services/openai';

function TakeoffResult() {
  const { id } = useParams();
  const { projects, analysisResult } = useApp();
  const [askAI, setAskAI] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAskingAI, setIsAskingAI] = useState(false);
  
  // Find the current project
  const currentProject = projects.find(project => project.id === id);
  
  // Format numbers with commas
  const formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  
  // Handle AI query
  const handleAskAI = async () => {
    if (!askAI.trim() || !analysisResult) return;
    
    try {
      setIsAskingAI(true);
      const response = await askAssistant(askAI, analysisResult);
      setAiResponse(response);
      setAskAI('');
    } catch (error) {
      console.error('Error asking AI:', error);
      setAiResponse(`Sorry, I couldn't process your question. Please try again.`);
    } finally {
      setIsAskingAI(false);
    }
  };
  
  // Calculate total material costs
  const calculateTotalCost = () => {
    if (!analysisResult || !analysisResult.materials) return 0;
    
    let total = 0;
    Object.values(analysisResult.materials).forEach(material => {
      total += material.quantity * material.unitPrice;
    });
    return total.toFixed(2);
  };
  
  // If no project or analysis result, show loading
  if (!currentProject || !analysisResult) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Takeoff Results</h2>
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Loading analysis results...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">
        Takeoff Results: {currentProject.name}
      </h2>
      
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b bg-green-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-green-800">Analysis Complete</h3>
              <p className="text-sm text-green-700">AI has successfully analyzed your roof plans</p>
            </div>
            <div className="text-sm text-gray-500">
              Project: {currentProject.type} | Customer: {currentProject.customerName || 'N/A'}
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Total Roof Area</h4>
              <p className="text-3xl font-bold">{formatNumber(analysisResult.totalArea)} sq ft</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Roof Pitch</h4>
              <p className="text-3xl font-bold">{analysisResult.pitch}:12</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-2">Roof Sections</h4>
              <p className="text-3xl font-bold">{analysisResult.sections.length}</p>
            </div>
          </div>
          
          {analysisResult.sections.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-700 mb-3">Roof Sections</h4>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-gray-500 text-sm bg-gray-50">
                      <th className="p-2">Section Name</th>
                      <th className="p-2">Area (sq ft)</th>
                      <th className="p-2">Pitch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysisResult.sections.map((section, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-2">{section.name}</td>
                        <td className="p-2">{formatNumber(section.area)}</td>
                        <td className="p-2">{section.pitch || analysisResult.pitch}:12</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Material Calculation</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-500 text-sm bg-gray-50">
                    <th className="p-2">Material</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Unit</th>
                    <th className="p-2">Unit Price</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(analysisResult.materials).map(([key, material], index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 capitalize">{key}</td>
                      <td className="p-2">{material.quantity}</td>
                      <td className="p-2">{material.unit}</td>
                      <td className="p-2">${material.unitPrice.toFixed(2)}</td>
                      <td className="p-2">${(material.quantity * material.unitPrice).toFixed(2)}</td>
                    </tr>
                  ))}
                  <tr className="border-t bg-gray-50 font-semibold">
                    <td className="p-2" colSpan={4}>Total Materials Cost</td>
                    <td className="p-2">${calculateTotalCost()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="mb-6">
            <h4 className="font-semibold text-gray-700 mb-3">Ask AI Assistant</h4>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={askAI}
                  onChange={(e) => setAskAI(e.target.value)}
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ask about materials, recommendations, or cost analysis..."
                />
                <button 
                  onClick={handleAskAI}
                  disabled={isAskingAI}
                  className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition disabled:bg-blue-300"
                >
                  {isAskingAI ? 'Thinking...' : 'Ask'}
                </button>
              </div>
              
              {aiResponse && (
                <div className="mt-4 bg-white p-3 rounded-lg border border-gray-200">
                  <div className="flex items-start">
                    <CornerDownRight size={16} className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    <p className="text-gray-700">{aiResponse}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-4">
            <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition flex items-center justify-center gap-2">
              <Save size={18} />
              Save Project
            </button>
            <button className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition flex items-center justify-center gap-2">
              <FileText size={18} />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TakeoffResult;
