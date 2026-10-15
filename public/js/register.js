/**
 * ABESIT Event Portal - Registration Logic
 * Handles Student, Faculty, and External Participant registration
 * Implements client-side JavaScript validation and AJAX submission
 */

let currentRole = 'student';
let loadedEvents = [];

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Fetch available events for the select dropdown
    await loadEventDropdown();

    // 2. Tab switching for participant roles (Student, Faculty, External)
    const roleTabs = document.querySelectorAll('.reg-role-tab');
    roleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            roleTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentRole = tab.dataset.role;
            updateFormFieldsForRole(currentRole);
        });
    });

    // 3. Pre-select event if eventId is in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const eventIdParam = urlParams.get('eventId');
    if (eventIdParam) {
        const eventSelect = document.getElementById('regEventId');
        if (eventSelect) {
            eventSelect.value = eventIdParam;
            handleEventChange();
        }
    }

    // 4. Listen to event dropdown changes to toggle team fields
    const eventSelect = document.getElementById('regEventId');
    if (eventSelect) {
        eventSelect.addEventListener('change', handleEventChange);
    }

    // 5. Setup live validation listeners
    setupRealtimeValidation();

    // 6. Handle form submission
    const form = document.getElementById('registrationForm');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

// Load events from backend API into dropdown
async function loadEventDropdown() {
    const select = document.getElementById('regEventId');
    if (!select) return;

    try {
        const data = await apiGet('/api/events');
        loadedEvents = data.events || [];
        
        select.innerHTML = '<option value="">-- Select Technical Event --</option>' +
            loadedEvents.map(evt => `
                <option value="${evt._id}" data-category="${evt.category}">
                    ${evt.title} (${evt.category} - ${evt.eventDate})
                </option>
            `).join('');

        // Recheck if URL param needs selection
        const urlParams = new URLSearchParams(window.location.search);
        const eventIdParam = urlParams.get('eventId');
        if (eventIdParam) {
            select.value = eventIdParam;
            handleEventChange();
        }
    } catch (err) {
        console.error('Failed to load events for dropdown', err);
        select.innerHTML = '<option value="">Error loading events. Please refresh.</option>';
    }
}

// Switch UI form fields based on selected role
function updateFormFieldsForRole(role) {
    const studentGroup = document.getElementById('studentSpecificGroup');
    const facultyGroup = document.getElementById('facultySpecificGroup');
    const externalGroup = document.getElementById('externalSpecificGroup');
    const collegeInput = document.getElementById('regCollege');

    if (role === 'student') {
        studentGroup.style.display = 'block';
        facultyGroup.style.display = 'none';
        externalGroup.style.display = 'none';
        if (collegeInput && !collegeInput.value) {
            collegeInput.value = 'ABES Institute of Technology (ABESIT), Ghaziabad';
        }
    } else if (role === 'faculty') {
        studentGroup.style.display = 'none';
        facultyGroup.style.display = 'block';
        externalGroup.style.display = 'none';
        if (collegeInput && !collegeInput.value) {
            collegeInput.value = 'ABES Institute of Technology (ABESIT), Ghaziabad';
        }
    } else if (role === 'external') {
        studentGroup.style.display = 'none';
        facultyGroup.style.display = 'none';
        externalGroup.style.display = 'block';
        if (collegeInput && collegeInput.value === 'ABES Institute of Technology (ABESIT), Ghaziabad') {
            collegeInput.value = '';
        }
    }
}

// Toggle team inputs if Hackathon or Pitch competition is chosen
function handleEventChange() {
    const select = document.getElementById('regEventId');
    const selectedOption = select.options[select.selectedIndex];
    const category = selectedOption ? selectedOption.getAttribute('data-category') : '';
    const teamGroup = document.getElementById('teamDetailsGroup');

    if (teamGroup) {
        if (category === 'Hackathon' || category === 'Pitch Competition' || category === 'Startup Expo') {
            teamGroup.style.display = 'block';
        } else {
            teamGroup.style.display = 'none';
        }
    }
}

