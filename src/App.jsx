// 1. App.jsx - Main Application Component
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Sidebar from './components/layout/Sidebar';
import Header from './components/layout/Header';
import Dashboard from './components/pages/Dashboard';
import NewTakeoff from './components/pages/NewTakeoff';
import TakeoffResult from './components/pages/TakeoffResult';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="flex flex-col h-screen bg-gray-100">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/new-takeoff" element={<NewTakeoff />} />
                <Route path="/takeoff-result/:id" element={<TakeoffResult />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;
