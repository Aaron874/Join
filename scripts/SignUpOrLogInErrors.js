import { handleNewUserSignUp, signUpElements, MAXIMUM_TIME_DIALOGS } from './index.js';

const errorDialog = document.getElementById('sign_up_error_id');
const MAXIMUM_ERROR_DISPLAY_TIME = 3000;

export function showErrorAfterSubmitIfNeeded(nameMsg, emailMsg, passwordMsg, confirmMsg, termsMsg) {
    showError(signUpElements.username.error, nameMsg);
    showError(signUpElements.email.error, emailMsg);
    showError(signUpElements.password.error, passwordMsg);
    showError(signUpElements.confirmPassword.error, confirmMsg);
    showError(signUpElements.privacyCheckbox.error, termsMsg);
}

export function showError(errorEl, errorMessage) {
    errorEl.classList.toggle('hidden_errors', !errorMessage);
    errorEl.textContent = errorMessage;
}

export function errorOrValidAfterSubmit(isValid) {
    if (isValid) {
        handleNewUserSignUp();
    }
    if (!isValid) {
        errorDialogOpenClose('Please Check Inputs');
    }
}

export function errorDialogOpenClose(error) {
    const errorHeader = errorDialog.querySelector('h1');
    errorHeader.textContent = signUpErrorMessage(error);
    errorDialog.showModal();
    setTimeout(() => {
        errorDialog.close();
        setFormDisabled(false);
    }, MAXIMUM_ERROR_DISPLAY_TIME);
}

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

export function showErrorLogIn() {
    const errorLogIn = document.getElementById('error_log_in_password_or_both');
    errorLogIn.textContent = 'Username or Password incorrect';
    errorLogIn.classList.remove('hidden_errors');
    setTimeout(() => {
        errorLogIn.classList.add('hidden_errors');
        setFormDisabled(false);
    }, MAXIMUM_TIME_DIALOGS);
}

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
