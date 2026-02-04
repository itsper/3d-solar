import React, { useState, useEffect } from 'react';
import { FiChevronRight, FiChevronLeft, FiActivity, FiSettings } from 'react-icons/fi';
import InspectorPanel from './InspectorPanel';
import CalculationPanel from './CalculationPanel';
import useStore from '../../store/useStore';
import './RightSidebar.css'; // We will create this next

export default function RightSidebar() {
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('inspector'); // 'inspector' or 'calculations'
  
  // Auto-switch to Inspector when an object is selected
  const selectedObjectId = useStore((state) => state.scene.selectedObjectId);
  
  useEffect(() => {
    if (selectedObjectId) {
      setActiveTab('inspector');
      if (!isOpen) setIsOpen(true);
    }
  }, [selectedObjectId]);

  return (
    <div className={`right-sidebar ${isOpen ? 'open' : 'closed'}`}>
      
      {/* Toggle Button (Floating on the left edge of the sidebar) */}
      <button 
        className="right-sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        title={isOpen ? "Collapse Panel" : "Expand Panel"}
      >
        {isOpen ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      {/* Main Content Area */}
      <div className="right-sidebar-content">
        
        {/* Header / Tabs */}
        <div className="right-sidebar-header">
          <button 
            className={`tab-btn ${activeTab === 'inspector' ? 'active' : ''}`}
            onClick={() => setActiveTab('inspector')}
          >
            <FiSettings className="tab-icon" />
            <span>Inspector</span>
          </button>
          <button 
            className={`tab-btn ${activeTab === 'calculations' ? 'active' : ''}`}
            onClick={() => setActiveTab('calculations')}
          >
            <FiActivity className="tab-icon" />
            <span>System</span>
          </button>
        </div>

        {/* Scrollable Panel Content */}
        <div className="right-sidebar-body">
          {activeTab === 'inspector' ? (
            <InspectorPanel />
          ) : (
            <CalculationPanel />
          )}
        </div>
      </div>
    </div>
  );
}