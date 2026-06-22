import {
    ref,
    get
} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import { db } from "./firebase.config.js";

export async function getContacts() {
    const snapshot = await get(
        ref(db, "contacts")
    );

    return snapshot.val() || {};
}