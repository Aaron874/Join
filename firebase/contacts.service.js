import {
    ref,
    push,
    get,
    update,
    remove
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    db,
    auth
} from "./firebase-config.js";

/**
 * Gibt die UID des aktuell angemeldeten Benutzers zurück.
 * @returns {string}
 */
function getUserId() {
    const user = auth.currentUser;

    if (!user) {
        throw new Error("Kein Benutzer angemeldet.");
    }

    return user.uid;
}

/**
 * Erstellt einen neuen Kontakt.
 * @param {Object} contact
 * @returns {Promise}
 */
export async function createContact(contact) {
    const uid = getUserId();

    return push(
        ref(db, `contacts/${uid}`),
        contact
    );
}

/**
 * Lädt alle Kontakte des aktuellen Benutzers.
 * @returns {Promise<Array>}
 */
export async function getContacts() {
    const uid = getUserId();
    

    const snapshot = await get(
        ref(db, `contacts/${uid}`)
    );

    if (!snapshot.exists()) {
        return [];
    }

    return Object.entries(snapshot.val()).map(([id, contact]) => ({
        id,
        ...contact
    }));
}

/**
 * Lädt einen einzelnen Kontakt.
 * @param {string} contactId
 * @returns {Promise<Object|null>}
 */
export async function getContact(contactId) {
    const uid = getUserId();

    const snapshot = await get(
        ref(db, `contacts/${uid}/${contactId}`)
    );

    if (!snapshot.exists()) {
        return null;
    }

    return {
        id: contactId,
        ...snapshot.val()
    };
}

/**
 * Aktualisiert einen Kontakt.
 * @param {string} contactId
 * @param {Object} updatedContact
 */
export async function updateContact(contactId, updatedContact) {
    const uid = getUserId();

    return update(
        ref(db, `contacts/${uid}/${contactId}`),
        updatedContact
    );
}

/**
 * Löscht einen Kontakt.
 * @param {string} contactId
 */
export async function deleteContact(contactId) {
    const uid = getUserId();

    return remove(
        ref(db, `contacts/${uid}/${contactId}`)
    );
}
