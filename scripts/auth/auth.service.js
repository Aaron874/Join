import { auth } from '../../firebase/firebase-config.js';

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInAnonymously,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/**
 * Registers a new user with Firebase Authentication using the given email and password.
 *
 * @param {string} email - The new user's email address.
 * @param {string} password - The new user's chosen password.
 * @returns {Promise<import('firebase/auth').UserCredential>} A promise resolving to the Firebase UserCredential of the newly created user.
 */
export function registerUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Signs in an existing user with Firebase Authentication using the given email and password.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<import('firebase/auth').UserCredential>} A promise resolving to the Firebase UserCredential of the signed-in user.
 */
export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Signs out the currently authenticated Firebase user.
 *
 * @returns {Promise<void>} A promise that resolves once sign-out is complete.
 */
export function logoutUser() {
    return signOut(auth);
}

/**
 * Signs in as an anonymous (guest) user with Firebase Authentication.
 *
 * @returns {Promise<import('firebase/auth').UserCredential>} A promise resolving to the Firebase UserCredential of the anonymous user.
 */
export function loginGuest() {
    return signInAnonymously(auth);
}

/**
 * Retrieves the currently authenticated Firebase user, if any.
 *
 * @returns {import('firebase/auth').User|null} The currently signed-in user, or null if no user is authenticated.
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Checks whether a user is currently authenticated with Firebase.
 *
 * @returns {boolean} True if a user is currently signed in (including anonymous/guest users), false otherwise.
 */
export function isLoggedIn() {
    return auth.currentUser !== null;
}
