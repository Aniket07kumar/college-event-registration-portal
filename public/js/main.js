/**
 * ABESIT Event Portal - Global Main Script
 * Handles navigation bar, authentication state in header, and responsive interactions
 */

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Mobile Menu Toggle
    const mobileToggle = document.getElementById('mobileNavToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('open');
            const icon = mobileToggle.querySelector('i');
            if (icon) {
                if (navMenu.classList.contains('open')) {
                    icon.classList.remove('fa-bars');
                    icon.classList.add('fa-xmark');
                } else {
                    icon.classList.remove('fa-xmark');
                    icon.classList.add('fa-bars');
                }
            }
        });
    }

    // 2. Highlight Active Page Link
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href) {
            const cleanHref = href.toLowerCase();
            if (currentPath.endsWith(cleanHref) || 
               (currentPath === '/' && cleanHref === 'index.html') ||
               (currentPath.endsWith('/') && cleanHref === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        }
    });

    // 3. Dynamic Header User State
    try {
        const user = await getCurrentUser();
        const navAuthButtons = document.getElementById('navAuthButtons');

        if (navAuthButtons && user) {
            const dashboardUrl = user.role === 'admin' ? '/admin-dashboard.html' : '/participant-dashboard.html';
            const roleBadge = user.role === 'admin' 
                ? '<span class="badge badge-admin">Admin</span>' 
                : `<span class="badge badge-${user.role}">${user.role.toUpperCase()}</span>`;

            navAuthButtons.innerHTML = `
                <div style="display:flex;align-items:center;gap:0.75rem;">
                    <a href="${dashboardUrl}" class="btn btn-outline btn-sm">
                        <i class="fa-solid fa-gauge-high"></i> Dashboard
                    </a>
                    <div style="display:flex;align-items:center;gap:0.4rem;">
                        <span style="font-weight:600;font-size:0.875rem;color:var(--primary-color);">${user.fullName.split(' ')[0]}</span>
                        ${roleBadge}
                    </div>
                    <button type="button" class="btn btn-outline btn-sm" onclick="logoutUser()" title="Logout">
                        <i class="fa-solid fa-arrow-right-from-bracket"></i>
                    </button>
                </div>
            `;
        }
    } catch (err) {
        // Not logged in, default login/register buttons remain
    }

    // 4. Modal Backdrop Close Listener
    document.querySelectorAll('.modal-overlay').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });

    // 5. Close Modals on Escape Key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.active').forEach(modal => {
                modal.classList.remove('active');
            });
        }
    });
});
