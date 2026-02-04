import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useStore from './store/useStore';
import Scene from './components/3d/Scene';
import Sidebar from './components/ui/Sidebar';
import InspectorPanel from './components/ui/InspectorPanel';
import CalculationPanel from './components/ui/CalculationPanel';
import { authAPI } from './services/api';

function App() {
  const { scene, project, user, setMode, saveProject, newProject, setUser, logout, addObject } = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (user.token) {
      authAPI.getMe()
        .then((data) => setUser(data.user, user.token))
        .catch(() => logout());
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      if (authMode === 'login') {
        const data = await authAPI.login(authForm.email, authForm.password);
        setUser(data.user, data.token);
      } else {
        const data = await authAPI.register(authForm.email, authForm.password, authForm.name);
        setUser(data.user, data.token);
      }
      setShowAuthModal(false);
      setAuthForm({ email: '', password: '', name: '' });
    } catch (error) {
      setAuthError(error.response?.data?.error || 'Authentication failed');
    }
  };

  const handleSave = async () => {
    if (!user.isAuthenticated) {
      setShowAuthModal(true);
      setAuthMode('login');
      return;
    }
    
    try {
      await saveProject();
      alert('Project saved successfully!');
    } catch (error) {
      alert('Failed to save project: ' + error.message);
    }
  };

  const handleNewProject = () => {
    if (project.isDirty) {
      if (!confirm('You have unsaved changes. Create new project anyway?')) {
        return;
      }
    }
    newProject();
  };

  const handleExport = () => {
    const data = JSON.stringify(useStore.getState().exportScene(), null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_solar_pv.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAddComponent = (type) => {
    addObject(type, [Math.random() * 4 - 2, 0.5, Math.random() * 4 - 2]);
  };

  const mode = scene.mode;

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden' }}>
        <Sidebar onAddComponent={handleAddComponent} />

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            height: '50px',
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="text"
                className="input"
                value={project.name}
                onChange={(e) => useStore.getState().project.name = e.target.value}
                style={{ width: '200px', background: 'transparent', border: 'none', fontSize: '1rem', fontWeight: 600 }}
              />
              {project.isDirty && <span style={{ color: '#f59e0b', fontSize: '0.75rem' }}>Unsaved</span>}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                className={`btn ${mode === 'select' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('select')}
              >
                Select
              </button>
              <button
                className={`btn ${mode === 'wire' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setMode('wire')}
              >
                Wire
              </button>
              
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />
              
              <button className="btn btn-secondary" onClick={handleNewProject}>New</button>
              <button className="btn btn-secondary" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary" onClick={handleExport}>Export</button>
              
              {user.isAuthenticated ? (
                <button className="btn btn-danger" onClick={logout}>Logout</button>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>Login</button>
              )}
            </div>
          </div>

          <div className="canvas-container">
            <Scene />
            
            {mode === 'wire' && (
              <div className="mode-indicator">
                Wire Mode: Click first component, then second component to connect
              </div>
            )}
            
            {/* Quick add buttons */}
            <div style={{
              position: 'absolute',
              bottom: '220px',
              right: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              zIndex: 10,
            }}>
              <button className="btn btn-secondary" onClick={() => handleAddComponent('solarPanel')}>
                + Panel
              </button>
              <button className="btn btn-secondary" onClick={() => handleAddComponent('inverter')}>
                + Inverter
              </button>
              <button className="btn btn-secondary" onClick={() => handleAddComponent('battery')}>
                + Battery
              </button>
              <button className="btn btn-secondary" onClick={() => handleAddComponent('roof')}>
                + Roof
              </button>
              <button className="btn btn-secondary" onClick={() => handleAddComponent('wall')}>
                + Wall
              </button>
            </div>
          </div>

          <div className="bottom-panel">
            <InspectorPanel />
            <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)' }} />
            <CalculationPanel />
          </div>
        </div>

        {showAuthModal && (
          <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
          }} onClick={() => setShowAuthModal(false)}>
            <div className="glass-panel" style={{ padding: '32px', width: '400px', maxWidth: '90vw' }} onClick={(e) => e.stopPropagation()}>
              <h2 style={{ marginBottom: '24px', textAlign: 'center' }}>{authMode === 'login' ? 'Login' : 'Register'}</h2>
              
              {authError && (
                <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#ef4444', marginBottom: '16px', fontSize: '0.875rem' }}>
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuth}>
                {authMode === 'register' && (
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Name</label>
                    <input type="text" className="input" value={authForm.name} onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })} required />
                  </div>
                )}
                
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Email</label>
                  <input type="email" className="input" value={authForm.email} onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })} required />
                </div>
                
                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.875rem' }}>Password</label>
                  <input type="password" className="input" value={authForm.password} onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })} required />
                </div>
                
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
                  {authMode === 'login' ? 'Login' : 'Register'}
                </button>
                
                <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setAuthError(''); }}>
                  {authMode === 'login' ? 'Need an account? Register' : 'Have an account? Login'}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

export default App;
