import { getContacts }
    from "../firebase/contact.service.js";

async function initContacts() {
    const contacts = await getContacts();
    renderContacts(contacts);
}

initContacts();