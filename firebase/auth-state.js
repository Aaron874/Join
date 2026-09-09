import { auth } from './firebase-config.js';

import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/**
 * Waits for the current Firebase auth state to be resolved and returns the authenticated
 * user once known, unsubscribing from further auth state changes immediately after. Rejects
 * if no user is signed in, or if the auth state listener itself errors.
 *
 * @returns {Promise<import('firebase/auth').User>} A promise resolving to the currently authenticated user.
 */
export function waitForAuthenticatedUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
            auth,
            (user) => {
                unsubscribe();
                if (!user) {
                    reject(new Error('Kein Benutzer angemeldet.'));
                    return;
                }
                resolve(user);
            },
            reject
        );
    });
}
