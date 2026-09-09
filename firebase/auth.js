import { auth } from './firebase-config.js';

import {
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

/**
 * Signs in as an anonymous (guest) user with Firebase Authentication.
 *
 * @returns {Promise<import('firebase/auth').UserCredential>} A promise resolving to the Firebase UserCredential of the anonymous user.
 */
export async function guestLogin() {
    return await signInAnonymously(auth);
}

/**
 * Signs in an existing user with Firebase Authentication using the given email and password.
 *
 * @param {string} email - The user's email address.
 * @param {string} password - The user's password.
 * @returns {Promise<import('firebase/auth').UserCredential>} A promise resolving to the Firebase UserCredential of the signed-in user.
 */
export async function login(email, password) {
    return await signInWithEmailAndPassword(auth, email, password);
}

/**
 * Registers a new user with Firebase Authentication using the given email and password.
 *
 * @param {string} email - The new user's email address.
 * @param {string} password - The new user's chosen password.
 * @returns {Promise<import('firebase/auth').UserCredential>} A promise resolving to the Firebase UserCredential of the newly created user.
 */
export async function register(email, password) {
    return await createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Signs out the currently authenticated Firebase user.
 *
 * @returns {Promise<void>} A promise that resolves once sign-out is complete.
 */
export async function logout() {
    return await signOut(auth);
}
