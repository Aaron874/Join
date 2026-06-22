import { getContacts }
    from "../firebase/contacts.service.js";

// async function initContacts() {
//     const contacts = await getContacts();

//     console.log(contacts);

//     // renderContacts(contacts);
// }

async function initContacts() {

    const contacts = await getContacts();

    console.log("TYPE:", typeof contacts);

    console.log("DATA:", contacts);

    for (const id in contacts) {

        console.log(id, contacts[id]);

    }

}

initContacts();