


const contactsInputController = new AbortController();
const MAX_PHONE_LENGTH = 20;
const MIN_PHONE_LENGTH = 6;
const PHONE_REGEX = /^\+?[0-9 ]{6,20}$/;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const MAX_EMAIL_LENGTH = 254;



export function startValidationContactInput(editContactInput) {
    const contactElements = getContactsElements(editContactInput);
    startListenerForContactInput(contactElements);
    //Listener einbauen der das create Contact feld freigibt + signal listener in variable//
}
    

function getContactsElements(editContactInput) {
    return {
        name: {
            input: editContactInput.querySelector('#contact_name_id'),
            error: editContactInput.querySelector('#error_contact_name'),
        },
        email: {
            input: editContactInput.querySelector('#contact_email_id'),
            error: editContactInput.querySelector('#error_contact_email'),
        },
        phone: {
            input: editContactInput.querySelector('#contact_phone_id'),
            error: editContactInput.querySelector('#error_contact_phone'),
        },
    };
}

function startListenerForContactInput(contactElements) {
    contactsValidationListener(contactElements.name.input, contactElements.name.error, validateContactName, 'Username required', contactsInputController.signal);
    contactsValidationListener(contactElements.email.input, contactElements.email.error, validateContactEmail, 'Email required', contactsInputController.signal);
    contactsValidationListener(contactElements.phone.input, contactElements.phone.error, validateContactPhone, 'Phone required', contactsInputController.signal);
    console.log(contactsInputController);
    
}   

function contactsValidationListener(input, errorEl, validateFn, emptyMessage, signal) {
    input.addEventListener('blur', () => {
        if (input.disabled) return;
        if (!input.value) {
            showErrorContacts(errorEl, emptyMessage);
        }
    }, { signal });

    input.addEventListener('input', () => {
        showErrorContacts(errorEl, validateFn(input.value));
    }, { signal });
}

function validateContactPhone(value) {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
        return 'Phone must not be empty.';
    }
    if (trimmedValue.length > MAX_PHONE_LENGTH) {
        return `Phone must <${MAX_PHONE_LENGTH} characters.`;
    }
    if (trimmedValue.length < MIN_PHONE_LENGTH) {
        return `Phone must be at least ${MIN_PHONE_LENGTH} characters.`;
    }
    if (!PHONE_REGEX.test(trimmedValue)) {
        return 'Enter a valid Phone, e.g. +49 171 1234567.';
    }
    return '';
}

/**
 * Validates a name value.
 * @param {string} value - The name to validate.
 * @returns {string} An error message if invalid, or an empty string if valid.
 */
function validateContactName(value) {
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
function validateContactEmail(value) {
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


function showErrorContacts(errorEl, errorMessage) {
    errorEl.classList.toggle('hidden_errors', !errorMessage);
    errorEl.textContent = errorMessage;
}

// Submit Button diabled validation Start //

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
function setupSignUpValidationListener() {
    signUpForm = document.getElementById('sign_log_in_id');
    signUpForm.addEventListener('input', updateSubmitButtonState);
    updateSubmitButtonState();
}

