import {
    observeAuth
} from '../auth/auth.service.js';

import {
    isGuest
} from '../sessions/session.service.js';

/**
 * Subscribes to Firebase auth state changes and protects the current route by redirecting
 * unauthenticated users away from protected pages whenever the auth state updates.
 */
observeAuth(user => {
    protectRoute(user);
});

/**
 * Guards the current page against unauthenticated access: does nothing if a Firebase user is
 * present or the current session is a guest session, otherwise redirects to the login page.
 *
 * @param {import('firebase/auth').User|null} user - The currently authenticated Firebase user, or null if none.
 * @returns {void}
 */
function protectRoute(user) {
    if (user || isGuest()) {
        return;
    }

    redirectToLogin();
}

/**
 * Redirects the browser to the login page.
 *
 * @returns {void}
 */
function redirectToLogin() {
    location.href = '/login.html';
}