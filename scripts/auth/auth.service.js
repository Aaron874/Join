import { auth } from "./firebase.config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInAnonymously
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

/**
 * Registriert einen neuen Benutzer.
 */
export function registerUser(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

/**
 * Meldet einen Benutzer an.
 */
export function loginUser(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

/**
 * Meldet den aktuellen Benutzer ab.
 */
export function logoutUser() {
    return signOut(auth);
}

/**
 * Gastzugang.
 */
export function loginGuest() {
    return signInAnonymously(auth);
}

/**
 * Gibt den aktuellen Benutzer zurück.
 */
export function getCurrentUser() {
    return auth.currentUser;
}

/**
 * Prüft ob ein Benutzer angemeldet ist.
 */
export function isLoggedIn() {
    return auth.currentUser !== null;
}