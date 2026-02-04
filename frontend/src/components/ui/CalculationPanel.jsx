import React from 'react';
import useStore from '../../store/useStore';

export default function CalculationPanel() {
  const { calculations } = useStore();
  const {
    totalPanelWattage,
    totalPanelCount,
    inverterCapacity,
    batteryCapacity,
    systemVoltage,
    estimatedDailyProduction,
    warnings,
  } = calculations;

  return (
    <div className="calculation-panel-content">
      <div className="calculation-grid">
        <div className="calculation-card">
          <div className="calculation-label">Total Panels</div>
          <div className="calculation-value">{totalPanelCount}</div>
        </div>

        <div className="calculation-card">
          <div className="calculation-label">Total Wattage</div>
          <div className="calculation-value">
            {totalPanelWattage.toLocaleString()}W
          </div>
        </div>

        <div className="calculation-card">
          <div className="calculation-label">Inverter Capacity</div>
          <div className="calculation-value">
            {inverterCapacity > 0 ? `${(inverterCapacity / 1000).toFixed(1)}kW` : '—'}
          </div>
        </div>

        <div className="calculation-card">
          <div className="calculation-label">Battery Storage</div>
          <div className="calculation-value">
            {batteryCapacity > 0 ? `${(batteryCapacity / 1000).toFixed(1)}kWh` : '—'}
          </div>
        </div>

        <div className="calculation-card">
          <div className="calculation-label">System Voltage</div>
          <div className="calculation-value">{systemVoltage}V</div>
        </div>

        <div className="calculation-card" style={{ background: 'rgba(16, 185, 129, 0.2)', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
          <div className="calculation-label">Daily Production</div>
          <div className="calculation-value">
            {estimatedDailyProduction > 0 ? `${estimatedDailyProduction.toFixed(2)} kWh` : '—'}
          </div>
        </div>
      </div>

      {warnings.length > 0 && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ 
            fontSize: '0.75rem', 
            color: '#f59e0b', 
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            marginBottom: '8px'
          }}>
            Warnings
          </h4>
          {warnings.map((warning, index) => (
            <div
              key={index}
              style={{
                padding: '8px 12px',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.2)',
                borderRadius: '6px',
                marginBottom: '4px',
                fontSize: '0.875rem',
                color: '#fbbf24',
              }}
            >
              ⚠️ {warning}
            </div>
          ))}
        </div>
      )}

      {totalPanelCount === 0 && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '6px',
          fontSize: '0.875rem',
          color: '#94a3b8',
        }}>
          Add solar panels to start calculating system production
        </div>
      )}
    </div>
  );
}
