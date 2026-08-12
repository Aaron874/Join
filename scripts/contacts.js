import { getFirstLetterForSeperator } from './contactListBuilder.js';
import { waitForAuthenticatedUser } from '../firebase/auth-state.js';
import { createContact } from '../firebase/contacts.service.js';
import { getContacts, updateContact, getContact } from '../firebase/contacts.service.js';
import { renderSingleContactView } from '../templates/contactsTemplate.js';
import { closeAddContactDialog, errorMessageDialog, eventListenerDeleteContactDialog, contactSuccessfullyCreatedDialog } from './contactsAddandEdit.js';
export let contactsList = [];
export const DEFAULT_CONTACT_COLOR = '#D1D1D1';
export const MOBILE_BREAKPOINT = 701;
const contactsSingleViewContainer = document.querySelector('#contacts_single_view_content_id');

window.result = await waitForAuthenticatedUser();

loadContacts();

/**
 * Loads the full contacts list from the backend into the global `contactsList`
 * and rebuilds the letter separators for the contact list UI.
 *
 * @async
 * @returns {Promise<void>}
 *
 * @example
 * await loadContacts();
 */
async function loadContacts() {
    contactsList = await getContacts();
    getFirstLetterForSeperator();
}

/**
 * Registers a click listener on the delete button of the single contact view,
 * but only above the mobile breakpoint (button not available on mobile).
 * Opens the delete confirmation dialog for the contact when clicked.
 *
 * @param {HTMLElement} newSingleView - The single contact view element containing the button.
 * @param {string|number} id - The ID of the contact to be deleted.
 * @param {Object} person - The contact data passed to the delete dialog.
 * @returns {void}
 *
 * @example
 * openDeleteDialogBtnListener(singleViewElement, contact.id, contact);
 */
export function openDeleteDialogBtnListener(newSingleView, id, person) {
    let screenSize = window.innerWidth;
    if (screenSize > MOBILE_BREAKPOINT) {
        const deleteButton = newSingleView.querySelector('#delete_btn_id');
        deleteButton.addEventListener('click', () => {
            deleteContactDialog(id, person);
        });
    }
}

/**
 * Registers a click listener on the delete button in the edit contact form
 * that opens the delete confirmation dialog for the contact.
 *
 * @param {string|number} contactId - Index/key to look up the contact in `contactsList`.
 * @param {Object} person - The contact data passed to the delete dialog.
 * @param {HTMLElement} editContactInput - The edit contact form element containing the button.
 * @returns {void}
 *
 * @example
 * deleteBtnListener(contactId, contact, editFormElement);
 */
export function deleteBtnListener(contactId, person, editContactInput) {
    const deleteBtn = editContactInput.querySelector('#edit_contact_btn_delete_id');
    if (deleteBtn) {
        let contactIdent = contactsList[contactId].id;
        deleteBtn.addEventListener('click', (event) => {
            event.preventDefault();
            deleteContactDialog(contactIdent, person);
        });
    }
}

/**
 * Registers a click event listener on the mobile "back to list" button of the contact's single view.
 * Switches the view back from the single contact view to the contact list when clicked.
 *
 * @param {HTMLElement} newSingleView - The DOM element of the single contact view in which the button is searched for.
 * @returns {void}
 *
 * @example
 * returnToListBtnListener(singleViewElement);
 */
export function returnToListBtnListener(newSingleView) {
    const returnToListBtn = newSingleView.querySelector('#mobile_back_btn_id');
    returnToListBtn.addEventListener('click', () => {
        switchListToSingleViewAndBack();
    });
}

/**
 * Registers a click event listener on a contact list item element.
 * Opens the single contact view for the given contact when clicked.
 *
 * @param {HTMLElement} newContact - The DOM element representing the contact list item.
 * @param {string|number} id - The ID of the contact to be opened in the single view.
 * @returns {void}
 *
 * @example
 * createListenerForContactInList(contactListItemElement, contact.id);
 */
export function createListenerForContactInList(newContact, id) {
    newContact.addEventListener('click', () => {
        openSingleViewContact(id);
    });
}

/**
 * Opens and renders the single contact view for the given contact.
 * Looks up the contact's index in the global `contactsList`, switches the UI from
 * list view to single view, clears the current single view container, and renders
 * the contact's details into it.
 *
 * @param {string|number} id - The ID of the contact to be displayed in the single view.
 * @returns {void}
 *
 * @example
 * openSingleViewContact(contact.id);
 */
