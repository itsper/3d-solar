import React from 'react';
import useStore from '../../store/useStore';

export default function InspectorPanel() {
  const { scene, updateObject, removeObject, setTransformMode } = useStore();
  const { objects, selectedObjectId, transformMode } = scene;

  const selectedObject = objects.find((obj) => obj.id === selectedObjectId);

  if (!selectedObject) {
    return (
      <div className="inspector-panel">
        <div className="inspector-section">
          <h3 className="inspector-title">Inspector</h3>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>
            Select an object to view its properties
          </p>
        </div>
      </div>
    );
  }

  const handlePropertyChange = (property, value) => {
    updateObject(selectedObject.id, {
      properties: {
        ...selectedObject.properties,
        [property]: value,
      },
    });
  };

  const handleDelete = () => {
    removeObject(selectedObject.id);
  };

  const transformModes = [
    { id: 'translate', label: 'Move', icon: '↔' },
    { id: 'rotate', label: 'Rotate', icon: '↻' },
    { id: 'scale', label: 'Resize', icon: '⤢' },
  ];

  return (
    <div className="inspector-panel">
      <div className="inspector-section">
        <h3 className="inspector-title">Object Info</h3>
        <div className="inspector-row">
          <span className="inspector-label">Type</span>
          <span className="inspector-value" style={{ textTransform: 'capitalize' }}>
            {selectedObject.type}
          </span>
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Name</span>
          <input
            type="text"
            className="input"
            value={selectedObject.name}
            onChange={(e) =>
              updateObject(selectedObject.id, { name: e.target.value })
            }
            style={{ width: '120px', textAlign: 'right' }}
          />
        </div>
      </div>

      <div className="inspector-section">
        <h3 className="inspector-title">Transform</h3>
        <div className="inspector-row">
          <span className="inspector-label">Position X</span>
          <input
            type="number"
            className="input"
            value={selectedObject.position[0]?.toFixed(2) || 0}
            onChange={(e) =>
              updateObject(selectedObject.id, {
                position: [parseFloat(e.target.value), selectedObject.position[1], selectedObject.position[2]],
              })
            }
            style={{ width: '70px', textAlign: 'right' }}
          />
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Position Y</span>
          <input
            type="number"
            className="input"
            value={selectedObject.position[1]?.toFixed(2) || 0}
            onChange={(e) =>
              updateObject(selectedObject.id, {
                position: [selectedObject.position[0], parseFloat(e.target.value), selectedObject.position[2]],
              })
            }
            style={{ width: '70px', textAlign: 'right' }}
          />
        </div>
        <div className="inspector-row">
          <span className="inspector-label">Position Z</span>
          <input
            type="number"
            className="input"
            value={selectedObject.position[2]?.toFixed(2) || 0}
            onChange={(e) =>
              updateObject(selectedObject.id, {
                position: [selectedObject.position[0], selectedObject.position[1], parseFloat(e.target.value)],
              })
            }
            style={{ width: '70px', textAlign: 'right' }}
          />
        </div>
      </div>

      <div className="inspector-section">
        <h3 className="inspector-title">Transform Mode</h3>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
          {transformModes.map((mode) => (
            <button
              key={mode.id}
              className={`btn ${transformMode === mode.id ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTransformMode(mode.id)}
              style={{
                flex: 1,
                padding: '8px',
                fontSize: '0.875rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
              }}
              title={`Press ${mode.id[0].toUpperCase()} to switch`}
            >
              <span style={{ fontSize: '1.25rem' }}>{mode.icon}</span>
              <span>{mode.label}</span>
            </button>
          ))}
        </div>
        <p style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '8px' }}>
          Keyboard shortcuts: T (Move), R (Rotate), S (Resize)
        </p>
      </div>

      {/* Solar Panel Properties */}
      {selectedObject.type === 'solarPanel' && (
        <div className="inspector-section">
          <h3 className="inspector-title">Panel Specs</h3>
          <div className="inspector-row">
            <span className="inspector-label">Wattage (W)</span>
            <input
              type="number"
              className="input"
              value={selectedObject.properties?.wattage || 400}
              onChange={(e) => handlePropertyChange('wattage', parseFloat(e.target.value))}
              style={{ width: '70px', textAlign: 'right' }}
            />
          </div>
          <div className="inspector-row">
            <span className="inspector-label">Voltage (V)</span>
            <input
              type="number"
              className="input"
              value={selectedObject.properties?.voltage || 48}
              onChange={(e) => handlePropertyChange('voltage', parseFloat(e.target.value))}
              style={{ width: '70px', textAlign: 'right' }}
            />
          </div>
        </div>
      )}

      {/* Inverter Properties */}
      {selectedObject.type === 'inverter' && (
        <div className="inspector-section">
          <h3 className="inspector-title">Inverter Specs</h3>
          <div className="inspector-row">
            <span className="inspector-label">Capacity (W)</span>
            <input
              type="number"
              className="input"
              value={selectedObject.properties?.capacity || 5000}
              onChange={(e) => handlePropertyChange('capacity', parseFloat(e.target.value))}
              style={{ width: '70px', textAlign: 'right' }}
            />
          </div>
          <div className="inspector-row">
            <span className="inspector-label">Efficiency</span>
            <input
              type="number"
              className="input"
              value={(selectedObject.properties?.efficiency || 0.96) * 100}
              onChange={(e) => handlePropertyChange('efficiency', parseFloat(e.target.value) / 100)}
              style={{ width: '70px', textAlign: 'right' }}
            />
          </div>
        </div>
      )}

      {/* Battery Properties */}
      {selectedObject.type === 'battery' && (
        <div className="inspector-section">
          <h3 className="inspector-title">Battery Specs</h3>
          <div className="inspector-row">
            <span className="inspector-label">Capacity (Wh)</span>
            <input
              type="number"
              className="input"
              value={selectedObject.properties?.capacity || 5000}
              onChange={(e) => handlePropertyChange('capacity', parseFloat(e.target.value))}
              style={{ width: '70px', textAlign: 'right' }}
            />
          </div>
          <div className="inspector-row">
            <span className="inspector-label">Voltage (V)</span>
            <input
              type="number"
              className="input"
              value={selectedObject.properties?.voltage || 48}
              onChange={(e) => handlePropertyChange('voltage', parseFloat(e.target.value))}
              style={{ width: '70px', textAlign: 'right' }}
            />
          </div>
        </div>
      )}

      <div className="inspector-section" style={{ marginTop: '24px' }}>
        <button className="btn btn-danger" onClick={handleDelete} style={{ width: '100%' }}>
          Delete Object
        </button>
      </div>
    </div>
  );
}
