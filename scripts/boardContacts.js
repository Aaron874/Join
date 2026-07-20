import { auth } from '../firebase/firebase-config.js';
import { guestLogin } from '../firebase/auth.js';
import { getContacts } from '../firebase/contacts.service.js';

window.boardContacts = [];
window.contactsList = [];
const boardContactColors = [
    '#FF7A00',
    '#9327FF',
    '#6E52FF',
    '#FC71FF',
    '#00BEE8',
    '#1FD7C1',
    '#FF745E',
    '#FFA35E',
    '#FC71FF',
    '#FFC701',
    '#0038FF',
    '#C3FF2B',
    '#FFE62B',
    '#FF4646'
];

window.loadBoardContacts = async function () {
    await ensureBoardAuthentication();

    const loadedContacts = await getContacts();
    const contacts = addBoardContactColors(loadedContacts);
    console.log(contacts);
    console.log("Anzahl Kontakte:", contacts.length);
    window.boardContacts = contacts;
    window.contactsList = contacts;

    return contacts;
};

function addBoardContactColors(contacts) {
    return contacts.map((contact, index) => ({
        ...contact,
        color: boardContactColors[index % boardContactColors.length]
    }));
}

async function ensureBoardAuthentication() {
    if (auth.currentUser) return;

    await guestLogin();
    await waitForAuthenticatedUser();
}

function waitForAuthenticatedUser() {
    return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            reject(new Error('Authentifizierung fehlgeschlagen.'));
        }, 5000);

        const intervalId = setInterval(() => {
            if (!auth.currentUser) return;

            clearInterval(intervalId);
            clearTimeout(timeoutId);
            resolve();
        }, 50);
    });
}