export function openSingleViewContact(id) {
    const contactIndex = searchIndex(id);
    switchListToSingleViewAndBack();
    const contact = contactsList[contactIndex];
    contactsSingleViewContainer.innerHTML = '';
    contactsSingleViewContainer.appendChild(
        renderSingleContactView(
            contact.shortName,
            contact.name,
            contact.email,
            contact.color,
            contact.phone,
            contact.id
        )
    );
}

/**
 * Toggles the visibility between the contact list and the single contact view
 * on mobile screens. Only applies when the screen width is below the mobile
 * breakpoint; on larger screens both views remain visible/unaffected.
 *
 * @returns {void}
 *
 * @example
 * switchListToSingleViewAndBack();
 */
function switchListToSingleViewAndBack() {
    let width = window.innerWidth;
    if (width < MOBILE_BREAKPOINT) {
        const viewContainer = document.querySelector('.contacts_single_view_container');
        const listContainer = document.querySelector('.contacts_list_container');
        viewContainer.classList.toggle('visible_flex');
        listContainer.classList.toggle('hidden');
    }
}

/**
 * Searches the global `contactsList` for a contact matching the given ID and
 * returns its index within the array.
 *
 * @param {string|number} contactId - The ID of the contact to search for.
 * @returns {number|undefined} The index of the matching contact in `contactsList`,
 * or `undefined` if no contact with the given ID is found.
 *
 * @example
 * const index = searchIndex(contact.id);
 */
export function searchIndex(contactId) {
    for (let index = 0; index < contactsList.length; index++) {
        if (contactsList[index].id === contactId) {
            return index;
        }
    }
}

/**
 * Registers a click event listener on the update/save button inside the edit contact form.
 * On click, reads the current values from the name, email, phone, and color input fields,
 * builds an updated contact object, and passes it along with the resolved contact identifier
 * to `updateContactInList`.
 *
 * @param {HTMLElement} editContactInput - The DOM element of the edit contact form in which the button is searched for.
 * @param {string|number} contactId - The index or key used to look up the contact in `contactsList`.
 * @returns {void}
 *
 * @example
 * updateContactBtnListener(editFormElement, contactId);
 */
export function updateContactBtnListener(editContactInput, contactId) {
    const changeBtn = editContactInput.querySelector('#change_contact_btn_id');
    if (changeBtn) {
        let contactIdent = contactsList[contactId].id;
        changeBtn.addEventListener('click', (event) => {
            event.preventDefault();
            const updatedContact = {
                name: document.getElementById('contact_name_id').value,
                email: document.getElementById('contact_email_id').value,
                phone: document.getElementById('contact_phone_id').value,
                color: document.getElementById('contact_color_picker_id').value,
            };
            updateContactInList(contactIdent, updatedContact);
        });
    }
}

/**
 * Updates a contact with the given data, both remotely and in the local application state.
 * Persists the updated contact via `updateContact`, re-fetches the updated contact data,
 * replaces the corresponding entry in the global `contactsList`, updates the contact's
 * representation in the DOM, closes the edit dialog, and reopens the single contact view.
 *
 * @async
 * @param {string|number} contactId - The ID of the contact to be updated.
 * @param {Object} updatedContact - The new contact data to be saved (e.g. name, email, phone, color).
 * @returns {Promise<void>}
 *
 * @example
 * await updateContactInList(contact.id, { name: 'John Doe', email: 'john@example.com', phone: '123456', color: '#FF5733' });
 */
async function updateContactInList(contactId, updatedContact) {
    await updateContact(contactId, updatedContact);
    const contactNumber = searchIndex(contactId);
    let changedContact = await getContact(contactId);
    contactsList[contactNumber] = changedContact;
    changeContactInDom(contactId, changedContact);
    closeAddContactDialog();
    openSingleViewContact(contactId);
}

/**
 * Updates the DOM representation of a contact list item with the given contact's
 * current data. Updates the displayed name, email, avatar initials, and avatar color
 * of the corresponding list entry.
 *
 * @param {string|number} contactId - The ID of the contact whose list item should be updated.
 * @param {Object} changedContact - The updated contact data containing `name`, `email`, `shortName`, and `color`.
 * @returns {void}
 *
 * @example
 * changeContactInDom(contact.id, updatedContact);
 */
function changeContactInDom(contactId, changedContact) {
    const button = document.getElementById('contact_id_' + contactId);
    button.querySelector('h4').textContent = changedContact.name;
    button.querySelector('p').textContent = changedContact.email;
    button.querySelector('.contacts_list_name_symbol').textContent = changedContact.shortName;
    button
        .querySelector('.contacts_list_name_symbol')
        .style.setProperty('--contact-color', changedContact.color);
}

