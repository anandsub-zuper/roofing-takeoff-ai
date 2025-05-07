// 7. Header.jsx - Mobile Header Component
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LayoutGrid, Upload, FileText, Calculator, CreditCard } from 'lucide-react';

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };
  
  return (
    <div className="bg-gray-800 text-white">
      <div className="p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">Roofing Takeoff AI</h1>
        
        <button 
          className="md:hidden text-white focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="p-4 border-t border-gray-700 md:hidden">
          <ul className="space-y-2">
            <li>
              <Link 
                to="/"
                className="block py-2 px-3 rounded flex items-center hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutGrid size={18} className="mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                to="/new-takeoff"
                className="block py-2 px-3 rounded flex items-center hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Upload size={18} className="mr-2" />
                New Takeoff
              </Link>
            </li>
            <li>
              <Link 
                to="#"
                className="block py-2 px-3 rounded flex items-center hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FileText size={18} className="mr-2" />
                Projects
              </Link>
            </li>
            <li>
              <Link 
                to="#"
                className="block py-2 px-3 rounded flex items-center hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Calculator size={18} className="mr-2" />
                Estimates
              </Link>
            </li>
            <li>
              <Link 
                to="#"
                className="block py-2 px-3 rounded flex items-center hover:bg-gray-700"
                onClick={() => setMobileMenuOpen(false)}
              >
                <CreditCard size={18} className="mr-2" />
                Billing
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
}

export default Header;
