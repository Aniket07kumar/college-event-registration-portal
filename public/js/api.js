/**
 * ABESIT Event Portal - API & AJAX Utilities
 * Uses vanilla JavaScript fetch API for asynchronous HTTP requests
 */

// Global Toast Notification Helper
function showToast(message, type = 'info', duration = 4000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconClass = 'fa-info-circle';
    if (type === 'success') iconClass = 'fa-check-circle';
    if (type === 'error') iconClass = 'fa-exclamation-circle';
    if (type === 'warning') iconClass = 'fa-triangle-exclamation';

    toast.innerHTML = `
        <i class="fa-solid ${iconClass}" style="font-size: 1.25rem;"></i>
        <div class="toast-message">${message}</div>
        <button type="button" style="background:none;border:none;color:#94a3b8;cursor:pointer;" onclick="this.parentElement.remove()">
            <i class="fa-solid fa-xmark"></i>
        </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        toast.style.transition = 'all 0.3s ease-out';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// Reusable AJAX Helper (GET)
async function apiGet(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        return data;
    } catch (err) {
        console.error(`[GET ${endpoint}] error:`, err);
        throw err;
    }
}

// Reusable AJAX Helper (POST)
async function apiPost(endpoint, bodyData) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        return data;
    } catch (err) {
        console.error(`[POST ${endpoint}] error:`, err);
        throw err;
    }
}

// Reusable AJAX Helper (PUT)
async function apiPut(endpoint, bodyData) {
    try {
        const response = await fetch(endpoint, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify(bodyData)
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        return data;
    } catch (err) {
        console.error(`[PUT ${endpoint}] error:`, err);
        throw err;
    }
}

// Reusable AJAX Helper (DELETE)
async function apiDelete(endpoint) {
    try {
        const response = await fetch(endpoint, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json'
            },
            credentials: 'include'
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Request failed with status ${response.status}`);
        }
        return data;
    } catch (err) {
        console.error(`[DELETE ${endpoint}] error:`, err);
        throw err;
    }
}

// Current User State Helper
async function getCurrentUser() {
    try {
        const data = await apiGet('/api/auth/me');
        return data.user;
    } catch (err) {
        return null;
    }
}

// Logout Helper
async function logoutUser() {
    try {
        await apiPost('/api/auth/logout', {});
        showToast('You have been logged out successfully.', 'info');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 800);
    } catch (err) {
        window.location.href = '/login.html';
    }
}

// Modal Helpers
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('active');
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('active');
}
