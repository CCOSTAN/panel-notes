import React, { useEffect, useMemo, useState } from 'react';
import {
  createDevice,
  getBreakers,
  getDevices,
  saveBreaker,
  searchEntities,
  deleteDevice,
  updateDevice
} from './api.js';
import Dashboard from './pages/Dashboard.jsx';
import DevicesPage from './pages/Devices.jsx';
import SearchPage from './pages/Search.jsx';
import BreakerDetail from './pages/BreakerDetail.jsx';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'devices', label: 'Lights / Devices' },
  { id: 'search', label: 'Search' }
];

const pullToRefreshStorage = 'cc.pull_to_refresh.v1';

const usePullToRefreshReload = () => {
  useEffect(() => {
    const enabled = localStorage.getItem(pullToRefreshStorage);
    if (enabled === '0') return;

    let startY = null;
    let triggered = false;
    let pulling = false;

    const isAtTop = () => (window.scrollY || document.documentElement.scrollTop || 0) <= 0;

    const onTouchStart = (e) => {
      if (!isAtTop()) return;
      if (!e.touches || e.touches.length !== 1) return;
      startY = e.touches[0].clientY;
      triggered = false;
      pulling = true;
    };

    const onTouchMove = (e) => {
      if (!pulling || startY === null || triggered) return;
      if (!isAtTop()) return;
      const dy = e.touches[0].clientY - startY;
      if (dy > 90) {
        triggered = true;
        window.location.reload();
      }
    };

    const onTouchEnd = () => {
      startY = null;
      pulling = false;
      triggered = false;
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);
};

export default function App() {
  usePullToRefreshReload();
  const [breakers, setBreakers] = useState([]);
  const [devices, setDevices] = useState([]);
  const [selectedBreakerId, setSelectedBreakerId] = useState(null);
  const [showEditor, setShowEditor] = useState(false);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState({ breakers: [], devices: [] });

  useEffect(() => {
    (async () => {
      try {
        await refreshData();
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const selectedBreaker = useMemo(
    () => breakers.find((b) => b.id === selectedBreakerId) || null,
    [selectedBreakerId, breakers]
  );

  async function refreshData() {
    const [breakerData, deviceData] = await Promise.all([getBreakers(), getDevices()]);
    setBreakers(breakerData);
    setDevices(deviceData);
    if (!selectedBreakerId && breakerData.length) {
      setSelectedBreakerId(breakerData[0].id);
    }
  }

  async function handleSaveBreaker(payload) {
    if (!selectedBreaker) return;
    try {
      const updated = await saveBreaker(selectedBreaker.id, payload);
      const nextBreakers = breakers.map((b) => (b.id === updated.id ? updated : b));
      setBreakers(nextBreakers);
      const refreshedDevices = await getDevices();
      setDevices(refreshedDevices);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleCreateDevice(payload) {
    try {
      const created = await createDevice(payload);
      setDevices([...devices, created]);
      if (payload.linkedBreakers?.length) {
        await refreshData();
      }
      setError('');
      return created;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function handleUpdateDevice(id, payload) {
    try {
      const updated = await updateDevice(id, payload);
      const next = devices.map((d) => (d.id === id ? updated : d));
      setDevices(next);
      await refreshData();
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDeleteDevice(id) {
    try {
      await deleteDevice(id);
      const next = devices.filter((d) => d.id !== id);
      setDevices(next);
      await refreshData();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSearch(query) {
    if (!query) {
      setSearchResults({ breakers: [], devices: [] });
      return;
    }
    try {
      const results = await searchEntities(query);
      setSearchResults(results);
      setError('');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Panel Notes</p>
          <h1>Main Panel</h1>
        </div>
        <div className="topbar-actions">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`nav-button ${view === tab.id ? 'active' : ''}`}
              onClick={() => setView(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      {error && <div className="toast error">⚠️ {error}</div>}

      <main className="layout">
        <section className="primary-pane">
          {loading ? (
            <div className="card">Loading panel data.</div>
          ) : view === 'dashboard' ? (
            <Dashboard
              breakers={breakers}
              onSelect={(id) => setSelectedBreakerId(id)}
              onEdit={(id) => {
                setSelectedBreakerId(id);
                setShowEditor(true);
              }}
              selectedId={selectedBreakerId}
            />
          ) : view === 'devices' ? (
            <DevicesPage
              breakers={breakers}
              devices={devices}
              onCreateDevice={handleCreateDevice}
              onUpdateDevice={handleUpdateDevice}
              onDeleteDevice={handleDeleteDevice}
              onSelectBreaker={(id) => {
                setSelectedBreakerId(id);
                setView('dashboard');
              }}
            />
          ) : (
            <SearchPage
              breakers={breakers}
              devices={devices}
              results={searchResults}
              onSearch={handleSearch}
              onSelectBreaker={(id) => {
                setSelectedBreakerId(id);
                setView('dashboard');
              }}
            />
          )}
        </section>
      </main>

      <nav className="bottom-nav">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={`bottom-nav-item ${view === tab.id ? 'active' : ''}`}
            onClick={() => setView(tab.id)}
          >
            <span className="bottom-nav-icon">
              {tab.id === 'dashboard' ? '⚡' : tab.id === 'devices' ? '💡' : '🔍'}
            </span>
            <span>{tab.label}</span>
          </div>
        ))}
      </nav>

      <footer className="app-footer">
        <div className="footer-links">
          <span className="footer-copy">c {new Date().getFullYear()} vCloudInfo.com</span>
          <a href="https://www.vcloudinfo.com" target="_blank" rel="noopener noreferrer">
            Home
          </a>
          <a href="https://x.com/ccostan" target="_blank" rel="noopener noreferrer">
            Follow on X
          </a>
          <a href="https://github.com/CCOSTAN" target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href="https://www.linkedin.com/in/ccostan/" target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
          <a href="/panel-photo" target="_blank" rel="noopener noreferrer">
            Panel Photo
          </a>
        </div>
      </footer>

      {showEditor && selectedBreaker && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setShowEditor(false);
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="modal-close">
              <button className="ghost" onClick={() => setShowEditor(false)}>
                ✕
              </button>
            </div>
            <BreakerDetail
              breaker={selectedBreaker}
              devices={devices}
              onSave={async (payload) => {
                await handleSaveBreaker(payload);
                setShowEditor(false);
              }}
              onCreateDevice={handleCreateDevice}
            />
          </div>
        </div>
      )}
    </div>
  );
}
