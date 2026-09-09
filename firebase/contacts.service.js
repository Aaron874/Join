import {
    ref,
    push,
    get,
    update,
    remove,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

import { db, auth } from './firebase-config.js';

/**
 * Builds the database path for the given collection, scoped to the currently authenticated
 * user: anonymous (guest) users share a common "guest" path, while regular users get a path
 * scoped to their unique UID.
 *
 * @param {string} collection - The name of the top-level collection (e.g. "contacts").
 * @throws {Error} If no user is currently authenticated.
 * @returns {string} The user-scoped database path for the given collection.
 */
function getUserPath(collection) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('Kein Benutzer angemeldet.');
    }

    if (user.isAnonymous) {
        return `${collection}/guest`;
    }

    return `${collection}/${user.uid}`;
}

/**
 * Creates a new contact in the database under the current user's contacts path, generating a
 * new unique key for it.
 *
 * @param {Object} contact - The contact data to create.
 * @param {string} contact.name - The contact's name.
 * @param {string} contact.email - The contact's email.
 * @param {string} contact.phone - The contact's phone number.
 * @param {string} contact.color - The contact's avatar color.
 * @param {string} contact.shortName - The contact's initials shown in the avatar.
 * @returns {Promise<import('firebase/database').ThenableReference>} A promise resolving to a reference to the newly created contact, whose `.key` is the new contact's ID.
 */
export async function createContact(contact) {
    return push(ref(db, getUserPath('contacts')), contact);
}

/**
 * Fetches all contacts for the current user from the database, converting the object keyed by
 * contact ID into an array of contact objects, each including its ID.
 *
 * @returns {Promise<Array<Object>>} A promise resolving to an array of contact objects (each including an "id" field), or an empty array if no contacts exist.
 */
export async function getContacts() {
    const snapshot = await get(ref(db, getUserPath('contacts')));

    if (!snapshot.exists()) {
        return [];
    }

    return Object.entries(snapshot.val()).map(([id, contact]) => ({
        id,
        ...contact,
    }));
}

/**
 * Fetches a single contact by ID for the current user from the database.
 *
 * @param {string|number} contactId - The ID of the contact to fetch.
 * @returns {Promise<Object|null>} A promise resolving to the contact object (including its "id" field), or null if no contact with that ID exists.
 */
export async function getContact(contactId) {
    const snapshot = await get(ref(db, `${getUserPath('contacts')}/${contactId}`));
    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: contactId,
        ...snapshot.val(),
    };
}

/**
 * Updates specific fields of an existing contact in the database, scoped to the current
 * user's data path.
 *
 * @param {string|number} contactId - The ID of the contact to update.
 * @param {Object} updatedContact - An object containing the contact fields to update.
 * @returns {Promise<void>} A promise that resolves once the update has been written to the database.
 */
export async function updateContact(contactId, updatedContact) {
    return update(ref(db, `${getUserPath('contacts')}/${contactId}`), updatedContact);
}

/**
 * Deletes a contact by ID from the database for the current user.
 *
 * @param {string|number} contactId - The ID of the contact to delete.
 * @returns {Promise<void>} A promise that resolves once the contact has been removed from the database.
 */
export async function deleteContact(contactId) {
    return remove(ref(db, `${getUserPath('contacts')}/${contactId}`));
}

/**
 * Loads all contacts from the database.
 * @returns {Promise<Array<Object>>} A list of all contacts with their IDs.
 */
export async function getAllContacts() {
    const snapshot = await get(ref(db, 'contacts'));
    if (!snapshot.exists()) {
        return [];
    }
    return Object.values(snapshot.val()).flatMap((userContacts) =>
        Object.entries(userContacts ?? {}).map(([id, contact]) => ({
            id,
            ...contact,
        }))
    );
}
