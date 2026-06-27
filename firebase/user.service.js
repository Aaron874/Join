import {
    ref,
    set,
    get
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    db,
    auth
} from "./firebase.config.js";

/**
 * Erstellt das Benutzerprofil in der Realtime Database.
 */
export async function createUserProfile(name, email) {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("Kein Benutzer angemeldet.");
    }

    return set(
        ref(db, `users/${user.uid}`),
        {
            uid: user.uid,
            name,
            email,
            createdAt: Date.now()
        }
    );
}

/**
 * Gibt das Profil des aktuellen Benutzers zurück.
 */
export async function getUserProfile() {

    const user = auth.currentUser;

    if (!user) {
        throw new Error("Kein Benutzer angemeldet.");
    }

    const snapshot = await get(
        ref(db, `users/${user.uid}`)
    );

    if (!snapshot.exists()) {
        return null;
    }

    return snapshot.val();
}