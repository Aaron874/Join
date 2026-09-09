import { ref, set, get } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';

import { db, auth } from './firebase-config.js';

/**
 * Creates a user profile record in the database for the currently authenticated user,
 * storing their UID, name, email, and creation timestamp.
 *
 * @param {string} name - The user's display name.
 * @param {string} email - The user's email address.
 * @throws {Error} If no user is currently authenticated.
 * @returns {Promise<void>} A promise that resolves once the profile has been written to the database.
 */
export async function createUserProfile(name, email) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('Kein Benutzer angemeldet.');
    }

    return set(ref(db, `users/${user.uid}`), {
        uid: user.uid,
        name,
        email,
        createdAt: Date.now(),
    });
}

/**
 * Fetches the user profile record for the currently authenticated user from the database.
 *
 * @throws {Error} If no user is currently authenticated.
 * @returns {Promise<Object|null>} A promise resolving to the user's profile data, or null if no profile exists.
 */
export async function getUserProfile() {
    const user = auth.currentUser;

    if (!user) {
        throw new Error('Kein Benutzer angemeldet.');
    }

    const snapshot = await get(ref(db, `users/${user.uid}`));

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.val();
}
