import {
    auth
} from '../../firebase/firebase-config.js';

import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from
'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

export async function login(email, password) {
    return signInWithEmailAndPassword(
        auth,
        email,
        password
    );
}

export async function signup(email, password) {
    return createUserWithEmailAndPassword(
        auth,
        email,
        password
    );
}

export async function logout() {
    return signOut(auth);
}

export function observeAuth(callback) {
    return onAuthStateChanged(
        auth,
        callback
    );
}