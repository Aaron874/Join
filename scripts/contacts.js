import {
    getFirstLetterForSeperator,
    seperatIdFromContactList,
    removeContactListFromDom,
} from './contactListBuilder.js';
import { waitForAuthenticatedUser } from '../firebase/auth-state.js';
import { createContact } from '../firebase/contacts.service.js';
import { getContacts, updateContact, getContact } from '../firebase/contacts.service.js';
import { getUserProfile } from '../firebase/user.service.js';
import { renderSingleContactView } from '../templates/contactsTemplate.js';
import {
    closeAddContactDialog,
    errorMessageDialog,
    contactSuccessfullyCreatedDialog,
    contactListInitials,
} from './contactsAddandEdit.js';
import { eventListenerDeleteContactDialog } from './contactsListener.js';
export let contactsList = [];
export const DEFAULT_CONTACT_COLOR = '#D1D1D1';
export const MOBILE_BREAKPOINT = 701;
const contactsSingleViewContainer = document.querySelector('#contacts_single_view_content_id');

window.result = await waitForAuthenticatedUser();

loadContacts();

/**
 * Loads the full contacts list from the backend into the global `contactsList`,
 * makes sure the currently logged-in user has their own account as an editable
 * entry in that list, and rebuilds the letter separators for the contact list UI.
 *
 * @async
 * @returns {Promise<void>}
 *
 * @example
 * await loadContacts();
 */
async function loadContacts() {
    contactsList = await getContacts();
    await ensureSelfContactExists();
    getFirstLetterForSeperator();
}

/**
 * Ensures the currently logged-in (non-guest) user also appears as a regular,
 * editable entry in their own contact list. Looks up the user's profile
 * (name/email), skips silently if no such profile can be resolved or a
 * contact with that email already exists, and otherwise creates the contact
 * and refreshes `contactsList` from the backend.
 *
 * @async
 * @returns {Promise<void>}
 *
 * @example
 * await ensureSelfContactExists();
 */
async function ensureSelfContactExists() {
    const user = window.result;
    if (!user || user.isAnonymous) return;
    try {
        const profile = await getUserProfile();
        const name = profile?.name ?? profile?.username ?? user.displayName ?? '';
        const email = profile?.email ?? user.email ?? '';
        if (!name || !email) return;
        const alreadyExists = contactsList.some((contact) => contact.email === email);
        if (alreadyExists) return;
        await createContact({
            name,
            email,
            phone: '',
            color: DEFAULT_CONTACT_COLOR,
            shortName: contactListInitials(name),
        });
        contactsList = await getContacts();
    } catch (error) {
        console.error('Eigener Kontakt konnte nicht angelegt werden:', error);
    }
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
    contactListMarkedContact(id);
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
 * Marks a contact as selected in the contacts list.
 * @param {string|number} id - Contact ID.
 */
function contactListMarkedContact(id) {
    const allContacts = document.querySelectorAll('.contacts_list_items_container');
    allContacts.forEach((contact) => contact.classList.remove('selected'));
    const selectedContact = document.getElementById('contact_id_' + id);
    selectedContact.classList.add('selected');
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
export function switchListToSingleViewAndBack() {
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
export async function updateContactInList(contactId, updatedContact) {
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
 * @returns {string|number} The ID of the last contact in `contactsList`.
 * @example
 * const newId = idNewContact();
 */
function idNewContact() {
    const newContactId = contactsList[contactsList.length - 1].id;
    return newContactId;
}
