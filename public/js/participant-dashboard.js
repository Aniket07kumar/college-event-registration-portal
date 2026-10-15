/**
 * ABESIT Event Portal - Participant Dashboard Script
 * Handles viewing registered events, generating confirmation slips, and updating profile
 */

let currentUser = null;
let participantRegistrations = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Authenticate user
    currentUser = await getCurrentUser();
    if (!currentUser) {
        showToast('Please log in to view your dashboard.', 'warning');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1000);
        return;
    }

    if (currentUser.role === 'admin') {
        window.location.href = 'admin-dashboard.html';
        return;
    }

    // 2. Render user profile info in header
    renderUserProfileHeader();

    // 3. Tab switching between "My Registrations" and "Update Profile"
    const tabs = document.querySelectorAll('.dash-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.target;
            document.querySelectorAll('.dash-tab-pane').forEach(p => p.style.display = 'none');
            const pane = document.getElementById(target);
            if (pane) pane.style.display = 'block';
        });
    });

    // 4. Fetch registrations for this participant
    await loadParticipantRegistrations();

    // 5. Populate Update Profile form with current values
    populateProfileForm();

    // 6. Handle profile update submit
    const profileForm = document.getElementById('updateProfileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileUpdate);
    }

    // 7. Check if URL has ?slip=REG_ID to auto open confirmation pass
    const urlParams = new URLSearchParams(window.location.search);
    const slipId = urlParams.get('slip');
    if (slipId) {
        setTimeout(() => openConfirmationSlip(slipId), 500);
    }
});

function renderUserProfileHeader() {
    document.getElementById('dashUserName').textContent = currentUser.fullName;
    document.getElementById('dashUserEmail').textContent = currentUser.email;
    document.getElementById('dashUserCollege').textContent = currentUser.collegeName || 'ABESIT Ghaziabad';

    const avatarInitial = currentUser.fullName ? currentUser.fullName.charAt(0).toUpperCase() : 'U';
    document.getElementById('dashAvatarCircle').textContent = avatarInitial;

    const roleBadge = document.getElementById('dashUserRoleBadge');
    roleBadge.className = `badge badge-${currentUser.role}`;
    roleBadge.textContent = currentUser.role.toUpperCase();
}