// Live validation on blur
function setupRealtimeValidation() {
    const nameInput = document.getElementById('regFullName');
    const emailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('regPhone');
    const eventInput = document.getElementById('regEventId');
    const passInput = document.getElementById('regPassword');

    if (nameInput) {
        nameInput.addEventListener('blur', () => {
            const valid = ValidationRules.required(nameInput.value) && ValidationRules.minLength(nameInput.value, 3);
            setFieldStatus(nameInput, valid, 'Please enter your full name (minimum 3 characters).');
        });
    }

    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const valid = ValidationRules.email(emailInput.value);
            setFieldStatus(emailInput, valid, 'Please enter a valid email address (e.g. user@domain.com).');
        });
    }

    if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
            const valid = ValidationRules.phone(phoneInput.value);
            setFieldStatus(phoneInput, valid, 'Please enter a valid 10-digit mobile number.');
        });
    }

    if (eventInput) {
        eventInput.addEventListener('change', () => {
            const valid = ValidationRules.required(eventInput.value);
            setFieldStatus(eventInput, valid, 'Please select an event to register.');
        });
    }

    if (passInput) {
        passInput.addEventListener('blur', () => {
            const valid = ValidationRules.minLength(passInput.value, 6);
            setFieldStatus(passInput, valid, 'Password must be at least 6 characters.');
        });
    }
}

// Full form client-side validation
function validateRegistrationForm() {
    let isValid = true;

    const eventSelect = document.getElementById('regEventId');
    const nameInput = document.getElementById('regFullName');
    const emailInput = document.getElementById('regEmail');
    const phoneInput = document.getElementById('regPhone');
    const collegeInput = document.getElementById('regCollege');
    const passInput = document.getElementById('regPassword');
    const termsCheck = document.getElementById('regTerms');

    // 1. Event Selection
    if (!ValidationRules.required(eventSelect.value)) {
        setFieldStatus(eventSelect, false, 'Please select an event.');
        isValid = false;
    } else {
        setFieldStatus(eventSelect, true);
    }

    // 2. Full Name
    if (!ValidationRules.required(nameInput.value) || !ValidationRules.minLength(nameInput.value, 3)) {
        setFieldStatus(nameInput, false, 'Please enter your full name (minimum 3 characters).');
        isValid = false;
    } else {
        setFieldStatus(nameInput, true);
    }

    // 3. Email
    if (!ValidationRules.email(emailInput.value)) {
        setFieldStatus(emailInput, false, 'Please enter a valid email address.');
        isValid = false;
    } else {
        setFieldStatus(emailInput, true);
    }

    // 4. Phone
    if (!ValidationRules.phone(phoneInput.value)) {
        setFieldStatus(phoneInput, false, 'Please enter a valid 10-digit mobile number.');
        isValid = false;
    } else {
        setFieldStatus(phoneInput, true);
    }

    // 5. College / Institution
    if (!ValidationRules.required(collegeInput.value)) {
        setFieldStatus(collegeInput, false, 'College / Institution name is required.');
        isValid = false;
    } else {
        setFieldStatus(collegeInput, true);
    }

    // 6. Role Specific Validations
    if (currentRole === 'student') {
        const rollInput = document.getElementById('regRollNo');
        const deptInput = document.getElementById('regDepartmentStudent');
        if (!ValidationRules.required(rollInput.value)) {
            setFieldStatus(rollInput, false, 'University Roll Number is required for student registration.');
            isValid = false;
        } else {
            setFieldStatus(rollInput, true);
        }
        if (!ValidationRules.required(deptInput.value)) {
            setFieldStatus(deptInput, false, 'Please select your department.');
            isValid = false;
        } else {
            setFieldStatus(deptInput, true);
        }
    } else if (currentRole === 'faculty') {
        const empIdInput = document.getElementById('regEmpId');
        const designationInput = document.getElementById('regDesignationFaculty');
        if (!ValidationRules.required(empIdInput.value)) {
            setFieldStatus(empIdInput, false, 'Employee ID is required for faculty registration.');
            isValid = false;
        } else {
            setFieldStatus(empIdInput, true);
        }
        if (!ValidationRules.required(designationInput.value)) {
            setFieldStatus(designationInput, false, 'Please enter your academic designation.');
            isValid = false;
        } else {
            setFieldStatus(designationInput, true);
        }
    } else if (currentRole === 'external') {
        const extRoleInput = document.getElementById('regExternalRole');
        if (!ValidationRules.required(extRoleInput.value)) {
            setFieldStatus(extRoleInput, false, 'Please specify your professional role/designation.');
            isValid = false;
        } else {
            setFieldStatus(extRoleInput, true);
        }
    }

    // 7. Password
    if (!ValidationRules.minLength(passInput.value, 6)) {
        setFieldStatus(passInput, false, 'Password must be at least 6 characters.');
        isValid = false;
    } else {
        setFieldStatus(passInput, true);
    }

    // 8. Terms Checkbox
    if (!termsCheck.checked) {
        showToast('Please agree to the Event Code of Conduct and Rules.', 'warning');
        isValid = false;
    }

    return isValid;
}

