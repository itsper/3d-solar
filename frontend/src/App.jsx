import React, { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useStore from './store/useStore';
import Scene from './components/3d/Scene';
import Sidebar from './components/ui/Sidebar';
import RightSidebar from './components/ui/RightSidebar'; // New Import
import { authAPI } from './services/api';

function App() {
  const { scene, project, user, setMode, saveProject, newProject, setUser, logout, addObject } = useStore();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  
  // Left Sidebar States
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
      if (!confirm('You have unsaved changes. Create new project anyway?')) return;
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
      <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0f172a' }}>
        
        {/* LEFT SIDEBAR (Assets & Tools) */}
        {sidebarVisible && (
          <Sidebar 
            onAddComponent={handleAddComponent} 
            isCollapsed={sidebarCollapsed}
            toggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        )}

        {/* Floating Show Button for Left Sidebar */}
        {!sidebarVisible && (
          <button
            className="btn btn-secondary"
            onClick={() => setSidebarVisible(true)}
            title="Show Menu"
            style={{
              position: 'absolute',
              left: '12px',
              top: '80px',
              zIndex: 60,
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        )}

        {/* MAIN WORKSPACE */}
        <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          {/* HEADER */}
          <div style={{
            height: '50px',
            background: 'rgba(30, 41, 59, 0.9)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 50,
            position: 'relative'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <input
                type="text"
                className="input"
                value={project.name}
                onChange={(e) => useStore.getState().project.name = e.target.value}
                style={{ width: '200px', background: 'transparent', border: 'none', fontSize: '1rem', fontWeight: 600, color: 'white' }}
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
              
              <button className="btn btn-secondary" onClick={handleSave}>Save</button>
              <button className="btn btn-secondary" onClick={handleExport}>Export</button>
              
              {/* Optional: Sidebar Toggle in Header */}
              <button 
                className="btn btn-secondary" 
                onClick={() => setSidebarVisible(!sidebarVisible)}
                title={sidebarVisible ? 'Hide Menu' : 'Show Menu'}
              >
                {sidebarVisible ? 'Hide Menu' : 'Menu'}
              </button>

              {user.isAuthenticated ? (
                <button className="btn btn-danger" onClick={logout}>Logout</button>
              ) : (
                <button className="btn btn-primary" onClick={() => setShowAuthModal(true)}>Login</button>
              )}
            </div>
          </div>

          {/* 3D SCENE CONTAINER */}
          <div className="canvas-container" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}>
            <Scene />
            {mode === 'wire' && (
              <div className="mode-indicator">
                Wire Mode: Click first component, then second component to connect
              </div>
            )}
          </div>

          {/* RIGHT SIDEBAR (Inspector & System Calculations) */}
          <RightSidebar />

        </div>

        {/* AUTH MODAL */}
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