import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const API_BASE = 'http://localhost:8000/api';

function App() {
  const [resources, setResources] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Filters
  const [typeFilter, setTypeFilter] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  
  // Form State
  const [formData, setFormData] = useState({
    department: '',
    user_name: '',
    event_title: ''
  });

  // Separate time picker state
  const emptyTime = { date: '', hour: '8', minute: '00', ampm: 'AM' };
  const [startTime, setStartTime] = useState(emptyTime);
  const [endTime, setEndTime] = useState(emptyTime);

  const [errorMsg, setErrorMsg] = useState('');


  const fetchResources = async () => {
    try {
      const res = await axios.get(`${API_BASE}/resources`);
      setResources(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch resources', err);
    }
  };

  // Helper: returns today's date as YYYY-MM-DD in local time
  const getTodayStr = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const [viewDate, setViewDate] = useState(getTodayStr());

  useEffect(() => {
    fetchResources();
    fetchBookings(getTodayStr());

    // Auto-refresh at midnight: recalculate "today" and reload bookings
    const msUntilMidnight = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      return midnight - now;
    };
    const timer = setTimeout(() => {
      const today = getTodayStr();
      setViewDate(today);
      fetchBookings(today);
    }, msUntilMidnight());

    return () => clearTimeout(timer);
  }, []);

  const fetchBookings = async (date) => {
    try {
      const dateParam = date || viewDate;
      const res = await axios.get(`${API_BASE}/bookings?date=${dateParam}`);
      setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings', err);
    }
  };

  const openBookingModal = (resource) => {
    setSelectedResource(resource);
    setFormData({ department: '', user_name: '', event_title: '' });
    setStartTime({ date: '', hour: '8', minute: '00', ampm: 'AM' });
    setEndTime({ date: '', hour: '8', minute: '00', ampm: 'AM' });
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    setSelectedResource(null);
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Convert custom AM/PM picker to a Date object
  const pickerToDate = ({ date, hour, minute, ampm }) => {
    if (!date) return null;
    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h !== 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const d = new Date(date);
    d.setHours(h, parseInt(minute, 10), 0, 0);
    return d;
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!startTime.date || !endTime.date) {
      setErrorMsg('Please select a date for both start and end time.');
      return;
    }

    const st = pickerToDate(startTime);
    const et = pickerToDate(endTime);

    const startMins = st.getHours() * 60 + st.getMinutes();
    const endMins = et.getHours() * 60 + et.getMinutes();

    if (startMins < 8 * 60) {
      setErrorMsg('Start time cannot be before 8:00 AM.');
      return;
    }
    if (endMins > 16 * 60) {
      setErrorMsg('End time cannot be after 4:00 PM.');
      return;
    }
    if (et <= st) {
      setErrorMsg('End time must be after start time.');
      return;
    }

    try {
      await axios.post(`${API_BASE}/bookings`, {
        resource_id: selectedResource.id,
        ...formData,
        start_time: st.toISOString(),
        end_time: et.toISOString()
      });
      closeBookingModal();
      fetchBookings(getTodayStr());
      setActiveTab('reservations');
    } catch (err) {
      if (err.response && err.response.status === 409) {
        setErrorMsg(err.response.data.message);
      } else if (err.response && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg('An unexpected error occurred.');
      }
    }
  };

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await axios.delete(`${API_BASE}/bookings/${id}`);
      fetchBookings(getTodayStr());
    } catch (err) {
      alert('Failed to cancel booking');
    }
  };

  const filteredResources = typeFilter 
    ? resources.filter(r => r.type === typeFilter)
    : resources;

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="logo">🎓</span>
          <h2>Campus Reserve</h2>
        </div>
        
        <ul className="nav-menu">
          <li className={activeTab === 'dashboard' ? 'active' : ''} onClick={() => setActiveTab('dashboard')}>
            <span className="icon">📊</span> Dashboard
          </li>
          <li className={activeTab === 'reservations' ? 'active' : ''} onClick={() => setActiveTab('reservations')}>
            <span className="icon">📅</span> Active Reservations
          </li>
          <li className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <span className="icon">⚙️</span> Settings
          </li>
        </ul>
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar">AD</div>
            <div className="user-info">
              <span className="name">Admin User</span>
              <span className="role">Administrator</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="main-content">
        <header className="top-header">
          <div>
            <h1>
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'reservations' && 'Active Reservations'}
              {activeTab === 'settings' && 'System Settings'}
            </h1>
            <p className="subtitle">Institutional Facility Reservation System</p>
          </div>
          {activeTab === 'dashboard' && (
            <div className="header-actions">
              <span className="date-badge">📅 {new Date().toLocaleDateString()}</span>
            </div>
          )}
        </header>

        <div className="content-area">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="fade-in">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-title">Total Facilities</div>
                  <div className="stat-value">{resources.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">Active Bookings</div>
                  <div className="stat-value">{bookings.length}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-title">System Status</div>
                  <div className="stat-value status-online">Online</div>
                </div>
              </div>

              <div className="section-header">
                <h2>Available Resources</h2>
                <div className="filters">
                  <label>Filter:</label>
                  <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                    <option value="">All Facilities</option>
                    <option value="seminar_hall">Seminar Hall</option>
                    <option value="lab">Laboratory</option>
                    <option value="classroom">Classroom</option>
                    <option value="amphitheater">Amphitheater</option>
                    <option value="board_room">Board Room</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="loading-state">Loading facilities...</div>
              ) : (
                <div className="grid">
                  {filteredResources.map(resource => (
                    <div key={resource.id} className="card">
                      <h3>{resource.name}</h3>
                      <p><strong>Type:</strong> <span className="badge">{resource.type.replace('_', ' ')}</span></p>
                      <p><strong>Capacity:</strong> {resource.capacity} seats</p>
                      <p className="location-text">📍 {resource.location}</p>
                      <button onClick={() => openBookingModal(resource)}>Reserve Facility</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reservations Tab */}
          {activeTab === 'reservations' && (
            <div className="fade-in">
              <div className="section-header">
                <div>
                  <h2>Today's Reservations</h2>
                  <p className="section-subtext">
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    {bookings.length > 0 && <span className="booking-count-badge">{bookings.length} booking{bookings.length > 1 ? 's' : ''}</span>}
                  </p>
                </div>
              </div>
              
              <div className="booking-list">
                {bookings.length === 0 ? (
                  <div className="empty-state">
                    <span className="empty-icon">📁</span>
                    <p>No reservations made today.</p>
                    <button onClick={() => setActiveTab('dashboard')}>Browse Facilities</button>
                  </div>
                ) : (
                  bookings.map(b => (
                    <div key={b.id} className="booking-item">
                      <div className="booking-info">
                        <strong>{b.event_title}</strong>
                        <span className="facility-name">
                          {resources.find(r => r.id === b.resource_id)?.name || b.resource_id}
                        </span>
                        <small>👤 {b.user_name} &nbsp;|&nbsp; 🏢 {b.department}</small>
                        <small>🕒 {new Date(b.start_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })} — {new Date(b.end_time).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}</small>
                      </div>
                      <button onClick={() => handleDeleteBooking(b.id)} className="btn-danger">Cancel</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Settings Tab Placeholder */}
          {activeTab === 'settings' && (
            <div className="fade-in empty-state">
              <span className="empty-icon">⚙️</span>
              <h2>System Settings</h2>
              <p>Configuration options will be available here.</p>
            </div>
          )}
        </div>
      </main>

      {/* Booking Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal fade-in">
            <h2>Book {selectedResource?.name}</h2>
            {errorMsg && <div className="error-alert">{errorMsg}</div>}
            
            <form onSubmit={handleSubmitBooking}>
              <div className="form-row">
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" name="department" required value={formData.department} onChange={handleInputChange} placeholder="e.g. Computer Science" />
                </div>
                <div className="form-group">
                  <label>Full Name</label>
                  <input type="text" name="user_name" required value={formData.user_name} onChange={handleInputChange} placeholder="e.g. Prof. Smith" />
                </div>
              </div>
              
              <div className="form-group">
                <label>Event Title</label>
                <input type="text" name="event_title" required value={formData.event_title} onChange={handleInputChange} placeholder="e.g. AI Colloquium" />
              </div>
              
              <div className="form-row">
                <div className="form-group time-picker-group">
                  <label>Start Date &amp; Time</label>
                  <input
                    type="date"
                    required
                    value={startTime.date}
                    onChange={e => setStartTime({ ...startTime, date: e.target.value })}
                  />
                  <div className="time-selects">
                    <select required value={startTime.hour} onChange={e => setStartTime({ ...startTime, hour: e.target.value })}>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select required value={startTime.minute} onChange={e => setStartTime({ ...startTime, minute: e.target.value })}>
                      {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select required value={startTime.ampm} onChange={e => setStartTime({ ...startTime, ampm: e.target.value })}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
                <div className="form-group time-picker-group">
                  <label>End Date &amp; Time</label>
                  <input
                    type="date"
                    required
                    value={endTime.date}
                    onChange={e => setEndTime({ ...endTime, date: e.target.value })}
                  />
                  <div className="time-selects">
                    <select required value={endTime.hour} onChange={e => setEndTime({ ...endTime, hour: e.target.value })}>
                      {[1,2,3,4,5,6,7,8,9,10,11,12].map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <select required value={endTime.minute} onChange={e => setEndTime({ ...endTime, minute: e.target.value })}>
                      {['00','15','30','45'].map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select required value={endTime.ampm} onChange={e => setEndTime({ ...endTime, ampm: e.target.value })}>
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button type="button" onClick={closeBookingModal}>Cancel</button>
                <button type="submit" className="btn-primary">Confirm Booking</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
