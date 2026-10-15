/**
 * ABESIT Event Portal - Client-Side JavaScript Form Validation
 * Provides robust validation rules and visual status indicators
 */

const ValidationRules = {
    // Check if value is not empty
    required: (value) => {
        return value !== null && value !== undefined && value.toString().trim().length > 0;
    },

    // Check valid email format
    email: (value) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(String(value).trim());
    },

    // Check valid 10-digit Indian phone number
    phone: (value) => {
        const clean = String(value).replace(/[\s\-\+\(\)]/g, '');
        // Allow optional +91 or 91 prefix, followed by 10 digits starting with 6, 7, 8, or 9
        const phoneRegex = /^(?:(?:\+|0{0,2})91)?[6-9]\d{9}$/;
        return phoneRegex.test(clean);
    },

    // Minimum character length
    minLength: (value, min) => {
        return String(value).trim().length >= min;
    },

    // Check if passwords match
    matches: (value, matchValue) => {
        return value === matchValue;
    }
};

/**
 * Sets validation error or success status on an input field element
 * @param {HTMLElement} inputEl The input element
 * @param {boolean} isValid Whether validation passed
 * @param {string} errorMsg Error message to display if invalid
 */
function setFieldStatus(inputEl, isValid, errorMsg = '') {
    if (!inputEl) return;

    let parent = inputEl.closest('.form-group') || inputEl.parentElement;
    let feedback = parent.querySelector('.invalid-feedback');

    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';
        parent.appendChild(feedback);
    }

    if (isValid) {
        inputEl.classList.remove('is-invalid');
        inputEl.classList.add('is-valid');
        feedback.style.display = 'none';
        feedback.textContent = '';
    } else {
        inputEl.classList.remove('is-valid');
        inputEl.classList.add('is-invalid');
        feedback.style.display = 'block';
        feedback.textContent = errorMsg;
    }
}

/**
 * Clears validation classes and messages from an input field
 */
function clearFieldStatus(inputEl) {
    if (!inputEl) return;
    inputEl.classList.remove('is-valid', 'is-invalid');
    let parent = inputEl.closest('.form-group') || inputEl.parentElement;
    let feedback = parent.querySelector('.invalid-feedback');
    if (feedback) {
        feedback.style.display = 'none';
        feedback.textContent = '';
    }
}
