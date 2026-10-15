/**
 * ABESIT Event Portal - Login Logic
 * Handles Participant Login and Admin Login with AJAX authentication
 */

let activeRole = 'participant';

document.addEventListener('DOMContentLoaded', () => {
    // 1. Check if user is already logged in
    checkAlreadyLoggedIn();

    // 2. Tab switching between Participant Login and Admin Login
    const tabs = document.querySelectorAll('.login-tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            activeRole = tab.dataset.role;
            switchLoginRole(activeRole);
        });
    });

    // 3. Check query param ?role=admin
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('role') === 'admin') {
        const adminTab = document.querySelector('.login-tab-btn[data-role="admin"]');
        if (adminTab) adminTab.click();
    }

    // 4. Form submission handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLoginSubmit);
    }
});

async function checkAlreadyLoggedIn() {
    try {
        const user = await getCurrentUser();
        if (user) {
            // Already logged in
            if (user.role === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'participant-dashboard.html';
            }
        }
    } catch (e) {}
}

function switchLoginRole(role) {
    const roleBadge = document.getElementById('loginRoleBadge');
    const roleHelp = document.getElementById('loginRoleHelp');

    if (role === 'admin') {
        if (roleBadge) roleBadge.innerHTML = '<span class="badge badge-admin"><i class="fa-solid fa-lock"></i> Administrator Login</span>';
        if (roleHelp) roleHelp.textContent = 'For Event Conveners, HODs, and Authorized Faculty Coordinators';
    } else {
        if (roleBadge) roleBadge.innerHTML = '<span class="badge badge-student"><i class="fa-solid fa-user"></i> Participant Login</span>';
        if (roleHelp) roleHelp.textContent = 'For Registered Students, Faculty, and External Participants';
    }
}

// Quick demo credential autofill
function fillDemoCredentials(email, password, role) {
    document.getElementById('loginEmail').value = email;
    document.getElementById('loginPassword').value = password;

    const targetTab = document.querySelector(`.login-tab-btn[data-role="${role}"]`);
    if (targetTab) targetTab.click();

    clearFieldStatus(document.getElementById('loginEmail'));
    clearFieldStatus(document.getElementById('loginPassword'));
    showToast(`Loaded ${role} credentials! Click 'Sign In' to proceed.`, 'info');
}

// Handle login submission via AJAX
async function handleLoginSubmit(e) {
    e.preventDefault();

    const emailInput = document.getElementById('loginEmail');
    const passwordInput = document.getElementById('loginPassword');
    const submitBtn = document.getElementById('loginSubmitBtn');

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let isValid = true;

    // Validate email
    if (!ValidationRules.email(email)) {
        setFieldStatus(emailInput, false, 'Please enter a valid email address.');
        isValid = false;
    } else {
        setFieldStatus(emailInput, true);
    }

    // Validate password
    if (!ValidationRules.minLength(password, 6)) {
        setFieldStatus(passwordInput, false, 'Password must be at least 6 characters.');
        isValid = false;
    } else {
        setFieldStatus(passwordInput, true);
    }

    if (!isValid) return;

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Authenticating...';

    try {
        const payload = {
            email,
            password,
            roleRequired: activeRole === 'admin' ? 'admin' : undefined
        };

        const result = await apiPost('/api/auth/login', payload);

        showToast(result.message || 'Login successful!', 'success');

        // Redirect after short delay
        setTimeout(() => {
            window.location.href = result.redirectUrl || (activeRole === 'admin' ? 'admin-dashboard.html' : 'participant-dashboard.html');
        }, 600);

    } catch (err) {
        console.error('Login error:', err);
        showToast(err.message || 'Invalid email or password.', 'error');
        setFieldStatus(passwordInput, false, err.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-arrow-right-to-bracket"></i> Sign In to Portal';
    }
}
