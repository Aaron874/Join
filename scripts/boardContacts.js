import { auth } from '../firebase/firebase-config.js';
import { waitForAuthenticatedUser } from '../firebase/auth-state.js';
import { getContacts } from '../firebase/contacts.service.js';

window.boardContacts = [];
window.contactsList = [];
 

/**
 * Load contacts for the board and ensure an authenticated session exists.
 * This will attempt a guest login if no authenticated user is present.
 * The resulting contacts are cached on `window.boardContacts` and
 * `window.contactsList` for global access.
 * @returns {Promise<Array<Object>>} Resolves with the loaded contacts array.
 */
window.loadBoardContacts = async function () {
    await ensureBoardAuthentication();
    const contacts = await getContacts();
    window.boardContacts = contacts;
    window.contactsList = contacts;
    return contacts;
};

/**
 * Assign colors to a list of contacts based on a repeating palette.
 * Colors are selected from the global `boardContactColors` array.
 * @param {Array<Object>} contacts - Array of contact objects
 * @returns {Array<Object>} New array of contacts with `color` property added
 */
function addBoardContactColors(contacts) {
    return contacts.map((contact, index) => ({
        ...contact,
        color: boardContactColors[index % boardContactColors.length]
    }));
}

/**
 * Ensure there is an authenticated user for board operations.
 * If no user is present, performs a guest login and waits for auth state.
 * @returns {Promise<void>}
 */
async function ensureBoardAuthentication() {
    return waitForAuthenticatedUser();
}

