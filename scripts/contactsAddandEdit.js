import { 
    renderAddOrEditContactDialog,
    renderUnderlineHeaderContactDialog,
    renderContactInput,
    renderPersonInitialsForAddContact,
 } from '../templates/contactsTemplate.js';

 import {DEFAULT_CONTACT_COLOR, writeNewContact} from './contacts.js';
const contactDialog = document.getElementById('contact_dialog_id');
const contactDialogHeader = document.getElementById('contact_dialog_header_id');
const editContactInputContainer = document.getElementById('contact_form_section_id');


/**
 * Registers a global click event listener that handles elements with a
 * `data-action` attribute. Opens the add contact dialog for the
 * `'open_dialog_contact'` action, or closes it for the `'close_dialog_contact'`
 * action.
 *
 * @returns {void}
 *
 * @example
 * // Registered once at module load; no manual invocation needed.
 */
document.addEventListener('click', (e) => {
    const element = e.target.closest('[data-action]');
    if (!element) return;
    const action = element.dataset.action;
    if (action === 'open_dialog_contact') {
        openAddContactDialog();
    }
    if (action === 'close_dialog_contact') {
        closeAddContactDialog();
    }
});

/**
 * Opens the add contact dialog and initializes it for creating a new contact.
 * Displays the dialog as a modal, switches the dialog header to the "add" state,
 * appends the header underline decoration, opens the empty edit form, and
 * registers the event listeners for the color picker and the dialog's action buttons.
 *
 * @returns {void}
 *
 * @example
 * openAddContactDialog();
 */
function openAddContactDialog() {
    contactDialog.showModal();
    contactDialogHeaderSwitch();
    contactDialogHeader.appendChild(renderUnderlineHeaderContactDialog());
    openEditInput();
    startEventListenerColorPicker();
    startEventListenersAddContactDialog();
}

/**
 * Switches the contact dialog's header content between the "add" and "edit" states.
 * Clears the current header content and re-renders it based on the given state.
 *
 * @param {boolean} [state] - Whether the dialog is in edit mode (`true`) or add mode (`false`/`undefined`).
 * @returns {void}
 *
 * @example
 * contactDialogHeaderSwitch(true); // edit mode
 * contactDialogHeaderSwitch(); // add mode
 */
export function contactDialogHeaderSwitch(state) {
    contactDialogHeader.innerHTML = '';
    contactDialogHeader.appendChild(renderAddOrEditContactDialog(state));
}

/**
 * Renders the contact input form into the dialog, for either the add or edit mode.
 * Removes any existing input form to avoid duplicates, resolves the contact's index
 * in `contactsList` when an ID is provided, and appends the newly rendered form
 * to the edit contact input container.
 *
 * @param {string} [mode] - The form mode, e.g. `'edit'` or `undefined`/other value for add mode.
 * @param {string|number} [id] - The ID of the contact to be edited. Omit when creating a new contact.
 * @returns {void}
 *
 * @example
 * openEditInput('edit', contact.id);
 * openEditInput(); // add mode
 */
function openEditInput(mode, id) {
    const existingInput = document.getElementById('contact_input_id');
    if (existingInput) {
        existingInput.remove();
    }
    let contactId = undefined;
    if (id !== undefined) {
        contactId = searchIndex(id);
    }
    editContactInputContainer.appendChild(renderContactInput(mode, contactId));
}

/**
 * Registers a blur event listener on the contact name input field inside the add contact dialog.
 * If a name has been entered, derives the initials from the input value and updates the
 * avatar preview to display them. If the field is left empty, resets the avatar preview
 * to its default state.
 *
 * @returns {void}
 *
 * @example
 * startEventListenersAddContactDialog();
 */
function startEventListenersAddContactDialog() {
    document.getElementById('contact_name_id').addEventListener('blur', (event) => {
        if (event.target.value != '') {
            let showFirstLetters = contactListInitials(event.target.value);
            changeImgToInitials(showFirstLetters);
        } else {
            resetPersonInitials();
        }
    });
}

