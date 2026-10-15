/**
 * ABESIT Event Portal - Admin Dashboard Script
 * Handles viewing all registrations, searching participants, deleting entries,
 * updating status, and generating downloadable CSV/print reports.
 */

let allRegistrations = [];
let eventsList = [];
let deleteTargetId = null;

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Authenticate Admin User
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
        showToast('Administrator privileges required. Please sign in.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html?role=admin';
        }, 800);
        return;
    }

    document.getElementById('adminNameDisplay').textContent = user.fullName;

    // 2. Load events list for filter dropdown and event creation
    await loadEventsDropdown();

    // 3. Load stats summary and all registrations
    await refreshDashboardData();

    // 4. Setup search and filter listeners
    const searchInput = document.getElementById('adminSearchInput');
    const typeFilter = document.getElementById('adminTypeFilter');
    const eventFilter = document.getElementById('adminEventFilter');
    const statusFilter = document.getElementById('adminStatusFilter');

    if (searchInput) searchInput.addEventListener('input', applyFilters);
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (eventFilter) eventFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);

    // 5. Setup New Event Form
    const newEventForm = document.getElementById('newEventForm');
    if (newEventForm) {
        newEventForm.addEventListener('submit', handleCreateEvent);
    }
});

// Fetch summary metrics and registrations list
async function refreshDashboardData() {
    await Promise.all([
        loadStatsSummary(),
        loadAllRegistrations()
    ]);
}

// 1. Load Stats Summary
async function loadStatsSummary() {
    try {
        const data = await apiGet('/api/registrations/stats/summary');
        const stats = data.stats || {};

        document.getElementById('statTotalReg').textContent = stats.totalRegistrations || 0;
        document.getElementById('statStudents').textContent = stats.studentCount || 0;
        document.getElementById('statFaculty').textContent = stats.facultyCount || 0;
        document.getElementById('statExternal').textContent = stats.externalCount || 0;
        document.getElementById('statEvents').textContent = stats.totalEvents || 0;

        // Render mini event distribution
        const distContainer = document.getElementById('eventDistributionList');
        if (distContainer && stats.eventBreakdown) {
            if (stats.eventBreakdown.length === 0) {
                distContainer.innerHTML = '<p style="color:var(--text-secondary);font-size:0.85rem;">No registrations recorded yet.</p>';
            } else {
                distContainer.innerHTML = stats.eventBreakdown.map(eb => `
                    <div style="margin-bottom:0.75rem;">
                        <div style="display:flex; justify-content:space-between; font-size:0.825rem; font-weight:600; margin-bottom:0.25rem;">
                            <span>${eb.title}</span>
                            <span style="color:var(--primary-color);">${eb.count} Participants</span>
                        </div>
                        <div style="height:6px; background:#e2e8f0; border-radius:3px; overflow:hidden;">
                            <div style="width:${Math.min(100, (eb.count / (stats.totalRegistrations || 1)) * 100)}%; height:100%; background:var(--primary-light);"></div>
                        </div>
                    </div>
                `).join('');
            }
        }
    } catch (err) {
        console.error('Stats error:', err);
    }
}

// 2. Load Events for Filter Select
async function loadEventsDropdown() {
    const eventFilter = document.getElementById('adminEventFilter');
    if (!eventFilter) return;

    try {
        const data = await apiGet('/api/events');
        eventsList = data.events || [];

        eventFilter.innerHTML = '<option value="All">All Events</option>' +
            eventsList.map(evt => `<option value="${evt._id}">${evt.title}</option>`).join('');
    } catch (err) {
        console.error('Failed to load events', err);
    }
}

// 3. Load All Registrations (Module 6: GET Participants)
async function loadAllRegistrations() {
    const tbody = document.getElementById('registrationsTableBody');
    if (!tbody) return;

    try {
        const data = await apiGet('/api/registrations/participants');
        allRegistrations = data.registrations || [];
        applyFilters();
    } catch (err) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger-color); padding:2rem;">Failed to load registrations: ${err.message}</td></tr>`;
    }
}

