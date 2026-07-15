import { guestLogin } from '../firebase/auth.js';
import { getContacts } from '../firebase/contacts.service.js';

window.contactsList = [];

window.loadBoardContacts = async function () {
    await guestLogin();
    window.contactsList = await getContacts();
    return window.contactsList;
};

window.contactListInitials = function (contactName){
    return contactName
    .split(' ')
    .splice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('')
}