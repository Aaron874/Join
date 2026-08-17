import { signUpElements, logInElements, showErrorSignUp, registerNewUser } from './index.js';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_EMAIL_LENGTH = 254;

/**
 * Validates all sign-up form fields, displays any resulting errors,
 * and updates the form's overall valid/invalid state.
 * @returns {void}
 */
export function signUpValidation() {
    const nameMsg = validateName(signUpElements.username.input.value);
    const emailMsg = validateEmail(signUpElements.email.input.value);
    const passwordMsg = validatePassword(signUpElements.password.input.value);
    const confirmMsg = validateConfirmPassword(
        signUpElements.password.input.value,
        signUpElements.confirmPassword.input.value
    );
    const termsMsg = validateTerms(signUpElements.privacyCheckbox.input.checked);
    showErrorAfterSubmitIfNeeded(nameMsg, emailMsg, passwordMsg, confirmMsg, termsMsg);
    const isValid = !nameMsg && !emailMsg && !passwordMsg && !confirmMsg && !termsMsg;
    errorOrValidAfterSubmit(isValid);
}
/**
 * Displays the error messages for all sign-up form fields.
 * @param {string} nameMsg - Error message for the username field, or empty if valid.
 * @param {string} emailMsg - Error message for the email field, or empty if valid.
 * @param {string} passwordMsg - Error message for the password field, or empty if valid.
 * @param {string} confirmMsg - Error message for the confirm password field, or empty if valid.
 * @param {string} termsMsg - Error message for the privacy checkbox, or empty if valid.
 * @returns {void}
 */
function showErrorAfterSubmitIfNeeded(nameMsg, emailMsg, passwordMsg, confirmMsg, termsMsg) {
    showError(signUpElements.username.error, nameMsg);
    showError(signUpElements.email.error, emailMsg);
    showError(signUpElements.password.error, passwordMsg);
    showError(signUpElements.confirmPassword.error, confirmMsg);
    showError(signUpElements.privacyCheckbox.error, termsMsg);
}

/**
 * Proceeds with sign-up if the form is valid, otherwise shows an error.
 * @param {boolean} isValid - Whether all sign-up form fields are valid.
 * @returns {void}
 */
function errorOrValidAfterSubmit(isValid) {
    if (isValid) {
        handleNewUserSignUp();
    }
    if (!isValid) {
        showErrorSignUp('Check Inputs above');
    }
}

/**
 * Reads the sign-up form's input values, resets the form,
 * and registers a new user with the collected data.
 * @returns {void}
 */
function handleNewUserSignUp() {
    const form = document.getElementById('sign_log_in_id');
    const formData = new FormData(form);
    const values = Object.fromEntries(formData.entries());
    form.reset();
    registerNewUser(values);
}

/**
 * @typedef {Object} FieldElements
 * @property {HTMLInputElement} input - The input element.
 * @property {HTMLElement} error - The element showing the error message.
 */

/**
 * Retrieves the input and error elements for all sign-up form fields.
 * @returns {{ username: FieldElements, email: FieldElements, password: FieldElements, confirmPassword: FieldElements, privacyCheckbox: FieldElements }}
 */
export function getSignUpErrorElements() {
    return {
        username: {
            input: document.getElementById('sign_up_username_input'),
            error: document.getElementById('error_sign_up_username'),
        },
        email: {
            input: document.getElementById('sign_up_email_input'),
            error: document.getElementById('error_sign_up_email'),
        },
        password: {
            input: document.getElementById('sign_up_password_input'),
            error: document.getElementById('error_sign_up_password'),
        },
        confirmPassword: {
            input: document.getElementById('sign_up_confirm_password_input'),
            error: document.getElementById('error_sign_up_password_match'),
        },
        privacyCheckbox: {
            input: document.getElementById('sign_up_checkbox'),
            error: document.getElementById('error_sign_up_privacy_checkbox'),
        },
    };
}

/**
 * Attaches live validation to all sign-up form fields (username, email,
 * password, confirm password) and sets up the confirm-password and
 * privacy checkbox listeners.
 * @param {{ username: FieldElements, email: FieldElements, password: FieldElements, confirmPassword: FieldElements, privacyCheckbox: FieldElements }} elements
 * @returns {void}
 */
export function attachSignUpValidation(elements) {
    enableValidationOnFocus(
        elements.username.input,
        elements.username.error,
        validateName,
        'Name must not be empty.'
    );
    enableValidationOnFocus(
        elements.email.input,
        elements.email.error,
        validateEmail,
        'Email must not be empty.'
    );
    enableValidationOnFocus(
        elements.password.input,
        elements.password.error,
        validatePassword,
        'Password must not be empty.'
    );
    enableValidationOnFocus(
        elements.confirmPassword.input,
        elements.confirmPassword.error,
        (value) => validateConfirmPassword(elements.password.input.value, value),
        'Confirm Password must not be empty.'
    );
    confirmPasswordListener(elements);
    checkBoxListener(elements);
}

/**
 * Re-validates the confirm password field whenever the password field
 * changes, if the confirm password field already has a value.
 * @param {{ password: FieldElements, confirmPassword: FieldElements }} elements
 * @returns {void}
 */
function confirmPasswordListener(elements) {
    elements.password.input.addEventListener('input', () => {
        if (elements.confirmPassword.input.value) {
            showError(
                elements.confirmPassword.error,
                validateConfirmPassword(
                    elements.password.input.value,
                    elements.confirmPassword.input.value
                )
            );
        }
    });
}

/**
 * Validates the privacy checkbox whenever its checked state changes,
 * and displays the resulting error message.
 * @param {{ privacyCheckbox: FieldElements }} elements
 * @returns {void}
 */