// Apply Live Search and Filters
function applyFilters() {
    const tbody = document.getElementById('registrationsTableBody');
    const search = (document.getElementById('adminSearchInput')?.value || '').toLowerCase().trim();
    const type = document.getElementById('adminTypeFilter')?.value || 'All';
    const eventId = document.getElementById('adminEventFilter')?.value || 'All';
    const status = document.getElementById('adminStatusFilter')?.value || 'All';

    const filtered = allRegistrations.filter(reg => {
        // Search condition
        const matchSearch = !search ||
            reg.fullName.toLowerCase().includes(search) ||
            reg.email.toLowerCase().includes(search) ||
            reg.registrationId.toLowerCase().includes(search) ||
            (reg.collegeName && reg.collegeName.toLowerCase().includes(search)) ||
            (reg.rollNoOrEmpId && reg.rollNoOrEmpId.toLowerCase().includes(search));

        // Type condition
        const matchType = type === 'All' || reg.participantType.toLowerCase() === type.toLowerCase();

        // Event condition
        const matchEvent = eventId === 'All' || (reg.event && (reg.event._id === eventId || reg.event === eventId));

        // Status condition
        const matchStatus = status === 'All' || reg.status.toLowerCase() === status.toLowerCase();

        return matchSearch && matchType && matchEvent && matchStatus;
    });

    document.getElementById('tableFilteredCount').textContent = `${filtered.length} entries shown`;

    if (filtered.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:3rem; color:var(--text-secondary);">
                    <i class="fa-solid fa-folder-open" style="font-size:2rem; margin-bottom:0.5rem; display:block;"></i>
                    No participant registrations matched your search or filter.
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filtered.map(reg => {
        const event = reg.event || {};
        const badgeRole = 'badge-' + reg.participantType;
        const badgeStatus = 'badge-' + reg.status.toLowerCase();
        const dateStr = new Date(reg.registrationDate).toLocaleDateString('en-IN');

        return `
            <tr>
                <td>
                    <span style="font-weight:700; color:var(--primary-color); font-size:0.85rem;">${reg.registrationId}</span>
                    <span class="participant-subtext">${dateStr}</span>
                </td>
                <td>
                    <div class="participant-name-cell">${reg.fullName}</div>
                    <span class="participant-subtext">${reg.email} • ${reg.phone}</span>
                </td>
                <td>
                    <span class="badge ${badgeRole}">${reg.participantType.toUpperCase()}</span>
                </td>
                <td>
                    <div style="font-size:0.85rem; font-weight:600;">${reg.collegeName}</div>
                    <span class="participant-subtext">${reg.department || 'General'} | ${reg.rollNoOrEmpId || 'ID: N/A'}</span>
                </td>
                <td>
                    <div style="font-size:0.85rem; font-weight:600; color:var(--primary-color);">${event.title || 'Technical Event'}</div>
                    <span class="badge badge-${(event.category || 'event').toLowerCase().replace(/\s+/g, '')}" style="font-size:0.7rem;">
                        ${event.category || 'Event'}
                    </span>
                </td>
                <td>
                    <span class="badge ${badgeStatus}">${reg.status}</span>
                </td>
                <td>
                    <div class="actions-cell">
                        <button type="button" class="btn btn-sm btn-outline" title="View Participant Details" onclick="viewParticipantModal('${reg._id}')">
                            <i class="fa-solid fa-eye"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-outline" title="Update Status" onclick="openStatusUpdateModal('${reg._id}', '${reg.status}')">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button type="button" class="btn btn-sm btn-danger" title="Delete Registration" onclick="promptDeleteRegistration('${reg._id}', '${reg.fullName}', '${reg.registrationId}')">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// 4. View Participant Full Modal
function viewParticipantModal(regId) {
    const reg = allRegistrations.find(r => r._id === regId);
    if (!reg) return;

    const event = reg.event || {};
    const modalBody = document.getElementById('participantModalBody');

    modalBody.innerHTML = `
        <div style="background:var(--bg-alt); padding:1rem; border-radius:var(--radius-sm); margin-bottom:1.25rem;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-size:1.15rem; font-weight:800; color:var(--primary-color);">${reg.registrationId}</span>
                <span class="badge badge-${reg.status.toLowerCase()}">${reg.status}</span>
            </div>
            <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.25rem;">
                Registered: ${new Date(reg.registrationDate).toLocaleString('en-IN')}
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.85rem; font-size:0.9rem; margin-bottom:1.25rem;">
            <div><strong>Participant Name:</strong> ${reg.fullName}</div>
            <div><strong>Category:</strong> ${reg.participantType.toUpperCase()}</div>
            <div><strong>Email:</strong> ${reg.email}</div>
            <div><strong>Phone:</strong> ${reg.phone}</div>
            <div><strong>College:</strong> ${reg.collegeName}</div>
            <div><strong>Department:</strong> ${reg.department || 'N/A'}</div>
            <div><strong>Roll / Emp ID:</strong> ${reg.rollNoOrEmpId || 'N/A'}</div>
            <div><strong>Year / Role:</strong> ${reg.yearOrDesignation || 'N/A'}</div>
            <div><strong>Event:</strong> ${event.title || 'N/A'}</div>
            <div><strong>Event Date:</strong> ${event.eventDate || 'N/A'}</div>
        </div>

        ${reg.teamName ? `
        <div style="background:#f1f5f9; padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:1rem; font-size:0.85rem;">
            <strong>Team Name:</strong> ${reg.teamName}<br>
            <strong>Team Members:</strong> ${reg.teamMembers || 'N/A'}
        </div>
        ` : ''}

        ${reg.notes ? `
        <div style="font-size:0.85rem; color:var(--text-secondary);">
            <strong>Notes / Synopsis:</strong> ${reg.notes}
        </div>
        ` : ''}
    `;

    openModal('viewParticipantModal');
}

// 5. Update Status Modal & API PUT call (Module 6: PUT Update)
let updateTargetRegId = null;

function openStatusUpdateModal(regId, currentStatus) {
    updateTargetRegId = regId;
    const select = document.getElementById('updateStatusSelect');
    if (select) select.value = currentStatus;
    openModal('updateStatusModal');
}

async function handleStatusUpdateSubmit() {
    if (!updateTargetRegId) return;

    const newStatus = document.getElementById('updateStatusSelect').value;
    const btn = document.getElementById('saveStatusBtn');
    btn.disabled = true;

    try {
        const result = await apiPut(`/api/registrations/${updateTargetRegId}`, {
            status: newStatus
        });

        showToast(result.message || 'Status updated successfully!', 'success');
        closeModal('updateStatusModal');
        await refreshDashboardData();
    } catch (err) {
        showToast(err.message || 'Failed to update status.', 'error');
    } finally {
        btn.disabled = false;
    }
}

// 6. Delete Registration Prompt & API DELETE call (Module 4 Admin & Module 6: DELETE Registration)
function promptDeleteRegistration(regId, name, code) {
    deleteTargetId = regId;
    document.getElementById('deleteTargetName').textContent = `${name} (${code})`;
    openModal('deleteConfirmModal');
}

async function confirmDeleteRegistration() {
    if (!deleteTargetId) return;

    const btn = document.getElementById('confirmDeleteBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Deleting...';

    try {
        const result = await apiDelete(`/api/registrations/${deleteTargetId}`);
        showToast(result.message || 'Registration deleted successfully.', 'success');
        closeModal('deleteConfirmModal');
        deleteTargetId = null;
        await refreshDashboardData();
    } catch (err) {
        showToast(err.message || 'Failed to delete registration.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-trash-can"></i> Yes, Delete Registration';
    }
}

// 7. Generate CSV Report Download (Module 4: Generate reports)
function exportRegistrationsCSV() {
    showToast('Generating official CSV report...', 'info');
    // Direct window trigger for downloading the CSV attachment generated by Express API
    window.location.href = '/api/registrations/export/csv';
}

// 8. Printable Summary Report
function printSummaryReport() {
    window.print();
}

// 9. Admin Create New Technical Event (POST /api/events)
async function handleCreateEvent(e) {
    e.preventDefault();

    const title = document.getElementById('newEventTitle').value.trim();
    const category = document.getElementById('newEventCategory').value;
    const eventDate = document.getElementById('newEventDate').value.trim();
    const eventTime = document.getElementById('newEventTime').value.trim();
    const venue = document.getElementById('newEventVenue').value.trim();
    const maxSeats = parseInt(document.getElementById('newEventSeats').value) || 100;
    const shortDesc = document.getElementById('newEventShortDesc').value.trim();
    const description = document.getElementById('newEventDesc').value.trim();

    if (!title || !eventDate || !eventTime || !shortDesc || !description) {
        showToast('Please fill all required event fields.', 'error');
        return;
    }

    const btn = document.getElementById('createEventBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Publishing Event...';

    try {
        const payload = {
            title,
            category,
            eventDate,
            eventTime,
            venue: venue || 'ABESIT Campus Auditorium, Ghaziabad',
            maxSeats,
            shortDescription: shortDesc,
            description
        };

        const result = await apiPost('/api/events', payload);
        showToast(result.message || 'Event published successfully!', 'success');
        closeModal('createEventModal');
        document.getElementById('newEventForm').reset();
        await loadEventsDropdown();
        await refreshDashboardData();
    } catch (err) {
        showToast(err.message || 'Failed to create event.', 'error');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Publish Event';
    }
}
