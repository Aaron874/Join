import { auth }
    from "./firebase.config.js";

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    signInAnonymously
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export function registerUser(email, password) {
    return createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
}

export function loginUser(email, password) {
    return signInWithEmailAndPassword(
        auth,
        email,
        password
    );
}

export function logoutUser() {
    return signOut(auth);
}
export async function loginGuest() {
    return await signInAnonymously(auth);
}