/**
 * Updates the contact avatar preview to display the given initials instead of the
 * default person icon. If the initials element already exists in the DOM, updates
 * its text content directly; otherwise replaces the default icon element with a
 * newly rendered initials element.
 *
 * @param {string} initials - The initials to be displayed in the avatar preview.
 * @returns {void}
 *
 * @example
 * changeImgToInitials('JD');
 */
function changeImgToInitials(initials) {
    let imgElement = document.getElementById('person_icon_id');
    if (imgElement === null) {
        document.getElementById('person_initials_id').textContent = initials;
        return;
    }
    let initialsElement = renderPersonInitialsForAddContact(initials);
    imgElement.replaceWith(initialsElement);
}

/**
 * Resets the contact avatar preview back to the default person icon.
 * If no initials element is currently present in the DOM, does nothing.
 * Otherwise creates a new default person icon image element and replaces
 * the initials element with it.
 *
 * @returns {void}
 *
 * @example
 * resetPersonInitials();
 */
function resetPersonInitials() {
    let initialsElement = document.getElementById('person_initials_id');
    if (initialsElement === null) {
        return;
    }
    let imgElement = document.createElement('img');
    imgElement.id = 'person_icon_id';
    imgElement.src = 'assets/img/person64x64.webp';
    imgElement.alt = 'Person Icon';
    initialsElement.replaceWith(imgElement);
}

/**
 * Closes the add/edit contact dialog and resets its state for the next use.
 * Resets the global `--contact-color` CSS custom property to its default value,
 * clears all input field values, resets the avatar preview to the default icon,
 * and closes the dialog.
 *
 * @returns {void}
 *
 * @example
 * closeAddContactDialog();
 */
export function closeAddContactDialog() {
    document.documentElement.style.setProperty('--contact-color', DEFAULT_CONTACT_COLOR);
    deleteInputValues();
    resetPersonInitials();
    contactDialog.close();
}

/**
 * Clears all input fields within the contact form and resets the global
 * `--contact-color` CSS custom property to its default value.
 *
 * @returns {void}
 *
 * @example
 * deleteInputValues();
 */
function deleteInputValues() {
    const form = document.querySelector('#contact_form_id');
    form.querySelectorAll('input').forEach((input) => {
        input.value = '';
    });
    document.documentElement.style.setProperty('--contact-color', DEFAULT_CONTACT_COLOR);
}

/**
 * Registers a global submit event listener for the contact form. Prevents the
 * default form submission and, when the submitter's `data-action` is
 * `'create_contact'`, reads the entered contact values and creates a new
 * contact. Currently has no effect for the `'update_contact'` action.
 *
 * @returns {void}
 *
 * @example
 * // Registered once at module load; no manual invocation needed.
 */
document.addEventListener('submit', (event) => {
    if (!event.target.matches('#contact_form_id')) return;
    event.preventDefault();
    switch (event.submitter.dataset.action) {
        case 'create_contact':
            getNewContactValues();
            break;
    }
});

/**
 * Reads the current values from the contact form's input fields, derives the
 * contact's initials from the entered name, assembles a new contact object,
 * and passes it to `writeNewContact` for persistence.
 *
 * @returns {void}
 *
 * @example
 * getNewContactValues();
 */
function getNewContactValues() {
    let contact = {
        name: document.getElementById('contact_name_id').value,
        email: document.getElementById('contact_email_id').value,
        phone: document.getElementById('contact_phone_id').value,
        color: document.getElementById('contact_color_picker_id').value,
        shortName: contactListInitials(document.getElementById('contact_name_id').value),
    };
    writeNewContact(contact);
}

/**
 * Derives up to two-letter initials from a given full name.
 * Splits the name into words, takes the first two words, and returns their
 * uppercased first letters joined together.
 *
 * @param {string} contactListName - The full name from which to derive the initials.
 * @returns {string} The uppercased initials (up to two letters).
 *
 * @example
 * const initials = contactListInitials('John Doe'); // 'JD'
 */
function contactListInitials(contactListName) {
    let initials = contactListName
        .split(' ')
        .splice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
    return initials;
}