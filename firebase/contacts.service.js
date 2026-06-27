import {
    ref,
    push
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
    db,
    auth
} from "./firebase.config.js";

export function createContact(contact) {

    const uid = auth.currentUser.uid;

    return push(
        ref(db, `contacts/${uid}`),
        contact
    );
}