async function loadParticipantRegistrations() {
    const listContainer = document.getElementById('registrationsList');
    if (!listContainer) return;

    try {
        const data = await apiGet('/api/registrations');
        participantRegistrations = data.registrations || [];

        document.getElementById('dashRegisteredCount').textContent = participantRegistrations.length;

        if (participantRegistrations.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-calendar-xmark"></i>
                    <h3>No Event Registrations Found</h3>
                    <p>You have not registered for any events yet. Explore our technical events to participate!</p>
                    <a href="events.html" class="btn btn-primary">
                        <i class="fa-solid fa-calendar-plus"></i> Browse Events
                    </a>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = participantRegistrations.map(reg => {
            const event = reg.event || {};
            const badgeClass = 'badge-' + (event.category ? event.category.toLowerCase().replace(/\s+/g, '') : 'hackathon');
            const statusClass = 'badge-' + (reg.status ? reg.status.toLowerCase() : 'confirmed');
            const dateStr = new Date(reg.registrationDate).toLocaleDateString('en-IN', {
                year: 'numeric', month: 'short', day: 'numeric'
            });

            return `
                <div class="event-card" style="margin-bottom: 1.5rem;">
                    <div class="event-card-header">
                        <div style="display:flex; align-items:center; gap:0.6rem;">
                            <span class="badge ${badgeClass}">${event.category || 'Event'}</span>
                            <span class="badge ${statusClass}">
                                <i class="fa-solid fa-check"></i> ${reg.status}
                            </span>
                        </div>
                        <span style="font-size:0.85rem; font-weight:700; color:var(--primary-color);">
                            ID: ${reg.registrationId}
                        </span>
                    </div>
                    <div class="event-card-body">
                        <h3 class="event-card-title">${event.title || 'Technical Event'}</h3>
                        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1rem; font-size:0.875rem;">
                            <div>
                                <strong style="color:var(--text-secondary);"><i class="fa-solid fa-calendar-day"></i> Event Date:</strong>
                                <div>${event.eventDate || 'TBA'} (${event.eventTime || ''})</div>
                            </div>
                            <div>
                                <strong style="color:var(--text-secondary);"><i class="fa-solid fa-location-dot"></i> Venue:</strong>
                                <div>${event.venue || 'ABESIT Campus'}</div>
                            </div>
                            <div>
                                <strong style="color:var(--text-secondary);"><i class="fa-solid fa-clock-rotate-left"></i> Registered On:</strong>
                                <div>${dateStr}</div>
                            </div>
                            ${reg.teamName ? `
                            <div>
                                <strong style="color:var(--text-secondary);"><i class="fa-solid fa-people-group"></i> Team:</strong>
                                <div>${reg.teamName}</div>
                            </div>
                            ` : ''}
                        </div>
                    </div>
                    <div class="event-card-footer">
                        <div style="font-size:0.8rem; color:var(--text-secondary);">
                            Category: <strong>${reg.participantType.toUpperCase()}</strong>
                        </div>
                        <div style="display:flex; gap:0.5rem;">
                            <button type="button" class="btn btn-outline btn-sm" onclick="openRegistrationDetails('${reg._id}')">
                                <i class="fa-solid fa-circle-info"></i> Details
                            </button>
                            <button type="button" class="btn btn-primary btn-sm" onclick="openConfirmationSlip('${reg._id}')">
                                <i class="fa-solid fa-ticket"></i> Download Pass / Slip
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        listContainer.innerHTML = `<p style="color:var(--danger-color); text-align:center;">Failed to load registrations: ${err.message}</p>`;
    }
}

// Generate & display official ABESIT confirmation slip modal
function openConfirmationSlip(idOrRegCode) {
    const reg = participantRegistrations.find(r => r._id === idOrRegCode || r.registrationId === idOrRegCode);
    if (!reg) {
        showToast('Registration record not found.', 'error');
        return;
    }

    const event = reg.event || {};
    const slipContainer = document.getElementById('slipRenderArea');

    slipContainer.innerHTML = `
        <div class="confirmation-slip" id="printableConfirmationSlip">
            <div class="slip-watermark">ABESIT</div>

            <div class="slip-header">
                <div style="display:flex; justify-content:center; align-items:center; gap:0.6rem; margin-bottom:0.25rem;">
                    <div class="brand-icon" style="width:36px;height:36px;font-size:1rem;margin:0;">
                        <i class="fa-solid fa-atom"></i>
                    </div>
                    <div class="slip-college-name">ABES Institute of Technology, Ghaziabad</div>
                </div>
                <div class="slip-subheading">Campus: 19th Km Stone, NH-09, Ghaziabad (AKTU Code: 290)</div>
                <div class="slip-pass-title">Official Event Confirmation Pass</div>
            </div>

            <div class="slip-body">
                <div>
                    <div style="margin-bottom:1rem;">
                        <div class="slip-field-label">Event Name</div>
                        <div style="font-size:1.15rem; font-weight:800; color:var(--primary-color);">
                            ${event.title || 'Technical Event'}
                        </div>
                        <div style="font-size:0.85rem; color:var(--text-secondary); margin-top:0.2rem;">
                            Category: <strong>${event.category || 'Technical'}</strong> • Mode: <strong>${event.mode || 'Offline'}</strong>
                        </div>
                    </div>

                    <div class="slip-grid">
                        <div>
                            <div class="slip-field-label">Registration ID</div>
                            <div class="slip-field-value" style="color:#d97706; font-size:1rem;">${reg.registrationId}</div>
                        </div>
                        <div>
                            <div class="slip-field-label">Status</div>
                            <div class="slip-field-value" style="color:#16a34a;"><i class="fa-solid fa-circle-check"></i> ${reg.status}</div>
                        </div>
                        <div>
                            <div class="slip-field-label">Participant Name</div>
                            <div class="slip-field-value">${reg.fullName}</div>
                        </div>
                        <div>
                            <div class="slip-field-label">Category</div>
                            <div class="slip-field-value">${reg.participantType.toUpperCase()}</div>
                        </div>
                        <div>
                            <div class="slip-field-label">College / Institution</div>
                            <div class="slip-field-value">${reg.collegeName}</div>
                        </div>
                        <div>
                            <div class="slip-field-label">${reg.participantType === 'student' ? 'Roll Number' : 'ID / Emp Code'}</div>
                            <div class="slip-field-value">${reg.rollNoOrEmpId || 'N/A'}</div>
                        </div>
                        <div>
                            <div class="slip-field-label">Date & Time</div>
                            <div class="slip-field-value">${event.eventDate || 'TBA'}</div>
                        </div>
                        <div>
                            <div class="slip-field-label">Venue / Lab</div>
                            <div class="slip-field-value">${event.venue || 'ABESIT Campus'}</div>
                        </div>
                    </div>

                    ${reg.teamName ? `
                    <div style="margin-top:0.85rem; padding:0.5rem 0.75rem; background:var(--bg-alt); border-radius:var(--radius-sm); font-size:0.825rem;">
                        <strong>Team:</strong> ${reg.teamName} ${reg.teamMembers ? `(${reg.teamMembers})` : ''}
                    </div>
                    ` : ''}
                </div>

                <!-- QR Simulation & Security Code -->
                <div class="slip-qr-box">
                    <div class="slip-qr-code">
                        <i class="fa-solid fa-qrcode"></i>
                    </div>
                    <div style="font-size:0.75rem; font-weight:700; color:var(--text-secondary); letter-spacing:1px;">
                        SCAN AT VENUE
                    </div>
                    <div style="font-size:0.7rem; color:var(--text-light); margin-top:0.25rem;">
                        Auth: ABESIT-SEC-OK
                    </div>
                </div>
            </div>

            <div class="slip-footer">
                <div><strong>Important Instructions:</strong> Please carry your college Identity Card and this confirmation slip at the entry gate. Reporting time is 30 minutes before the scheduled start.</div>
                <div style="margin-top:0.35rem; color:var(--text-light);">Generated digitally via ABESIT Event Management Portal • Timestamp: ${new Date().toLocaleString()}</div>
            </div>
        </div>
    `;

    openModal('confirmationSlipModal');
}

// Print Confirmation Slip trigger
function printSlip() {
    window.print();
}

// Open modal for details inspection
function openRegistrationDetails(regId) {
    const reg = participantRegistrations.find(r => r._id === regId);
    if (!reg) return;

    const modalBody = document.getElementById('detailsModalBody');
    const event = reg.event || {};

    modalBody.innerHTML = `
        <div style="font-size:0.95rem;">
            <div style="margin-bottom:1rem; border-bottom:1px solid var(--border-color); padding-bottom:0.75rem;">
                <h4 style="color:var(--primary-color); font-size:1.2rem; margin-bottom:0.35rem;">${event.title}</h4>
                <p style="color:var(--text-secondary); font-size:0.875rem; margin:0;">${event.shortDescription || ''}</p>
            </div>

            <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.75rem; font-size:0.9rem; margin-bottom:1rem;">
                <div><strong>Registration Code:</strong> ${reg.registrationId}</div>
                <div><strong>Category:</strong> ${reg.participantType.toUpperCase()}</div>
                <div><strong>Email:</strong> ${reg.email}</div>
                <div><strong>Phone:</strong> ${reg.phone}</div>
                <div><strong>College:</strong> ${reg.collegeName}</div>
                <div><strong>Department:</strong> ${reg.department || 'N/A'}</div>
                <div><strong>Roll / ID:</strong> ${reg.rollNoOrEmpId || 'N/A'}</div>
                <div><strong>Status:</strong> <span class="badge badge-confirmed">${reg.status}</span></div>
            </div>

            ${reg.teamName ? `
            <div style="background:var(--bg-alt); padding:0.75rem; border-radius:var(--radius-sm); margin-bottom:1rem;">
                <strong>Team Name:</strong> ${reg.teamName}<br>
                <strong>Members:</strong> ${reg.teamMembers || 'N/A'}
            </div>
            ` : ''}

            <div style="background:#e0f2fe; padding:0.75rem; border-radius:var(--radius-sm); color:#0369a1; font-size:0.85rem;">
                <i class="fa-solid fa-circle-info"></i> For any queries or team modifications, contact the ABESIT Technical Events Committee at <strong>events@abesit.in</strong>.
            </div>
        </div>
    `;

    openModal('registrationDetailsModal');
}

// Populate Update Profile form with currentUser values
function populateProfileForm() {
    if (!currentUser) return;
    document.getElementById('profileFullName').value = currentUser.fullName || '';
    document.getElementById('profileEmail').value = currentUser.email || '';
    document.getElementById('profilePhone').value = currentUser.phone || '';
    document.getElementById('profileCollege').value = currentUser.collegeName || 'ABESIT Ghaziabad';
    document.getElementById('profileDepartment').value = currentUser.department || '';
    document.getElementById('profileRollNo').value = currentUser.rollNoOrEmpId || '';
    document.getElementById('profileYear').value = currentUser.yearOrDesignation || '';
}

// Handle Profile Update via AJAX PUT request (Module 4 & Module 6 PUT Update)
async function handleProfileUpdate(e) {
    e.preventDefault();

    const fullName = document.getElementById('profileFullName').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const collegeName = document.getElementById('profileCollege').value.trim();
    const department = document.getElementById('profileDepartment').value.trim();
    const rollNoOrEmpId = document.getElementById('profileRollNo').value.trim();
    const yearOrDesignation = document.getElementById('profileYear').value.trim();

    if (!fullName || !phone) {
        showToast('Please provide your name and phone number.', 'error');
        return;
    }

    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.disabled = true;
    saveBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Updating Profile...';

    try {
        const payload = {
            fullName,
            phone,
            collegeName,
            department,
            rollNoOrEmpId,
            yearOrDesignation
        };

        const result = await apiPut('/api/auth/profile', payload);

        currentUser = result.user;
        renderUserProfileHeader();
        showToast('Profile updated successfully!', 'success');

    } catch (err) {
        showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
        saveBtn.disabled = false;
        saveBtn.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> Save Profile Changes';
    }
}
