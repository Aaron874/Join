import { signUpElements, logInElements } from './index.js';
import { showErrorAfterSubmitIfNeeded, errorOrValidAfterSubmit, showError } from './signUpOrLogInErrors.js';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_EMAIL_LENGTH = 254;
const PASSWORD_REQUIREMENTS_MSG = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
let signUpForm = null;

let loginAttempted = false;

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

function updateSubmitButtonState() {
    const submitButton = document.getElementById('sign_up_button_id');
    submitButton.disabled = !isSignUpFormValid();
}

export function setupSignUpValidationListener() {
    signUpForm = document.getElementById('sign_log_in_id');
    signUpForm.addEventListener('input', updateSubmitButtonState);
    updateSubmitButtonState();
}

export function stopSignUpValidationListener() {
    if (signUpForm) {
        signUpForm.removeEventListener('input', updateSubmitButtonState);
        signUpForm = null;
    }
}

function isSignUpFormValid() {
    const nameMsg = validateName(signUpElements.username.input.value);
    const emailMsg = validateEmail(signUpElements.email.input.value);
    const passwordMsg = validatePassword(signUpElements.password.input.value);
    const confirmMsg = validateConfirmPassword(
        signUpElements.password.input.value,
        signUpElements.confirmPassword.input.value
    );
    const termsMsg = validateTerms(signUpElements.privacyCheckbox.input.checked);

    return !nameMsg && !emailMsg && !passwordMsg && !confirmMsg && !termsMsg;
}

export function attachSignUpValidation(elements) {
    enableValidationOnBlurOrInput(
        elements.username.input,
        elements.username.error,
        validateName,
        'Name must not be empty.'
    );
    enableValidationOnBlurOrInput(
        elements.email.input,
        elements.email.error,
        validateEmail,
        'Email must not be empty.'
    );
    enablePasswordValidationOnBlur(
        elements.password.input,
        elements.password.error,
        validatePassword
    );
    enableValidationOnBlurOrInput(
        elements.confirmPassword.input,
        elements.confirmPassword.error,
        (value) => validateConfirmPassword(elements.password.input.value, value),
        'Confirm Pwd must not be empty.'
    );
    startSignUpListener(elements);
}

function startSignUpListener(elements) {
    confirmPasswordListener(elements);
    passwordIconListener(elements.password.input, 'password');
    passwordIconListener(elements.confirmPassword.input, 'confirm_password');
    checkBoxListener(elements);
}

function passwordIconListener(input, whichPassword) {
    let icon = document.getElementById(whichPassword + '_lock_icon');
    input.addEventListener('input', () => {
        if (!input.value) {
            icon.src = 'assets/img/lock.webp';
            icon.classList.remove('clickable');
            return;
        }
        icon.classList.add('clickable');
        icon.src =
            input.type === 'password'
                ? 'assets/img/visibility_off.webp'
                : 'assets/img/visibility.webp';
    });
    passwordToggleListener(input, icon);
}

function passwordToggleListener(input, icon) {
    icon.addEventListener('click', () => {
        if (!input.value) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        icon.src = isPassword ? 'assets/img/visibility.webp' : 'assets/img/visibility_off.webp';
        input.focus();
    });
}

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

function checkBoxListener(elements) {
    elements.privacyCheckbox.input.addEventListener('change', () => {
        elements.privacyCheckbox.error.textContent = validateTerms(
            elements.privacyCheckbox.input.checked
        );
    });
}

function enableValidationOnBlurOrInput(input, errorEl, validateFn, emptyMessage) {
    input.addEventListener('blur', () => {
        if (input.disabled) return;
        if (!input.value) {
            showError(errorEl, emptyMessage);
        }
    });
    input.addEventListener('input', () => {
        showError(errorEl, validateFn(input.value));
    });
}

function enablePasswordValidationOnBlur(input, errorEl, validateFn) {
    input.addEventListener('blur', () => {
        if (input.disabled) return;
        showError(errorEl, validateFn(input.value));
    });
}

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

function validatePassword(value) {
    if (!value) {
        return 'Password must not be empty.';
    }
    return value.length >= MIN_PASSWORD_LENGTH ? '' : PASSWORD_REQUIREMENTS_MSG;
}

function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
        return 'Confirm Pwd must not be empty.';
    }
    if (password !== confirmPassword) {
        return 'Passwords do not match.';
    }
    return '';
}

function validateTerms(checked) {
    if (!checked) {
        return 'Please accept the privacy policy.';
    }
    return '';
}

export function attachLogInValidation(elements) {
    loginAttempted = false;
    enableLogInValidationOnFocus(
        elements.email.input,
        elements.email.error,
        validateEmail,
        'Field must not be empty.'
    );
    enableLogInValidationOnFocus(
        elements.password.input,
        elements.password.error,
        validateLogInPassword,
        'Password must not be empty.'
    );
    passwordIconListener(elements.password.input, 'log_in_password');
}

function enableLogInValidationOnFocus(input, errorEl, validateFn, emptyMessage) {
    input.addEventListener('blur', () => {
        if (!loginAttempted) return;
        if (input.disabled) return;
        if (!input.value) {
            showError(errorEl, emptyMessage);
        }
    });
    input.addEventListener('input', () => {
        if (!loginAttempted) return;
        showError(errorEl, validateFn(input.value));
    });
}

function validateLogInPassword(value) {
    if (!value) {
        return 'Password must not be empty.';
    }
    return '';
}

export function validationBeforLogIn() {
    loginAttempted = true;
    const emailMsg = validateEmail(logInElements.email.input.value);
    const passwordMsg = validateLogInPassword(logInElements.password.input.value);
    showError(logInElements.email.error, emailMsg);
    showError(logInElements.password.error, passwordMsg);
    const isValid = !emailMsg && !passwordMsg;
    return isValid;
}
