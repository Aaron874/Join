import { auth } from './firebase-config.js';

import {
    onAuthStateChanged
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

export function waitForAuthenticatedUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(
            auth,
            user => {
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