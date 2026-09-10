let contactsInputController = new AbortController();
const MAX_PHONE_LENGTH = 20;
const MIN_PHONE_LENGTH = 6;
const PHONE_REGEX = /^\+?[0-9 ]{6,20}$/;
const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 30;
const NAME_REGEX = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[a-zA-Z]{2,}$/;
const MAX_EMAIL_LENGTH = 254;
let contactElements = {};

/**
 * Initializes contact field validation: creates a new AbortController,
 * retrieves the relevant input/error elements, and starts the associated
 * validation listeners.
 *
 * @param {HTMLElement} editContactInput - Container element holding the contact form fields.
 * @returns {void}
 */
export function startValidationContactInput(editContactInput) {
    contactsInputController = new AbortController();
    contactElements = getContactsElements(editContactInput);
    startListenerForContactInput(contactElements, editContactInput);
}

/**
 * Stops contact field validation by aborting the current AbortController,
 * removing all previously registered validation listeners.
 *
 * @returns {void}
 */
export function stopValidationContactInput() {
    contactsInputController.abort();
}

/**
 * Retrieves the input and error elements for the contact fields (name, email, phone)
 * within a given container element.
 *
 * @param {HTMLElement} editContactInput - Container element holding the contact form fields.
 * @returns {{
 *   name: { input: HTMLInputElement, error: HTMLElement },
 *   email: { input: HTMLInputElement, error: HTMLElement },
 *   phone: { input: HTMLInputElement, error: HTMLElement }
 * }} Object containing the corresponding input and error elements for each field.
 */
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

/**
 * Registers validation listeners for the name, email, and phone contact fields
 * and performs an initial check of the submit button state.
 *
 * @param {ReturnType<typeof getContactsElements>} contactElements - All contact field elements.
 * @returns {void}
 */
function startListenerForContactInput(contactElements) {
    contactsValidationListener( contactElements.name.input, contactElements.name.error,
        validateContactName,
        'Username required',
        contactsInputController.signal
    );
    contactsValidationListener( contactElements.email.input, contactElements.email.error,
        validateContactEmail,
        'Email required',
        contactsInputController.signal
    );
    contactsValidationListener( contactElements.phone.input, contactElements.phone.error,
        validateContactPhone,
        'Phone required',
        contactsInputController.signal
    );
    updateSubmitBtnState();
}

/**
 * Checks the validity of all contact fields (name, email, phone) and enables
 * or disables the appropriate submit button (add or edit) accordingly.
 * Relies on the module-scoped `contactElements` variable.
 *
 * @returns {void}
 */
function updateSubmitBtnState() {
    let nameValid = !validateContactName(contactElements.name.input.value);
    let emailValid = !validateContactEmail(contactElements.email.input.value);
    let phoneValid = !validateContactPhone(contactElements.phone.input.value);
    let allValid = nameValid && emailValid && phoneValid;
    let submitButton = checkAddOrEditBtn();
    submitButton.disabled = !allValid;
}

/**
 * Determines which submit button is present in the contact form (the "add"
 * or the "edit" button) and returns it. Relies on the module-scoped
 * `contactElements` variable.
 *
 * @returns {HTMLButtonElement|null} The found submit button, or `null` if neither exists.
 */
function checkAddOrEditBtn() {
    let submitButton = contactElements.name.input
        .closest('form')
        .querySelector('#contact_btn_submit_id');
    if (submitButton) {
        return submitButton;
    }
    return contactElements.name.input.closest('form').querySelector('#change_contact_btn_id');
}

/**
 * Registers blur and input validation listeners for a single contact field.
 * On blur, shows an empty-field message if the value is missing, otherwise
 * shows a validation error if the value is invalid; the submit button state
 * is recalculated in both cases. On input, only clears the error message
 * once the value becomes valid (new errors are only shown on blur, not
 * while typing), and the submit button state is recalculated.
 *
 * @param {HTMLInputElement} input - The input element to validate.
 * @param {HTMLElement} errorEl - Element used to display the validation error message.
 * @param {(value: string) => string} validateFn - Validation function; returns an error
 *   message, or an empty string if the value is valid.
 * @param {string} emptyMessage - Message shown when the field is left empty on blur.
 * @param {AbortSignal} signal - Signal used to remove the listeners in bulk via AbortController.
 * @returns {void}
 */
function contactsValidationListener(input, errorEl, validateFn, emptyMessage, signal) {
    input.addEventListener(
        'blur',
        () => {
            if (!input.value) {
                showErrorContacts(errorEl, emptyMessage);
                updateSubmitBtnState();
                return;
            }
            const errorInput = validateFn(input.value);
            if (errorInput) {
                showErrorContacts(errorEl, errorInput);
            }
            updateSubmitBtnState();
        },
        { signal }
    );
    input.addEventListener(
        'input',
        () => {
            const errorInput = validateFn(input.value);
            if (!errorInput) {
                showErrorContacts(errorEl, errorInput);
            }
            updateSubmitBtnState();
        },
        { signal }
    );
}

/**
 * Validates a contact's phone number.
 *
 * @param {string} value - The phone number value to validate.
 * @returns {string} Error message if invalid, otherwise an empty string.
 */
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
 * Validates a contact's name value.
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
 * Validates an contact's email address.
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

/**
 * Displays an error message in the given error element, or hides it
 * when no message is provided.
 *
 * @param {HTMLElement} errorEl - Element used to display the error message.
 * @param {string} errorMessage - Error text to display; an empty string hides the message.
 * @returns {void}
 */
function showErrorContacts(errorEl, errorMessage) {
    errorEl.classList.toggle('hidden_errors', !errorMessage);
    errorEl.textContent = errorMessage;
}