/**
 * Opens the delete confirmation dialog for a given contact.
 * Displays the dialog as a modal, sets the contact's name in the dialog's text,
 * and registers the necessary event listeners for the confirm and cancel buttons.
 *
 * @param {string|number} contactId - The ID of the contact to be deleted.
 * @param {string} person - The name of the contact to be displayed in the confirmation message.
 * @returns {void}
 *
 * @example
 * deleteContactDialog(contact.id, contact.name);
 */
export function deleteContactDialog(contactId, person) {
    const deleteDialog = document.getElementById('contact_dialog_delete_id');
    deleteDialog.showModal();
    const userNameSpan = deleteDialog.querySelector('#user_name_id');
    userNameSpan.textContent = '';
    userNameSpan.textContent = person;
    const deleteButton = deleteDialog.querySelector('button:first-of-type');
    const cancelButton = deleteDialog.querySelector('button:last-of-type');
    eventListenerDeleteContactDialog(contactId, deleteButton, cancelButton, deleteDialog);
}

/**
 * Removes a contact from the local application state and refreshes the contact list UI.
 * Finds the contact's index in the global `contactsList` and removes it, clears the
 * rendered contact list from the DOM, rebuilds the letter separators, and opens the
 * single view of the first remaining contact. Does nothing further if no contacts
 * are left in the list.
 *
 * @param {string|number} contactId - The ID of the contact to be removed.
 * @returns {void}
 *
 * @example
 * removeContactFromDom(contact.id);
 */
export function removeContactFromDom(contactId) {
    const indexContact = searchIndex(contactId);
    contactsList.splice(indexContact, 1);
    removeContactListFromDom();
    getFirstLetterForSeperator();
    const firstContactListItem = seperatIdFromContactList();
    if (!firstContactListItem) {
        switchListToSingleViewAndBack();
        return;
    }
    openSingleViewContact(firstContactListItem);
}

/**
 * Persists a new contact and refreshes the contact list UI accordingly.
 * Creates the contact remotely, re-fetches the updated contacts list, determines
 * the ID of the newly created contact, rebuilds the rendered contact list and its
 * letter separators, closes the add contact dialog, shows a success confirmation,
 * and opens the single view of the newly created contact. Displays an error
 * dialog to the user if any step fails.
 *
 * @async
 * @param {Object} contact - The new contact data to be saved (e.g. name, email, phone, color, shortName).
 * @returns {Promise<void>}
 *
 * @example
 * await writeNewContact({ name: 'John Doe', email: 'john@example.com', phone: '123456', color: '#FF5733', shortName: 'JD' });
 */
export async function writeNewContact(contact) {
    try {
        await createContact(contact);
        await getContactsAfterCreation();
        let newContactId = idNewContact();
        removeContactListFromDom();
        getFirstLetterForSeperator();
        closeAddContactDialog();
        contactSuccessfullyCreatedDialog();
        openSingleViewContact(newContactId);
    } catch (error) {
        errorMessageDialog('Error saving new Contact. Please try again.');
    }
}

/**
 * Re-fetches the contacts list and updates the global `contactsList`.
 * Shows an error dialog if the fetch fails.
 *
 * @async
 * @returns {Promise<void>}
 *
 * @example
 * await getContactsAfterCreation();
 */
async function getContactsAfterCreation() {
    try {
        contactsList = await getContacts();
    } catch (error) {
        errorMessageDialog('Error by Loading Contact please try again.');
    }
}

/**
 * Retrieves the ID of the recently added contact from the global `contactsList`.
 * Assumes the newest contact is the last entry in the list.
 *
 * @returns {string|number} The ID of the last contact in `contactsList`.
 *
 * @example
 * const newId = idNewContact();
 */
function idNewContact() {
    const newContactId = contactsList[contactsList.length - 1].id;
    return newContactId;
}

/**
 * Removes all rendered contact list items and letter separator elements from the DOM,
 * clearing the contact list container for a fresh re-render.
 *
 * @returns {void}
 *
 * @example
 * removeContactListFromDom();
 */
function removeContactListFromDom() {
    const contactListElements = document.querySelectorAll(
        '.contacts_list_items_container, .contacts_list_letter_seperator'
    );
    contactListElements.forEach((element) => {
        element.remove();
    });
}

/**
 * Extracts the ID from the first contact list item in the DOM by removing
 * the `'contact_id_'` prefix, or `null` if the list is empty.
 *
 * @returns {string|null} The first contact's ID, or `null` if none exist.
 *
 * @example
 * const firstId = seperatIdFromContactList();
 */
function seperatIdFromContactList() {
    const firstContactListItem = document.querySelector('.contacts_list_items_container');
    if (!firstContactListItem) {
        return null;
    }
    const contactId = firstContactListItem.id.replace('contact_id_', '');
    return contactId;
}
