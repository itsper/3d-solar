import React, { useState } from 'react';
import { 
  FiSun, FiZap, FiBattery, FiHome, FiLayout, FiInfo, 
  FiChevronLeft, FiChevronRight 
} from 'react-icons/fi';
import './Sidebar.css'; 

const COMPONENT_TYPES = [
  { type: 'solarPanel', name: 'Solar Panel', icon: <FiSun />, color: '#3b82f6', description: 'Add PV modules' },
  { type: 'inverter', name: 'Inverter', icon: <FiZap />, color: '#10b981', description: 'DC to AC converter' },
  { type: 'battery', name: 'Battery', icon: <FiBattery />, color: '#f59e0b', description: 'Energy storage' },
  { type: 'roof', name: 'Roof', icon: <FiHome />, color: '#8b4513', description: 'Base structure' },
  { type: 'wall', name: 'Wall', icon: <FiLayout />, color: '#6b7280', description: 'Boundaries' },
];

// Added props: isCollapsed and toggleSidebar
export default function Sidebar({ onAddComponent, isCollapsed, toggleSidebar }) {
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <div 
      className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}
      onMouseEnter={() => isCollapsed && setHoveredItem(null)}
    >
      {/* Header Section */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon-wrapper">
            <FiSun className="logo-icon spin-slow" />
          </div>
          <span className={`logo-text ${isCollapsed ? 'hidden' : ''}`}>
            PV Builder
          </span>
        </div>
        
        {/* Internal Toggle Button - triggers the prop function */}
        <button 
          className="toggle-btn"
          onClick={toggleSidebar}
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
        </button>
      </div>

      {/* Components List */}
      <div className="sidebar-content">
        <div className="section-label">
          <span className={isCollapsed ? 'hidden' : ''}>Components</span>
          {isCollapsed && <span className="dot"></span>}
        </div>

        <div className="components-list">
          {COMPONENT_TYPES.map((comp) => (
            <button
              key={comp.type}
              className={`component-btn ${hoveredItem === comp.type ? 'active' : ''}`}
              onClick={() => onAddComponent(comp.type)}
              onMouseEnter={() => setHoveredItem(comp.type)}
              onMouseLeave={() => setHoveredItem(null)}
              style={{ '--accent-color': comp.color }}
            >
              <div className="icon-box">
                {comp.icon}
              </div>
              
              <div className={`info-box ${isCollapsed ? 'hidden' : ''}`}>
                <span className="comp-name">{comp.name}</span>
                <span className="comp-desc">{comp.description}</span>
              </div>

              {isCollapsed && hoveredItem === comp.type && (
                <div className="sidebar-tooltip">
                  {comp.name}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className={`tips-card ${isCollapsed ? 'collapsed-card' : ''}`}>
          <div className="tips-header">
            <FiInfo className="tips-icon" />
            <span className={isCollapsed ? 'hidden' : ''}>Quick Tips</span>
          </div>
          <div className={`tips-content ${isCollapsed ? 'hidden' : ''}`}>
            <p>• Click to add items</p>
            <p>• Drag to move</p>
            <p>• 'R' to rotate</p>
            <p>• 'Del' to remove</p>
          </div>
        </div>
      </div>
    </div>
  );
}