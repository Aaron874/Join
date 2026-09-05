import { signUpElements, logInElements } from './index.js';
import {
    showErrorAfterSubmitIfNeeded,
    errorOrValidAfterSubmit,
    showError,
} from './SignUpOrLogInErrors.js';

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const MIN_PASSWORD_LENGTH = 8;
const MAX_EMAIL_LENGTH = 254;
const PASSWORD_REQUIREMENTS_MSG = `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
let signUpForm = null;

let loginAttempted = false;

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
 * Enables or disables the sign-up submit button based on whether the form is currently valid.
 *
 * @returns {void}
 */
function updateSubmitButtonState() {
    const submitButton = document.getElementById('sign_up_button_id');
    submitButton.disabled = !isSignUpFormValid();
}

/**
 * Binds the input listener to the sign-up form that keeps the submit button's disabled state in sync with form validity.
 *
 * @returns {void}
 */
export function setupSignUpValidationListener() {
    signUpForm = document.getElementById('sign_log_in_id');
    signUpForm.addEventListener('input', updateSubmitButtonState);
    updateSubmitButtonState();
}

/**
 * Removes the input listener from the sign-up form and clears the stored reference.
 *
 * @returns {void}
 */
export function stopSignUpValidationListener() {
    if (signUpForm) {
        signUpForm.removeEventListener('input', updateSubmitButtonState);
        signUpForm = null;
    }
}

/**
 * Checks whether all sign-up form fields currently pass validation, without displaying any error messages.
 *
 * @returns {boolean} True if name, email, password, confirm password, and terms are all valid.
 */
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

/**
 * Attaches live validation to all sign-up form fields (username, email,
 * password, confirm password) and sets up the confirm-password and
 * privacy checkbox listeners.
 * @param {{ username: FieldElements, email: FieldElements, password: FieldElements, confirmPassword: FieldElements, privacyCheckbox: FieldElements }} elements
 * @returns {void}
 */
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

/**
 * Sets up all sign-up form listeners: confirm password sync,
 * password visibility icons, and privacy checkbox validation.
 * @param {Object} elements - The sign-up form elements.
 * @returns {void}
 */
function startSignUpListener(elements) {
    confirmPasswordListener(elements);
    passwordIconListener(elements.password.input, 'password');
    passwordIconListener(elements.confirmPassword.input, 'confirm_password');
    checkBoxListener(elements);
}

/**
 * Toggles the password field's lock/visibility icon based on its content
 * and current type, and attaches the click-to-toggle behavior.
 * @param {HTMLInputElement} input - The password input element.
 * @param {string} whichPassword - Prefix used to locate the icon element (e.g. "password", "confirm_password").
 * @returns {void}
 */
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

/**
 * Toggles a password input's visibility between masked and plain text
 * when its icon is clicked, updating the icon accordingly and
 * restoring focus to the input.
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLElement} icon - The icon element that toggles visibility on click.
 * @returns {void}
 */
function passwordToggleListener(input, icon) {
    icon.addEventListener('click', () => {
        if (!input.value) return;
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        icon.src = isPassword ? 'assets/img/visibility.webp' : 'assets/img/visibility_off.webp';
        input.focus();
    });
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
 * Attaches blur and input listeners to a field for live validation.
 * Shows an "empty" message only once the user leaves the field without
 * having filled it in (blur), so no warning appears the moment the user
 * merely enters an untouched field. While typing, the validation
 * function runs on every input change.
 * @param {HTMLInputElement} input - The input element to validate.
 * @param {HTMLElement} errorEl - The element that displays the error message.
 * @param {(value: string) => string} validateFn - Function that validates the input value and returns an error message or empty string.
 * @param {string} emptyMessage - Message shown when the field is left empty.
 * @returns {void}
 */
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

/**
 * Validates the sign-up password field only once the user leaves it
 * (blur), never while typing — the password has several rules (length,
 * upper/lower case, a number), and validating on every keystroke made
 * the message switch from one rule to the next as the user typed.
 * `validatePassword` returns a single combined requirements message
 * instead of one message per rule.
 * @param {HTMLInputElement} input - The password input element.
 * @param {HTMLElement} errorEl - The element that displays the error message.
 * @param {(value: string) => string} validateFn - Function that validates the input value and returns an error message or empty string.
 * @returns {void}
 */
function enablePasswordValidationOnBlur(input, errorEl, validateFn) {
    input.addEventListener('blur', () => {
        if (input.disabled) return;
        showError(errorEl, validateFn(input.value));
    });
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
 * Validates a password value. Only the minimum length is enforced —
 * no uppercase/lowercase/number rules — so there is only ever this one
 * short message to show, instead of a long combined requirements text.
 * @param {string} value - The password to validate.
 * @returns {string} An error message if invalid, or an empty string if valid.
 */
function validatePassword(value) {
    if (!value) {
        return 'Password must not be empty.';
    }
    return value.length >= MIN_PASSWORD_LENGTH ? '' : PASSWORD_REQUIREMENTS_MSG;
}

/**
 * Validates that the confirm password matches the password.
 * @param {string} password - The original password value.
 * @param {string} confirmPassword - The confirm password value to compare.
 * @returns {string} An error message if invalid, or an empty string if valid.
 */
function validateConfirmPassword(password, confirmPassword) {
    if (!confirmPassword) {
        return 'Confirm Pwd must not be empty.';
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
 * Attaches live validation to the log-in form fields (email and password).
 * @param {{ email: FieldElements, password: FieldElements }} elements
 * @returns {void}
 */
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

/**
 * Same as `enableValidationOnBlurOrInput`, but stays silent until the login form
 * has been submitted once (`loginAttempted`); after that first attempt it
 * validates live like any other field, so the user gets immediate feedback
 * while fixing the reported error.
 * @param {HTMLInputElement} input - The input element to validate.
 * @param {HTMLElement} errorEl - The element that displays the error message.
 * @param {(value: string) => string} validateFn - Function that validates the input value and returns an error message or empty string.
 * @param {string} emptyMessage - Message shown when the field is left empty.
 * @returns {void}
 */
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
    loginAttempted = true;
    const emailMsg = validateEmail(logInElements.email.input.value);
    const passwordMsg = validateLogInPassword(logInElements.password.input.value);
    showError(logInElements.email.error, emailMsg);
    showError(logInElements.password.error, passwordMsg);
    const isValid = !emailMsg && !passwordMsg;
    return isValid;
}
