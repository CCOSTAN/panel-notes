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

export default function App() {
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
          <h1>Main panel</h1>
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

      <div className="layout">
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
      </div>

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
                Close
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
