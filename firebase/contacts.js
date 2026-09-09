import { getContacts } from '../firebase/contact.service.js';

/**
 * Loads all contacts from the backend and renders them into the UI.
 *
 * @returns {Promise<void>}
 */
async function initContacts() {
    const contacts = await getContacts();
    renderContacts(contacts);
}

initContacts();
