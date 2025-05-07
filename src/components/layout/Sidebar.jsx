// 6. Sidebar.jsx - Sidebar Navigation Component
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Upload, FileText, Calculator, CreditCard } from 'lucide-react';

function Sidebar() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path) => {
    return currentPath === path;
  };
  
  return (
    <div className="bg-gray-800 text-white w-64 flex-shrink-0 hidden md:block">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold">Roofing Takeoff AI</h1>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/"
              className={`block py-2 px-3 rounded flex items-center ${isActive('/') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <LayoutGrid size={18} className="mr-2" />
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/new-takeoff"
              className={`block py-2 px-3 rounded flex items-center ${isActive('/new-takeoff') ? 'bg-blue-600' : 'hover:bg-gray-700'}`}
            >
              <Upload size={18} className="mr-2" />
              New Takeoff
            </Link>
          </li>
          <li>
            <Link 
              to="#"
              className="block py-2 px-3 rounded flex items-center hover:bg-gray-700"
            >
              <FileText size={18} className="mr-2" />
              Projects
            </Link>
          </li>
          <li>
            <Link 
              to="#"
              className="block py-2 px-3 rounded flex items-center hover:bg-gray-700"
            >
              <Calculator size={18} className="mr-2" />
              Estimates
            </Link>
          </li>
          <li>
            <Link 
              to="#"
              className="block py-2 px-3 rounded flex items-center hover:bg-gray-700"
            >
              <CreditCard size={18} className="mr-2" />
              Billing
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default Sidebar;
