import {
    ref,
    push,
    get,
    update,
    remove,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

import { db, auth } from './firebase-config.js';

/**
 * Gibt die UID des aktuell angemeldeten Benutzers zurück.
 * @returns {string}
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
 * Erstellt einen neuen Kontakt.
 * @param {Object} contact
 * @returns {Promise}
 */
export async function createContact(contact) {
    return push(ref(db, getUserPath('contacts')), contact);
}

/**
 * Lädt alle Kontakte des aktuellen Benutzers.
 * @returns {Promise<Array>}
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
 * Lädt einen einzelnen Kontakt.
 * @param {string} contactId
 * @returns {Promise<Object|null>}
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
 * Aktualisiert einen Kontakt.
 * @param {string} contactId
 * @param {Object} updatedContact
 */
export async function updateContact(contactId, updatedContact) {
    return update(ref(db, `${getUserPath('contacts')}/${contactId}`), updatedContact);
}

/**
 * Löscht einen Kontakt.
 * @param {string} contactId
 */
export async function deleteContact(contactId) {
    return remove(ref(db, `${getUserPath('contacts')}/${contactId}`));
}
