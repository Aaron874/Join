import {
    ref,
    push,
    get
}
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import { db }
    from "./firebase-config.js";

export function createContact(contact) {
    return push(
        ref(db, "contacts"),
        contact
    );
}

// export async function getContacts() {
//     const snapshot = await get(ref(db, "contacts"));
//     if (!snapshot.exists()) {
//         return {};
//     }
//     return snapshot.val();
// }
export async function getContacts() {
    const refContacts = ref(db, "contacts");

    console.log("REF:", refContacts);

    const snapshot = await get(refContacts);

    console.log("EXISTS:", snapshot.exists());
    console.log("VAL:", snapshot.val());

    return snapshot.val() || {};
}
