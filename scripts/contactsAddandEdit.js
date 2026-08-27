import {
    renderAddOrEditContactDialog,
    renderUnderlineHeaderContactDialog,
    renderContactInput,
    renderPersonInitialsForAddContact,
} from '../templates/contactsTemplate.js';

import { DEFAULT_CONTACT_COLOR, writeNewContact, searchIndex, removeContactFromDom,
} from './contacts.js';
import { deleteContact } from '../firebase/contacts.service.js';


import {
    startEventListenerColorPicker,
    startEventListenersAddContactDialog,
    listenerMobileEditMenu,
} from './contactsListener.js';

const contactDialog = document.getElementById('contact_dialog_id');
const contactDialogHeader = document.getElementById('contact_dialog_header_id');
const editContactInputContainer = document.getElementById('contact_form_section_id');
const SUCCESS_DIALOG_TIMEOUT = 2000;

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
export function openAddContactDialog() {
    openContactDialog();
    contactDialogHeaderSwitch();
    contactDialogHeader.appendChild(renderUnderlineHeaderContactDialog());
    openEditInput();
    resetPersonInitials();
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
export function changeImgToInitials(initials) {
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
export function resetPersonInitials() {
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
    closeContactDialog();
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
 * Reads the current values from the contact form's input fields, derives the
 * contact's initials from the entered name, assembles a new contact object,
 * and passes it to `writeNewContact` for persistence.
 *
 * @returns {void}
 *
 * @example
 * getNewContactValues();
 */
export function getNewContactValues() {
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
export function contactListInitials(contactListName) {
    let initials = contactListName
        .split(' ')
        .splice(0, 2)
        .map((word) => word[0].toUpperCase())
        .join('');
    return initials;
}

/**
 * Opens the contact dialog in edit mode for a given contact.
 * Displays the dialog as a modal, switches the dialog header to the "edit" state,
 * populates the form with the existing contact's data, and registers the
 * event listener for the color picker.
 *
 * @param {string|number} id - The ID of the contact to be edited.
 * @returns {void}
 *
 * @example
 * openEditContactDialog(contact.id);
 */
export function openEditContactDialog(id) {
    openContactDialog();
    contactDialogHeaderSwitch(true);
    openEditInput('edit', id);
    startEventListenerColorPicker();
}

/**
 * Opens the mobile edit/delete menu for a contact.
 * @param {string|number} id - Contact ID.
 * @param {Event} e - Triggering event (propagation stopped).
 * @param {Object} person - Contact data.
 */
export function openEditOrDeleteMenuMobile(id, e, person) {
    e.stopPropagation();
    const mobileEditContainer = document.querySelector('.mobile_contact_menu_wrapper');
    mobileEditContainer.classList.add('open');
    listenerMobileEditMenu(id, mobileEditContainer, person);
}

/**
 * Displays a temporary success confirmation dialog after a contact has been created.
 * Shows the dialog as a modal and automatically closes it again after 2 seconds.
 *
 * @returns {void}
 *
 * @example
 * contactSuccessfullyCreatedDialog();
 */
export function contactSuccessfullyCreatedDialog() {
    const successDialog = document.getElementById('contact_dialog_success_id');
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
    }, SUCCESS_DIALOG_TIMEOUT);
}

/**
 * Displays a temporary message dialog with the given text, reusing the
 * success dialog element. Shows the dialog as a modal and automatically
 * closes it again after `SUCCESS_DIALOG_TIMEOUT` milliseconds.
 *
 * @param {string} message - The message to be displayed in the dialog.
 * @returns {void}
 *
 * @example
 * errorMessageDialog('Error by Loading Contact please try again.');
 */
export function errorMessageDialog(message) {
    const successDialog = document.getElementById('contact_dialog_success_id');
    const messageElement = successDialog.querySelector('p');
    messageElement.textContent = message;
    successDialog.showModal();
    setTimeout(() => {
        successDialog.close();
    }, SUCCESS_DIALOG_TIMEOUT);
}

/**
 * Opens the contact dialog and triggers its entrance animation.
 * @returns {void}
 */
function openContactDialog() {
    contactDialog.showModal();
    requestAnimationFrame(() => {
        contactDialog.classList.add('open');
    });
}
/**
 * Closes the contact dialog, waiting for its exit animation to finish
 * before actually closing it.
 * @returns {void}
 */
export function closeContactDialog() {
    contactDialog.classList.remove('open');
    setTimeout(() => {
        contactDialog.close();
    }, 300);
}
/**
 * Starts the contact dialog's close listeners (Escape key and backdrop click).
 * @returns {void}
 */
startContactDialogCloseListeners();


/**
 * Attaches close listeners to the contact dialog: intercepts the
 * Escape key to close it with the animation, and closes it when
 * the backdrop (outside the dialog content) is clicked.
 * @returns {void}
 */
function startContactDialogCloseListeners() {
    contactDialog.addEventListener('cancel', (event) => {
        event.preventDefault();
        closeContactDialog();
    });
    contactDialog.addEventListener('click', (event) => {
        if (event.target === contactDialog) {
            closeContactDialog();
        }
    });
}

/**
 * Registers the click event listeners for the delete confirmation dialog's action buttons.
 * On confirm, deletes the contact remotely, removes it from the DOM, closes the delete
 * dialog, and also closes the contact edit dialog if it is currently open.
 * On cancel, simply closes the delete dialog without further action.
 *
 * @param {string|number} contactId - The ID of the contact to be deleted.
 * @param {HTMLElement} deleteButton - The button element that confirms the deletion.
 * @param {HTMLElement} cancelButton - The button element that cancels the deletion.
 * @param {HTMLDialogElement} deleteDialog - The dialog element to be closed after confirm or cancel.
 * @returns {void}
 *
 * @example
 * eventListenerDeleteContactDialog(contact.id, confirmBtn, cancelBtn, dialogElement);
 */
export function eventListenerDeleteContactDialog(
    contactId,
    deleteButton,
    cancelButton,
    deleteDialog
) {
    deleteButton.addEventListener('click', async () => {
        await deleteContact(contactId);
        removeContactFromDom(contactId);
        deleteDialog.close();
        if (contactDialog.open) {
            closeContactDialog();
        }
    });
    cancelButton.addEventListener('click', () => {
        deleteDialog.close();
    });
}