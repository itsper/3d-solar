import React from 'react';

const COMPONENT_TYPES = [
  { type: 'solarPanel', name: 'Solar Panel', icon: '☀️', color: '#3b82f6' },
  { type: 'inverter', name: 'Inverter', icon: '⚡', color: '#10b981' },
  { type: 'battery', name: 'Battery', icon: '🔋', color: '#f59e0b' },
  { type: 'roof', name: 'Roof', icon: '🏠', color: '#8b4513' },
  { type: 'wall', name: 'Wall', icon: '🧱', color: '#6b7280' },
];

export default function Sidebar({ onAddComponent }) {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">
          <span style={{ color: '#3b82f6' }}>☀️</span>
          Solar PV Builder
        </h1>
      </div>
      
      <div className="sidebar-content">
        <h3 style={{ 
          fontSize: '0.75rem', 
          color: '#94a3b8', 
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '12px'
        }}>
          Components
        </h3>
        
        {COMPONENT_TYPES.map((comp) => (
          <div
            key={comp.type}
            className="component-item"
            onClick={() => onAddComponent(comp.type)}
          >
            <span style={{ fontSize: '1.25rem' }}>{comp.icon}</span>
            <span style={{ fontWeight: 500 }}>{comp.name}</span>
          </div>
        ))}

        <div style={{ 
          marginTop: '24px', 
          padding: '12px', 
          background: 'rgba(59, 130, 246, 0.1)',
          borderRadius: '8px',
          fontSize: '0.75rem',
          color: '#94a3b8'
        }}>
          <p style={{ marginBottom: '8px', fontWeight: 500 }}>Tips</p>
          <ul style={{ paddingLeft: '16px', margin: 0 }}>
            <li>Click components to add</li>
            <li>Use + buttons on canvas</li>
            <li>Click to select objects</li>
            <li>Press Delete to remove</li>
            <li>Switch to Wire mode to connect</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
