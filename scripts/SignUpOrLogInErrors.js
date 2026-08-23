import { handleNewUserSignUp } from './index.js';

const errorDialog = document.getElementById('sign_up_error_id');
const MAXIMUM_ERROR_DISPLAY_TIME = 3000;

/**
 * Displays the error messages for all sign-up form fields.
 * @param {string} nameMsg - Error message for the username field, or empty if valid.
 * @param {string} emailMsg - Error message for the email field, or empty if valid.
 * @param {string} passwordMsg - Error message for the password field, or empty if valid.
 * @param {string} confirmMsg - Error message for the confirm password field, or empty if valid.
 * @param {string} termsMsg - Error message for the privacy checkbox, or empty if valid.
 * @returns {void}
 */
export function showErrorAfterSubmitIfNeeded(nameMsg, emailMsg, passwordMsg, confirmMsg, termsMsg) {
    showError(signUpElements.username.error, nameMsg);
    showError(signUpElements.email.error, emailMsg);
    showError(signUpElements.password.error, passwordMsg);
    showError(signUpElements.confirmPassword.error, confirmMsg);
    showError(signUpElements.privacyCheckbox.error, termsMsg);
}

/**
 * Displays or hides an error message for a given element.
 * @param {HTMLElement} errorEl - The element that displays the error message.
 * @param {string} errorMessage - The error message to show. An empty string hides it.
 * @returns {void}
 */
export function showError(errorEl, errorMessage) {
    errorEl.classList.toggle('hidden_errors', !errorMessage);
    errorEl.textContent = errorMessage;
}

/**
 * Proceeds with sign-up if the form is valid, otherwise shows an error.
 * @param {boolean} isValid - Whether all sign-up form fields are valid.
 * @returns {void}
 */
export function errorOrValidAfterSubmit(isValid) {
    if (isValid) {
        handleNewUserSignUp();
    }
    if (!isValid) {
        errorDialogOpenClose('Please Check Inputs');
    }
}

/**
 * Displays the error dialog with a matching error message and automatically closes it after MAXIMUM_ERROR_DISPLAY_TIME.
 *
 * @param {*} error - The error that occurred (e.g. a Firebase Auth error), passed to signUpErrorMessage.
 * @returns {void}
 */
export function errorDialogOpenClose(error) {
    const errorHeader = errorDialog.querySelector('h1');
    errorHeader.textContent = signUpErrorMessage(error);
    errorDialog.showModal();
    setTimeout(() => {
        errorDialog.close();
        setFormDisabled(false);
    }, MAXIMUM_ERROR_DISPLAY_TIME);
}

/**
 * Displays a "guest login failed" error message on the login form,
 * then hides it and re-enables the form after a fixed delay.
 * @returns {void}
 */
export function showErrorGuestLogin() {
    const errorLogIn = document.getElementById('error_log_in_password_or_both');
    errorLogIn.textContent = 'Guest login failed. Please try again.';
    errorLogIn.classList.remove('hidden_errors');
    setTimeout(() => {
        errorLogIn.classList.add('hidden_errors');
        setFormDisabled(false);
        errorLogIn.textContent = 'Username or Password incorrect';
    }, MAXIMUM_ERROR_DISPLAY_TIME);
}

/**
 * Displays a generic "username or password incorrect" error on the login form,
 * then hides it and re-enables the form after a fixed delay.
 * @returns {void}
 */
export function showErrorLogIn() {
    const errorLogIn = document.getElementById('error_log_in_password_or_both');
    errorLogIn.textContent = 'Username or Password incorrect';
    errorLogIn.classList.remove('hidden_errors');
    setTimeout(() => {
        errorLogIn.classList.add('hidden_errors');
        setFormDisabled(false);
    }, 800);
}

/**
 * Maps a sign-up error to a user-friendly message.
 * @param {{ code?: string } | string} error - The error object (with a Firebase error code) or a plain error string.
 * @returns {string} A user-friendly error message corresponding to the error.
 */
function signUpErrorMessage(error) {
    switch (error?.code || error) {
        case 'auth/email-already-in-use':
            return 'This email address is already registered.';
        case 'auth/invalid-email':
            return 'Please enter a valid, complete email address.';
        case 'auth/weak-password':
            return 'Password is too weak. Please choose a stronger one.';
        case 'Please Check Inputs':
            return 'Please Check Inputs';
        default:
            return 'Sign up failed. Please try again.';
    }
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