function checkBoxListener(elements) {
    elements.privacyCheckbox.input.addEventListener('change', () => {
        elements.privacyCheckbox.error.textContent = validateTerms(
            elements.privacyCheckbox.input.checked
        );
    });
}

/**
 * Attaches focus and input listeners to a field for live validation.
 * Shows an "empty" message on focus if the field is empty, and runs
 * the validation function on every input change.
 * @param {HTMLInputElement} input - The input element to validate.
 * @param {HTMLElement} errorEl - The element that displays the error message.
 * @param {(value: string) => string} validateFn - Function that validates the input value and returns an error message or empty string.
 * @param {string} emptyMessage - Message shown when the field is focused while empty.
 * @returns {void}
 */
function enableValidationOnFocus(input, errorEl, validateFn, emptyMessage) {
    input.addEventListener('focus', () => {
        if (!input.value) {
            showError(errorEl, emptyMessage);
        }
    });
    input.addEventListener('input', () => {
        showError(errorEl, validateFn(input.value));
    });
}

/**
 * Displays or hides an error message for a given element.
 * @param {HTMLElement} errorEl - The element that displays the error message.
 * @param {string} errorMessage - The error message to show. An empty string hides it.
 * @returns {void}
 */
function showError(errorEl, errorMessage) {
    errorEl.classList.toggle('hidden_errors', !errorMessage);
    errorEl.textContent = errorMessage;
}

/**
 * Validates a name value.
 * @param {string} value - The name to validate.
 * @returns {string} An error message if invalid, or an empty string if valid.
 */
function validateName(value) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return 'Name must not be empty.';
    }
    if (trimmedValue.length < MIN_NAME_LENGTH) {
        return `Name must >${MIN_NAME_LENGTH} characters.`;
    }
    if (trimmedValue.length > MAX_NAME_LENGTH) {
        return `Name must <${MAX_NAME_LENGTH} characters.`;
    }
    if (!NAME_REGEX.test(trimmedValue)) {
        return 'No numbers or special characters.';
    }
    return '';
}

/**
 * Validates an email address.
 * @param {string} value - The email address to validate.
 * @returns {string} An error message if invalid, or an empty string if valid.
 */
function validateEmail(value) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return 'Email must not be empty.';
    }
    if (trimmedValue.length > MAX_EMAIL_LENGTH) {
        return `Email must <${MAX_EMAIL_LENGTH} characters.`;
    }
    if (!EMAIL_REGEX.test(trimmedValue)) {
        return 'Enter a valid email address.';
    }
    return '';
}

/**
 * Validates a password value.
 * @param {string} value - The password to validate.
 * @returns {string} An error message if invalid, or an empty string if valid.
 */
function validatePassword(value) {
    if (!value) {
        return 'Password must not be empty.';
    }
    if (value.length < MIN_PASSWORD_LENGTH) {
        return `Password must >${MIN_PASSWORD_LENGTH} characters.`;
    }
    if (!/[A-Z]/.test(value)) {
        return 'Needs a uppercase letter.';
    }
    if (!/[a-z]/.test(value)) {
        return 'Needs a lowercase letter';
    }
    if (!/[0-9]/.test(value)) {
        return 'Needs a number.';
    }
    return '';
}

/**
 * Validates that the confirm password matches the password.
 * @param {string} password - The original password value.
 * @param {string} confirmPassword - The confirm password value to compare.
 * @returns {string} An error message if invalid, or an empty string if valid.
 */
function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
        return 'Confirm Password must not be empty.';
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match.';
    }
    return '';
}

/**
 * Validates that the privacy policy checkbox is checked.
 * @param {boolean} checked - Whether the checkbox is currently checked.
 * @returns {string} An error message if unchecked, or an empty string if valid.
 */
function validateTerms(checked) {
    if (!checked) {
        return 'Please accept the privacy policy.';
    }
    return '';
}

/**
 * Retrieves the input and error elements for all log-in form fields.
 * @returns {{ email: FieldElements, password: FieldElements }}
 */
export function getLogInErrorElements() {
    return {
        email: {
            input: document.getElementById('login_email_id'),
            error: document.getElementById('error_log_in_email'),
        },
        password: {
            input: document.getElementById('login_password_id'),
            error: document.getElementById('error_log_in_password_or_both'),
        },
    };
}

/**
 * Attaches live validation to the log-in form fields (email and password).
 * @param {{ email: FieldElements, password: FieldElements }} elements
 * @returns {void}
 */
export function attachLogInValidation(elements) {
    enableValidationOnFocus(
        elements.email.input,
        elements.email.error,
        validateEmail,
        'Field must not be empty.'
    );
    enableValidationOnFocus(
        elements.password.input,
        elements.password.error,
        validateLogInPassword,
        'Password must not be empty.'
    );
}

/**
 * Validates that a login password value is not empty.
 * @param {string} value - The password to validate.
 * @returns {string} An error message if empty, or an empty string if valid.
 */
function validateLogInPassword(value) {
    if (!value) {
        return 'Password must not be empty.';
    }
    return '';
}

/**
 * Validates the login form (email and password fields) and displays
 * any resulting error messages.
 * @returns {boolean} True if both fields are valid, false otherwise.
 */
export function validationBeforLogIn() {
    const emailMsg = validateEmail(logInElements.email.input.value);
    const passwordMsg = validateLogInPassword(logInElements.password.input.value);
    showError(logInElements.email.error, emailMsg);
    showError(logInElements.password.error, passwordMsg);
    const isValid = !emailMsg && !passwordMsg;
    return isValid;
}
