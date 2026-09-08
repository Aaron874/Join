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
    eventListenerDeleteContactDialog
} from './contactsAddandEdit.js';
export let contactsList = [];
export const DEFAULT_CONTACT_COLOR = '#D1D1D1';
export const MOBILE_BREAKPOINT = 701;
const contactsSingleViewContainer = document.querySelector('#contacts_single_view_content_id');

window.result = await waitForAuthenticatedUser();

loadContacts();


/**
 * Loads all contacts from the backend, ensures the "self" contact (the currently logged-in
 * user's own entry) exists in the list, and prepares the first-letter data used for the
 * alphabetical separators in the contact list.
 *
 * @returns {Promise<void>}
 */
async function loadContacts() {
    contactsList = await getContacts();
    await ensureSelfContactExists();
    getFirstLetterForSeperator();
}


/**
 * Ensures the currently logged-in user has a corresponding entry in the contact list.
 * Skips execution for anonymous or missing users. Fetches the user's profile, falling back
 * to the auth user's display name/email if profile fields are unavailable. If a contact with
 * the same email already exists, nothing is created. Otherwise, a new contact is created for
 * the user and the contact list is reloaded. Any errors during this process are logged but
 * not thrown.
 *
 * @returns {Promise<void>}
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
 * Renders the single contact view for the given contact ID into the single view container,
 * marks the corresponding entry in the contact list as selected, and switches the layout
 * from list view to single view (and back), applying mobile-specific behavior if requested.
 *
 * @param {string|number} id - The ID of the contact to display.
 * @param {string} [mode] - Optional display mode. Pass "mobile" to apply mobile-specific view switching behavior; omit for the default (desktop) behavior.
 * @returns {void}
 */
export function openSingleViewContact(id, mode) {
    contactListMarkedContact(id);
    const contactIndex = searchIndex(id);
    switchListToSingleViewAndBack(mode);
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
 * Visually marks the contact with the given ID as selected in the contact list by removing
 * the "selected" class from all contact list items and adding it to the one matching the ID.
 *
 * @param {string|number} id - The ID of the contact to mark as selected.
 * @returns {void}
 */
function contactListMarkedContact(id) {
    const allContacts = document.querySelectorAll('.contacts_list_items_container');
    allContacts.forEach((contact) => contact.classList.remove('selected'));
    const selectedContact = document.getElementById('contact_id_' + id);
    selectedContact.classList.add('selected');
}


/**
 * Toggles between the contact list view and the single contact view on mobile viewports by
 * toggling the relevant visibility classes on both containers. Has no effect on non-mobile
 * viewports (width >= MOBILE_BREAKPOINT). If mode is "mobile", the function returns early
 * without toggling anything, since the mobile flow handles the view switch elsewhere.
 *
 * @param {string} [mode='single'] - The mode to switch in. Pass "mobile" to skip the toggle (used when a mobile-specific handler already manages the view switch); any other value (default "single") performs the toggle.
 * @returns {void}
 */
export function switchListToSingleViewAndBack(mode = 'single') {
    let width = window.innerWidth;
    if (width < MOBILE_BREAKPOINT) {
        const viewContainer = document.querySelector('.contacts_single_view_container');
        const listContainer = document.querySelector('.contacts_list_container');
        if (mode === 'mobile') {
            return;}
        viewContainer.classList.toggle('visible_flex');
        listContainer.classList.toggle('hidden');
    }
}


/**
 * Finds the index of the contact with the given ID within contactsList.
 *
 * @param {string|number} contactId - The ID of the contact to search for.
 * @returns {number|undefined} The index of the matching contact in contactsList, or undefined if no contact with the given ID is found.
 */
export function searchIndex(contactId) {
    for (let index = 0; index < contactsList.length; index++) {
        if (contactsList[index].id === contactId) {
            return index;
        }
    }
}


/**
 * Updates a contact both on the backend and in the local contactsList, then refreshes the
 * corresponding DOM entry, closes the add/edit contact dialog, and re-opens the single
 * contact view to reflect the updated data.
 *
 * @param {string|number} contactId - The ID of the contact to update.
 * @param {Object} updatedContact - The updated contact data to send to the backend.
 * @returns {Promise<void>}
 */
export async function updateContactInList(contactId, updatedContact) {
    await updateContact(contactId, updatedContact);
    const contactNumber = searchIndex(contactId);
    let changedContact = await getContact(contactId);
    contactsList[contactNumber] = changedContact;
    changeContactInDom(contactId, changedContact);
    closeAddContactDialog();
    openSingleViewContact(contactId, 'mobile');
}

/**
 * Updates the DOM representation of a single contact list entry in place, without re-rendering
 * the whole list, reflecting the contact's new name, email, initials, and color.
 *
 * @param {string|number} contactId - The ID of the contact whose list entry should be updated.
 * @param {Object} changedContact - The updated contact data.
 * @param {string} changedContact.name - The contact's updated name.
 * @param {string} changedContact.email - The contact's updated email.
 * @param {string} changedContact.shortName - The contact's updated initials shown in the avatar.
 * @param {string} changedContact.color - The contact's updated avatar color.
 * @returns {void}
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
 * Opens the delete confirmation dialog for the given contact, displaying the contact's name
 * and wiring up the delete/cancel buttons via eventListenerDeleteContactDialog.
 *
 * @param {string|number} contactId - The ID of the contact to potentially delete.
 * @param {string} person - The name of the contact, shown in the confirmation message.
 * @returns {void}
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
 * Removes a contact from the local contactsList and updates the UI accordingly: re-renders
 * the contact list DOM, recalculates the alphabetical separators, and either opens the single
 * view for the new first contact in the list, or switches back to the list view if no
 * contacts remain.
 *
 * @param {string|number} contactId - The ID of the contact to remove.
 * @returns {void}
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
 * Creates a new contact via the backend, refreshes the local contact list, and updates the UI:
 * re-renders the contact list DOM, recalculates the alphabetical separators, closes the add
 * contact dialog, shows a success confirmation, and opens the single view for the newly
 * created contact. Displays an error dialog if contact creation fails.
 *
 * @param {Object} contact - The new contact's data to create.
 * @param {string} contact.name - The contact's name.
 * @param {string} contact.email - The contact's email.
 * @param {string} contact.phone - The contact's phone number.
 * @param {string} contact.color - The contact's avatar color.
 * @param {string} contact.shortName - The contact's initials shown in the avatar.
 * @returns {Promise<void>}
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
 * Reloads the full contact list from the backend into contactsList after a new contact has
 * been created. Displays an error dialog if loading fails.
 *
 * @returns {Promise<void>}
 */
async function getContactsAfterCreation() {
    try {
        contactsList = await getContacts();
    } catch (error) {
        errorMessageDialog('Error by Loading Contact please try again.');
    }
}

/**
 * Retrieves the ID of the most recently added contact, assuming newly created contacts are
 * appended to the end of contactsList.
 *
 * @returns {string|number} The ID of the last contact in contactsList.
 */
function idNewContact() {
    const newContactId = contactsList[contactsList.length - 1].id;
    return newContactId;
}
