// auth.js

import { auth } from "./firebase.js";

import {
    signInAnonymously,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

export async function guestLogin() {
    return await signInAnonymously(auth);
}

export async function login(email, password) {
    return await signInWithEmailAndPassword(
        auth,
        email,
        password
    );
}

export async function register(email, password) {
    return await createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
}