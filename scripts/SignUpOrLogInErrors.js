import { handleNewUserSignUp, signUpElements, MAXIMUM_TIME_DIALOGS } from './index.js';

const errorDialog = document.getElementById('sign_up_error_id');
const MAXIMUM_ERROR_DISPLAY_TIME = 3000;

/**
 * Displays validation error messages for each field of the sign-up form after a submit
 * attempt, using the shared signUpElements error containers. Passing a falsy message for a
 * given field results in no error being shown for that field (delegated to showError).
 *
 * @param {string} nameMsg - The error message for the username field, or a falsy value if valid.
 * @param {string} emailMsg - The error message for the email field, or a falsy value if valid.
 * @param {string} passwordMsg - The error message for the password field, or a falsy value if valid.
 * @param {string} confirmMsg - The error message for the confirm password field, or a falsy value if valid.
 * @param {string} termsMsg - The error message for the privacy/terms checkbox, or a falsy value if valid.
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
 * Shows or hides a single validation error message on the given error element: sets the
 * message text and toggles its visibility class based on whether a message was provided.
 *
 * @param {HTMLElement} errorEl - The element used to display the error message.
 * @param {string} errorMessage - The error message to display, or a falsy value (e.g. empty string) to hide the error.
 * @returns {void}
 */
export function showError(errorEl, errorMessage) {
    errorEl.classList.toggle('hidden_errors', !errorMessage);
    errorEl.textContent = errorMessage;
}

/**
 * Handles the outcome of sign-up form validation on submit: proceeds with creating the new
 * user if the input is valid, or shows an error dialog prompting the user to check their
 * inputs otherwise.
 *
 * @param {boolean} isValid - Whether the sign-up form input passed validation.
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
 * Displays the sign-up error dialog with a message derived from the given error, then
 * automatically closes it and re-enables the form after MAXIMUM_ERROR_DISPLAY_TIME
 * milliseconds.
 *
 * @param {string|Error} error - The error (or error message) to display, translated into a user-facing message via signUpErrorMessage.
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
 * Displays a temporary error message indicating that guest login failed, then hides it again
 * and resets the message text back to the default login error message, and re-enables the
 * form, after MAXIMUM_ERROR_DISPLAY_TIME milliseconds.
 *
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
 * Displays a temporary error message indicating that the entered username or password was
 * incorrect, then hides it again and re-enables the form after MAXIMUM_TIME_DIALOGS
 * milliseconds.
 *
 * @returns {void}
 */
export function showErrorLogIn() {
    const errorLogIn = document.getElementById('error_log_in_password_or_both');
    errorLogIn.textContent = 'Username or Password incorrect';
    errorLogIn.classList.remove('hidden_errors');
    setTimeout(() => {
        errorLogIn.classList.add('hidden_errors');
        setFormDisabled(false);
    }, MAXIMUM_TIME_DIALOGS);
}

/**
 * Translates a Firebase auth error (or a plain string message) into a user-facing sign-up
 * error message, falling back to a generic message for unrecognized errors.
 *
 * @param {string|{code: string}} error - The error to translate. Can be a Firebase auth error object with a `code` property, or a plain string.
 * @returns {string} A user-facing error message describing what went wrong during sign-up.
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
 * Collects references to the sign-up form's input and error message elements for each field,
 * used as a central lookup for validation and error display.
 *
 * @returns {{
 *   username: {input: HTMLElement, error: HTMLElement},
 *   email: {input: HTMLElement, error: HTMLElement},
 *   password: {input: HTMLElement, error: HTMLElement},
 *   confirmPassword: {input: HTMLElement, error: HTMLElement},
 *   privacyCheckbox: {input: HTMLElement, error: HTMLElement}
 * }} An object mapping each sign-up field name to its input and error display elements.
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
 * Collects references to the login form's input and error message elements for each field,
 * used as a central lookup for validation and error display.
 *
 * @returns {{
 *   email: {input: HTMLElement, error: HTMLElement},
 *   password: {input: HTMLElement, error: HTMLElement}
 * }} An object mapping each login field name to its input and error display elements.
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