// Form Submission via AJAX (fetch)
async function handleFormSubmit(e) {
    e.preventDefault();

    // Client-side validation check
    if (!validateRegistrationForm()) {
        showToast('Please fix the errors highlighted in the form.', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitRegBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing Registration...';

    try {
        // Collect form data
        const eventId = document.getElementById('regEventId').value;
        const fullName = document.getElementById('regFullName').value.trim();
        const email = document.getElementById('regEmail').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const collegeName = document.getElementById('regCollege').value.trim();
        const password = document.getElementById('regPassword').value;

        let department = '';
        let rollNoOrEmpId = '';
        let yearOrDesignation = '';

        if (currentRole === 'student') {
            department = document.getElementById('regDepartmentStudent').value;
            rollNoOrEmpId = document.getElementById('regRollNo').value.trim();
            yearOrDesignation = document.getElementById('regYearStudent').value;
        } else if (currentRole === 'faculty') {
            department = document.getElementById('regDepartmentFaculty').value.trim();
            rollNoOrEmpId = document.getElementById('regEmpId').value.trim();
            yearOrDesignation = document.getElementById('regDesignationFaculty').value.trim();
        } else if (currentRole === 'external') {
            department = document.getElementById('regExternalOrg').value.trim();
            rollNoOrEmpId = document.getElementById('regExternalId').value.trim();
            yearOrDesignation = document.getElementById('regExternalRole').value.trim();
        }

        const teamName = document.getElementById('regTeamName') ? document.getElementById('regTeamName').value.trim() : '';
        const teamMembers = document.getElementById('regTeamMembers') ? document.getElementById('regTeamMembers').value.trim() : '';

        // Step 1: Ensure user account exists or register user
        try {
            await apiPost('/api/auth/register', {
                fullName,
                email,
                password,
                role: currentRole,
                phone,
                collegeName,
                department,
                rollNoOrEmpId,
                yearOrDesignation
            });
        } catch (authErr) {
            // If user already exists, that's fine - proceed to register for event
            console.log('User account notice:', authErr.message);
        }

        // Step 2: Post Registration to /api/registrations (Module 6: POST Registration)
        const regPayload = {
            eventId,
            participantType: currentRole,
            fullName,
            email,
            phone,
            collegeName,
            department,
            rollNoOrEmpId,
            yearOrDesignation,
            teamName,
            teamMembers
        };

        const result = await apiPost('/api/registrations', regPayload);

        // Success handling
        showToast('Registration Confirmed Successfully!', 'success');

        // Show Success Modal
        showRegistrationSuccessModal(result.registration);

        // Reset form
        document.getElementById('registrationForm').reset();
        document.querySelectorAll('.is-valid').forEach(el => el.classList.remove('is-valid'));

    } catch (err) {
        console.error('Registration failed:', err);
        // Display clear error for duplicate entries (Problem Statement requirement)
        showToast(err.message || 'Registration failed. Please try again.', 'error', 6000);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Submit Registration';
    }
}

// Display Confirmation Modal with generated Registration ID
function showRegistrationSuccessModal(registration) {
    const modal = document.getElementById('successModal');
    if (!modal) return;

    document.getElementById('successRegId').textContent = registration.registrationId;
    document.getElementById('successEventName').textContent = registration.event ? registration.event.title : 'Technical Event';
    document.getElementById('successParticipantName').textContent = registration.fullName;
    document.getElementById('successEmail').textContent = registration.email;

    // Set link to view and print ticket
    const viewSlipBtn = document.getElementById('modalViewSlipBtn');
    if (viewSlipBtn) {
        viewSlipBtn.href = `participant-dashboard.html?slip=${registration.registrationId}`;
    }

    openModal('successModal');
}
