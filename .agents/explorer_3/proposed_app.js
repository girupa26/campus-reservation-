/**
 * Campus Reserve - Academic Event & Resource Booking Portal
 * Frontend Application Logic (Vanilla ES6+)
 */

(() => {
  'use strict';

  // Application State
  const state = {
    resources: [],
    bookings: [],
    activeCategory: 'all',
    resourceSearchQuery: '',
    bookingSearchQuery: '',
    bookingResourceFilter: 'all',
    bookingDateFilter: ''
  };

  // API Endpoints
  const API = {
    RESOURCES: '/api/resources',
    BOOKINGS: '/api/bookings'
  };

  // DOM Elements
  const DOM = {
    // Stats
    statTotalResources: document.getElementById('statTotalResources'),
    statSeminarHalls: document.getElementById('statSeminarHalls'),
    statLaboratories: document.getElementById('statLaboratories'),
    statClassrooms: document.getElementById('statClassrooms'),
    statTotalBookings: document.getElementById('statTotalBookings'),

    // Tabs & Panels
    tabResources: document.getElementById('tabResources'),
    tabBookings: document.getElementById('tabBookings'),
    resourcesSection: document.getElementById('resourcesSection'),
    bookingsSection: document.getElementById('bookingsSection'),

    // Controls
    btnRefresh: document.getElementById('btnRefresh'),
    btnOpenBookingModal: document.getElementById('btnOpenBookingModal'),
    filterPills: document.querySelectorAll('.filter-pill'),
    resourceSearchInput: document.getElementById('resourceSearchInput'),
    resourceGrid: document.getElementById('resourceGrid'),

    // Bookings Table & Controls
    bookingResourceFilter: document.getElementById('bookingResourceFilter'),
    bookingDateFilter: document.getElementById('bookingDateFilter'),
    btnResetDateFilter: document.getElementById('btnResetDateFilter'),
    bookingSearchInput: document.getElementById('bookingSearchInput'),
    bookingsTableBody: document.getElementById('bookingsTableBody'),

    // Modal
    bookingModal: document.getElementById('bookingModal'),
    bookingForm: document.getElementById('bookingForm'),
    btnCloseModal: document.getElementById('btnCloseModal'),
    btnCancelModal: document.getElementById('btnCancelModal'),
    btnSubmitBooking: document.getElementById('btnSubmitBooking'),
    modalAlertBox: document.getElementById('modalAlertBox'),
    modalAlertTitle: document.getElementById('modalAlertTitle'),
    modalAlertMessage: document.getElementById('modalAlertMessage'),

    // Modal Form Fields
    modalResourceId: document.getElementById('modalResourceId'),
    modalEventTitle: document.getElementById('modalEventTitle'),
    modalUserName: document.getElementById('modalUserName'),
    modalUserId: document.getElementById('modalUserId'),
    modalDate: document.getElementById('modalDate'),
    modalStartTime: document.getElementById('modalStartTime'),
    modalEndTime: document.getElementById('modalEndTime'),
    slotDurationValue: document.getElementById('slotDurationValue'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // Initialize Application
  async function init() {
    setupEventListeners();
    setDefaultDateAndTimes();
    await loadAllData();
  }

  // Setup Event Listeners
  function setupEventListeners() {
    // Refresh Button
    DOM.btnRefresh.addEventListener('click', async () => {
      DOM.btnRefresh.classList.add('spinning');
      await loadAllData();
      showToast('Data Refreshed', 'Successfully updated resources and bookings.', 'success');
      DOM.btnRefresh.classList.remove('spinning');
    });

    // Tab Navigation
    DOM.tabResources.addEventListener('click', () => switchTab('resources'));
    DOM.tabBookings.addEventListener('click', () => switchTab('bookings'));

    // Category Filter Pills
    DOM.filterPills.forEach(pill => {
      pill.addEventListener('click', (e) => {
        DOM.filterPills.forEach(p => p.classList.remove('active'));
        e.currentTarget.classList.add('active');
        state.activeCategory = e.currentTarget.dataset.category;
        renderResourceGrid();
      });
    });

    // Resource Search
    DOM.resourceSearchInput.addEventListener('input', (e) => {
      state.resourceSearchQuery = e.target.value.toLowerCase().trim();
      renderResourceGrid();
    });

    // Bookings Filters
    DOM.bookingResourceFilter.addEventListener('change', (e) => {
      state.bookingResourceFilter = e.target.value;
      renderBookingsTable();
    });

    DOM.bookingDateFilter.addEventListener('change', (e) => {
      state.bookingDateFilter = e.target.value;
      renderBookingsTable();
    });

    DOM.btnResetDateFilter.addEventListener('click', () => {
      DOM.bookingDateFilter.value = '';
      state.bookingDateFilter = '';
      renderBookingsTable();
    });

    DOM.bookingSearchInput.addEventListener('input', (e) => {
      state.bookingSearchQuery = e.target.value.toLowerCase().trim();
      renderBookingsTable();
    });

    // Modal Open & Close
    DOM.btnOpenBookingModal.addEventListener('click', () => openBookingModal());
    DOM.btnCloseModal.addEventListener('click', () => closeBookingModal());
    DOM.btnCancelModal.addEventListener('click', () => closeBookingModal());

    // Modal Form Validation & Duration Updates
    [DOM.modalDate, DOM.modalStartTime, DOM.modalEndTime].forEach(input => {
      input.addEventListener('change', updateDurationIndicator);
    });

    // Modal Form Submit
    DOM.bookingForm.addEventListener('submit', handleBookingSubmit);
  }

  // Switch Active Tab
  function switchTab(tabName) {
    if (tabName === 'resources') {
      DOM.tabResources.classList.add('active');
      DOM.tabResources.setAttribute('aria-selected', 'true');
      DOM.tabBookings.classList.remove('active');
      DOM.tabBookings.setAttribute('aria-selected', 'false');

      DOM.resourcesSection.hidden = false;
      DOM.bookingsSection.hidden = true;
    } else {
      DOM.tabBookings.classList.add('active');
      DOM.tabBookings.setAttribute('aria-selected', 'true');
      DOM.tabResources.classList.remove('active');
      DOM.tabResources.setAttribute('aria-selected', 'false');

      DOM.bookingsSection.hidden = false;
      DOM.resourcesSection.hidden = true;
      renderBookingsTable();
    }
  }

  // Set Default Date & Times in Modal
  function setDefaultDateAndTimes() {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;

    DOM.modalDate.value = todayStr;
    DOM.modalDate.min = todayStr;

    // Next hour start, duration 2 hours
    const currentHour = today.getHours();
    const nextHour = (currentHour + 1) % 24;
    const endHour = (nextHour + 2) % 24;

    DOM.modalStartTime.value = `${String(nextHour).padStart(2, '0')}:00`;
    DOM.modalEndTime.value = `${String(endHour).padStart(2, '0')}:00`;
    updateDurationIndicator();
  }

  // Update Duration Indicator in Modal
  function updateDurationIndicator() {
    hideModalAlert();
    const startTime = DOM.modalStartTime.value;
    const endTime = DOM.modalEndTime.value;

    if (!startTime || !endTime) {
      DOM.slotDurationValue.textContent = '--';
      return;
    }

    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const diff = endMinutes - startMinutes;

    if (diff <= 0) {
      DOM.slotDurationValue.textContent = 'Invalid (End must be after Start)';
      DOM.slotDurationValue.style.color = '#ef4444';
    } else {
      const hours = Math.floor(diff / 60);
      const mins = diff % 60;
      let text = '';
      if (hours > 0) text += `${hours} hr${hours > 1 ? 's' : ''} `;
      if (mins > 0) text += `${mins} mins`;
      DOM.slotDurationValue.textContent = text.trim();
      DOM.slotDurationValue.style.color = 'var(--primary-700)';
    }
  }

  // Load All Data from Backend API
  async function loadAllData() {
    try {
      const [resResources, resBookings] = await Promise.all([
        fetch(API.RESOURCES),
        fetch(API.BOOKINGS)
      ]);

      if (!resResources.ok) throw new Error(`Failed to fetch resources: ${resResources.status}`);
      if (!resBookings.ok) throw new Error(`Failed to fetch bookings: ${resBookings.status}`);

      state.resources = await resResources.json();
      state.bookings = await resBookings.json();

      updateStats();
      populateResourceDropdowns();
      renderResourceGrid();
      renderBookingsTable();
    } catch (err) {
      console.error('Error loading portal data:', err);
      showToast('Connection Error', 'Could not connect to backend server. Make sure server is running.', 'error');
      DOM.resourceGrid.innerHTML = `
        <div class="loading-state">
          <p style="color: #ef4444; font-weight: 600;">⚠️ Unable to reach backend service</p>
          <p style="font-size: 0.85rem;">Check that server.py is running on port 8000.</p>
        </div>
      `;
    }
  }

  // Update Statistics Bar
  function updateStats() {
    const total = state.resources.length;
    const seminarHalls = state.resources.filter(r => r.type === 'seminar_hall').length;
    const labs = state.resources.filter(r => r.type === 'lab').length;
    const classrooms = state.resources.filter(r => r.type === 'classroom').length;

    DOM.statTotalResources.textContent = total;
    DOM.statSeminarHalls.textContent = seminarHalls;
    DOM.statLaboratories.textContent = labs;
    DOM.statClassrooms.textContent = classrooms;
    DOM.statTotalBookings.textContent = state.bookings.length;
  }

  // Populate Resource Dropdowns (Modal & Filter)
  function populateResourceDropdowns() {
    // Group resources by type
    const categories = {
      seminar_hall: { label: '🏛️ Seminar Halls', items: [] },
      lab: { label: '🔬 Laboratories', items: [] },
      classroom: { label: '📚 Classrooms', items: [] }
    };

    state.resources.forEach(res => {
      const cat = categories[res.type] || { label: 'Other', items: [] };
      cat.items.push(res);
    });

    // Populate Modal Dropdown
    DOM.modalResourceId.innerHTML = '<option value="" disabled selected>Select an institutional resource...</option>';
    Object.keys(categories).forEach(typeKey => {
      const cat = categories[typeKey];
      if (cat.items.length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = cat.label;
        cat.items.forEach(res => {
          const opt = document.createElement('option');
          opt.value = res.id;
          opt.textContent = `${res.name} (${res.location} • Cap: ${res.capacity})`;
          optgroup.appendChild(opt);
        });
        DOM.modalResourceId.appendChild(optgroup);
      }
    });

    // Populate Table Filter Dropdown
    const currentVal = DOM.bookingResourceFilter.value;
    DOM.bookingResourceFilter.innerHTML = '<option value="all">All Resources</option>';
    state.resources.forEach(res => {
      const opt = document.createElement('option');
      opt.value = res.id;
      opt.textContent = `${res.name} [${formatType(res.type)}]`;
      DOM.bookingResourceFilter.appendChild(opt);
    });
    if (currentVal) DOM.bookingResourceFilter.value = currentVal;
  }

  // Check Resource Availability for Now
  function isResourceCurrentlyBooked(resourceId) {
    const now = new Date();
    return state.bookings.some(b => {
      if (b.resource_id !== resourceId) return false;
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);
      return now >= start && now < end;
    });
  }

  // Render Resource Cards Grid
  function renderResourceGrid() {
    const query = state.resourceSearchQuery;
    const category = state.activeCategory;

    const filtered = state.resources.filter(res => {
      const matchesCategory = category === 'all' || res.type === category;
      const matchesSearch = !query ||
        res.name.toLowerCase().includes(query) ||
        res.location.toLowerCase().includes(query) ||
        res.id.toLowerCase().includes(query) ||
        (res.type && res.type.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });

    if (filtered.length === 0) {
      DOM.resourceGrid.innerHTML = `
        <div class="loading-state">
          <p>No resources found matching your filter criteria.</p>
        </div>
      `;
      return;
    }

    DOM.resourceGrid.innerHTML = filtered.map(res => {
      const isBooked = isResourceCurrentlyBooked(res.id);
      const statusClass = isBooked ? 'reserved' : 'available';
      const statusIcon = isBooked ? '🔴' : '🟢';
      const statusText = isBooked ? 'Currently In Use' : 'Available For Reservation';

      return `
        <article class="resource-card" data-id="${escapeHtml(res.id)}">
          <div class="card-top">
            <div>
              <h3 class="resource-name">${escapeHtml(res.name)}</h3>
              <span class="resource-id-tag">ID: ${escapeHtml(res.id)}</span>
            </div>
            <span class="badge-category badge-${escapeHtml(res.type)}">
              ${getTypeEmoji(res.type)} ${formatType(res.type)}
            </span>
          </div>

          <div class="card-details">
            <div class="detail-row">
              <span class="detail-icon">📍</span>
              <span class="detail-text"><strong>Location:</strong> ${escapeHtml(res.location)}</span>
            </div>
            <div class="detail-row">
              <span class="detail-icon">👥</span>
              <span class="detail-text"><strong>Capacity:</strong> ${escapeHtml(String(res.capacity))} attendees</span>
            </div>
            <div class="availability-pill ${statusClass}">
              <span>${statusIcon}</span>
              <span>${statusText}</span>
            </div>
          </div>

          <div class="card-actions">
            <button class="btn btn-secondary btn-view-schedule" data-id="${escapeHtml(res.id)}">
              📅 Schedule
            </button>
            <button class="btn btn-primary btn-book-this" data-id="${escapeHtml(res.id)}">
              Book Now
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach card action buttons
    DOM.resourceGrid.querySelectorAll('.btn-book-this').forEach(btn => {
      btn.addEventListener('click', () => {
        openBookingModal(btn.dataset.id);
      });
    });

    DOM.resourceGrid.querySelectorAll('.btn-view-schedule').forEach(btn => {
      btn.addEventListener('click', () => {
        DOM.bookingResourceFilter.value = btn.dataset.id;
        state.bookingResourceFilter = btn.dataset.id;
        switchTab('bookings');
      });
    });
  }

  // Render Bookings Table
  function renderBookingsTable() {
    const resourceFilter = state.bookingResourceFilter;
    const dateFilter = state.bookingDateFilter;
    const query = state.bookingSearchQuery;

    const filtered = state.bookings.filter(b => {
      const matchesResource = resourceFilter === 'all' || b.resource_id === resourceFilter;
      const matchesDate = !dateFilter || (b.start_time && b.start_time.startsWith(dateFilter));
      const matchesSearch = !query ||
        (b.event_title && b.event_title.toLowerCase().includes(query)) ||
        (b.user_name && b.user_name.toLowerCase().includes(query)) ||
        (b.user_id && b.user_id.toLowerCase().includes(query)) ||
        (b.resource_id && b.resource_id.toLowerCase().includes(query));

      return matchesResource && matchesDate && matchesSearch;
    });

    // Sort by start_time ascending
    filtered.sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

    if (filtered.length === 0) {
      DOM.bookingsTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="table-message">
            No reservations found matching the selected filter.
          </td>
        </tr>
      `;
      return;
    }

    DOM.bookingsTableBody.innerHTML = filtered.map(b => {
      const resource = state.resources.find(r => r.id === b.resource_id) || { name: b.resource_id, type: 'classroom' };
      const start = new Date(b.start_time);
      const end = new Date(b.end_time);

      const dateStr = start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
      const timeWindow = `${formatTime(start)} - ${formatTime(end)}`;
      const durationHours = ((end - start) / (1000 * 60 * 60)).toFixed(1);

      return `
        <tr>
          <td>
            <span class="badge-category" style="background-color: #ecfdf5; color: #065f46; border: 1px solid #6ee7b7;">
              ✓ Confirmed
            </span>
          </td>
          <td>
            <strong>${escapeHtml(resource.name)}</strong>
            <div>
              <span class="badge-category badge-${escapeHtml(resource.type)}" style="font-size: 0.7rem; padding: 0.15rem 0.4rem;">
                ${getTypeEmoji(resource.type)} ${formatType(resource.type)}
              </span>
            </div>
          </td>
          <td>
            <strong style="color: var(--primary-900);">${escapeHtml(b.event_title || 'Academic Event')}</strong>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Ref: #${escapeHtml(b.id || '')}</div>
          </td>
          <td>
            <div>${escapeHtml(b.user_name || 'Academic Staff')}</div>
            <span class="booking-user-badge">${escapeHtml(b.user_id || 'N/A')}</span>
          </td>
          <td>
            <div>📅 ${escapeHtml(dateStr)}</div>
            <div style="font-weight: 600; color: var(--primary-700);">⏰ ${escapeHtml(timeWindow)}</div>
          </td>
          <td>
            ${durationHours} hrs
          </td>
        </tr>
      `;
    }).join('');
  }

  // Open Booking Modal
  function openBookingModal(preselectedResourceId = null) {
    hideModalAlert();
    if (preselectedResourceId) {
      DOM.modalResourceId.value = preselectedResourceId;
    }
    updateDurationIndicator();
    DOM.bookingModal.showModal();
  }

  // Close Booking Modal
  function closeBookingModal() {
    DOM.bookingModal.close();
    hideModalAlert();
  }

  // Show Alert Box Inside Modal (for 409 Conflict or 400 Bad Request)
  function showModalAlert(title, message) {
    DOM.modalAlertTitle.textContent = title;
    DOM.modalAlertMessage.textContent = message;
    DOM.modalAlertBox.style.display = 'flex';
  }

  function hideModalAlert() {
    DOM.modalAlertBox.style.display = 'none';
  }

  // Handle Booking Form Submission
  async function handleBookingSubmit(e) {
    e.preventDefault();
    hideModalAlert();

    const resourceId = DOM.modalResourceId.value;
    const eventTitle = DOM.modalEventTitle.value.trim();
    const userName = DOM.modalUserName.value.trim();
    const userId = DOM.modalUserId.value.trim();
    const date = DOM.modalDate.value;
    const startTimeStr = DOM.modalStartTime.value;
    const endTimeStr = DOM.modalEndTime.value;

    if (!resourceId || !eventTitle || !userName || !userId || !date || !startTimeStr || !endTimeStr) {
      showModalAlert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    // Compose ISO Datetime Strings
    const startIso = `${date}T${startTimeStr}:00`;
    const endIso = `${date}T${endTimeStr}:00`;

    if (new Date(endIso) <= new Date(startIso)) {
      showModalAlert('Invalid Time Window', 'End time must be strictly after start time.');
      return;
    }

    const payload = {
      resource_id: resourceId,
      user_id: userId,
      user_name: userName,
      event_title: eventTitle,
      start_time: startIso,
      end_time: endIso
    };

    // Show Loading State
    setSubmitButtonLoading(true);

    try {
      const res = await fetch(API.BOOKINGS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 201) {
        // Success! (R2 & R3)
        const targetResource = state.resources.find(r => r.id === resourceId);
        const resourceName = targetResource ? targetResource.name : resourceId;

        closeBookingModal();
        DOM.bookingForm.reset();
        setDefaultDateAndTimes();

        showToast(
          'Reservation Confirmed!',
          `Booking #${data.id} successfully created for "${eventTitle}" at ${resourceName}.`,
          'success'
        );

        // Reload data to show updated calendar/cards
        await loadAllData();
      } else if (res.status === 409) {
        // Scheduling Conflict Rejection (R2 Acceptance Criterion)
        const errorMsg = data.message || data.error || 'This resource is already reserved for the requested time slot.';
        showModalAlert('Scheduling Conflict (409)', errorMsg);
      } else if (res.status === 400) {
        // Validation Error
        const errorMsg = data.message || data.error || 'Invalid booking parameters.';
        showModalAlert('Bad Request (400)', errorMsg);
      } else {
        showModalAlert(`Error (${res.status})`, data.message || 'An unexpected error occurred while processing your reservation.');
      }
    } catch (err) {
      console.error('Submission error:', err);
      showModalAlert('Network Error', 'Failed to communicate with the booking server. Please verify the server is running.');
    } finally {
      setSubmitButtonLoading(false);
    }
  }

  // Submit Button Loading Helper
  function setSubmitButtonLoading(isLoading) {
    const btnText = DOM.btnSubmitBooking.querySelector('.btn-text');
    const btnSpinner = DOM.btnSubmitBooking.querySelector('.btn-spinner');

    if (isLoading) {
      DOM.btnSubmitBooking.disabled = true;
      btnText.textContent = 'Verifying Slot...';
      btnSpinner.style.display = 'inline-block';
    } else {
      DOM.btnSubmitBooking.disabled = false;
      btnText.textContent = 'Confirm Reservation';
      btnSpinner.style.display = 'none';
    }
  }

  // Toast Notification System
  function showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? '✅' : '⚠️';
    toast.innerHTML = `
      <span style="font-size: 1.25rem;">${icon}</span>
      <div class="toast-content">
        <h4 class="toast-title">${escapeHtml(title)}</h4>
        <p class="toast-message">${escapeHtml(message)}</p>
      </div>
      <button class="btn-close" style="font-size: 1.2rem;" aria-label="Dismiss">&times;</button>
    `;

    toast.querySelector('.btn-close').addEventListener('click', () => {
      toast.remove();
    });

    DOM.toastContainer.appendChild(toast);

    // Auto dismiss after 5 seconds
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-in';
        setTimeout(() => toast.remove(), 300);
      }
    }, 5000);
  }

  // Helper Formatter Functions
  function formatType(type) {
    switch (type) {
      case 'seminar_hall': return 'Seminar Hall';
      case 'lab': return 'Laboratory';
      case 'classroom': return 'Classroom';
      default: return type || 'Resource';
    }
  }

  function getTypeEmoji(type) {
    switch (type) {
      case 'seminar_hall': return '🏛️';
      case 'lab': return '🔬';
      case 'classroom': return '📚';
      default: return '📍';
    }
  }

  function formatTime(dateObj) {
    return dateObj.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // Start app on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
