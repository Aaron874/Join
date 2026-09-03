import { contactsList } from './contacts.js';
import {
    renderContactsListLetterSeperator,
    renderContactsListItems,
} from '../templates/contactsTemplate.js';

let firstLetterList = [];
const contactsListContainer = document.querySelector('.contacts_list_container');

export function resetListAndSingleViewVisibility() {
    const viewContainer = document.querySelector('.contacts_single_view_container');
    const listContainer = document.querySelector('.contacts_list_container');
    viewContainer.classList.remove('visible_flex');
    listContainer.classList.remove('hidden');
}

export function getFirstLetterForSeperator() {
    firstLetterList = [];
    for (let index = 0; index < contactsList.length; index++) {
        if (/^[a-zA-ZäöüÄÖÜß]$/.test(contactsList[index].name[0])) {
            let firstLetter = contactsList[index].name[0].toUpperCase();
            firstLetterList.push(firstLetter);
        }
    }
    sortLetterSeperatorList();
}

function sortLetterSeperatorList() {
    firstLetterList = [...new Set(firstLetterList)];
    firstLetterList.sort((a, b) => a.localeCompare(b, 'de'));
    createContactsListLetterSeperator();
}

function createContactsListLetterSeperator() {
    for (let index = 0; index < firstLetterList.length; index++) {
        contactsListContainer.innerHTML += renderContactsListLetterSeperator(
            firstLetterList[index]
        );
    }
    createContactListItems();
}

function createContactListItems() {
    for (let index = 0; index < contactsList.length; index++) {
        let shortName = contactsList[index].shortName;
        let person = contactsList[index].name;
        let email = contactsList[index].email;
        let firstLetter = contactsList[index].name[0].toUpperCase();
        let color = contactsList[index].color;
        let id = contactsList[index].id;
        pushContactsToList(shortName, person, email, firstLetter, color, id);
    }
}

function pushContactsToList(shortName, person, email, firstLetter, color, id) {
    let targetElement = document.querySelector(`[data-letter="${firstLetter}"]`);
    targetElement.after(renderContactsListItems(shortName, person, email, color, id));
}

export function seperatIdFromContactList() {
    const firstContactListItem = document.querySelector('.contacts_list_items_container');
    if (!firstContactListItem) {
        return null;
    }
    const contactId = firstContactListItem.id.replace('contact_id_', '');
    return contactId;
}

export function removeContactListFromDom() {
    const contactListElements = document.querySelectorAll(
        '.contacts_list_items_container, .contacts_list_letter_seperator'
    );
    contactListElements.forEach((element) => {
        element.remove();
    });
}
