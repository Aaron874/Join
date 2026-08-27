import { contactsList } from './contacts.js';
import {
    renderContactsListLetterSeperator,
    renderContactsListItems,
} from '../templates/contactsTemplate.js';

let firstLetterList = [];
const contactsListContainer = document.querySelector('.contacts_list_container');

/**
 * Resets the mobile toggle classes on the single view and list containers
 * so both are shown again in their default (desktop) layout.
 *
 * @returns {void}
 *
 * @example
 * resetListAndSingleViewVisibility();
 */
export function resetListAndSingleViewVisibility() {
    const viewContainer = document.querySelector('.contacts_single_view_container');
    const listContainer = document.querySelector('.contacts_list_container');
    viewContainer.classList.remove('visible_flex');
    listContainer.classList.remove('hidden');
}

/**
 * Builds the list of first letters used as section separators for the contact list.
 * Iterates over the global `contactsList`, extracts the first letter of each contact's
 * name (only if it is a valid German alphabet character), uppercases it, and stores it
 * in the global `firstLetterList`. Afterwards triggers sorting of the separator list.
 *
 * @returns {void}
 *
 * @example
 * getFirstLetterForSeperator();
 */
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

/**
 * Removes duplicate letters from the global `firstLetterList` and sorts the remaining
 * letters alphabetically using German locale rules. Afterwards triggers the creation
 * of the letter separators in the contact list UI.
 *
 * @returns {void}
 *
 * @example
 * sortLetterSeperatorList();
 */
function sortLetterSeperatorList() {
    firstLetterList = [...new Set(firstLetterList)];
    firstLetterList.sort((a, b) => a.localeCompare(b, 'de'));
    createContactsListLetterSeperator();
}

/**
 * Renders the letter separator elements into the contact list container based on the
 * global `firstLetterList`. For each letter, appends the corresponding separator markup
 * to `contactsListContainer`. Afterwards triggers the creation of the contact list items.
 *
 * @returns {void}
 *
 * @example
 * createContactsListLetterSeperator();
 */
function createContactsListLetterSeperator() {
    for (let index = 0; index < firstLetterList.length; index++) {
        contactsListContainer.innerHTML += renderContactsListLetterSeperator(
            firstLetterList[index]
        );
    }
    createContactListItems();
}

/**
 * Iterates over the global `contactsList` and extracts the relevant Contact data
 * (short name, full name, email, first letter, color, and id) for each contact.
 * Delegates the actual rendering of each contact list item to `pushContactsToList`.
 *
 * @returns {void}
 *
 * @example
 * createContactListItems();
 */
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

/**
 * Inserts a single rendered contact list item into the DOM, placing it directly after
 * the letter separator element matching the given first letter.
 *
 * @param {string} shortName - The contact's initials/short name used for the avatar.
 * @param {string} person - The full name of the contact.
 * @param {string} email - The contact's email address.
 * @param {string} firstLetter - The first letter of the contact's name, used to locate the corresponding separator element via `data-letter`.
 * @param {string} color - The color used for the contact's avatar/badge.
 * @param {string|number} id - The unique identifier of the contact.
 * @returns {void}
 *
 * @example
 * pushContactsToList('JD', 'John Doe', 'john@example.com', 'J', '#FF5733', contact.id);
 */
function pushContactsToList(shortName, person, email, firstLetter, color, id) {
    let targetElement = document.querySelector(`[data-letter="${firstLetter}"]`);
    targetElement.after(renderContactsListItems(shortName, person, email, color, id));
}

/**
 * Extracts the ID from the first contact list item in the DOM by removing
 * the `'contact_id_'` prefix, or `null` if the list is empty.
 *
 * @returns {string|null} The first contact's ID, or `null` if none exist.
 *
 * @example
 * const firstId = seperatIdFromContactList();
 */
export function seperatIdFromContactList() {
    const firstContactListItem = document.querySelector('.contacts_list_items_container');
    if (!firstContactListItem) {
        return null;
    }
    const contactId = firstContactListItem.id.replace('contact_id_', '');
    return contactId;
}

/**
 * Removes all rendered contact list items and letter separator elements from the DOM,
 * clearing the contact list container for a fresh re-render.
 *
 * @returns {void}
 *
 * @example
 * removeContactListFromDom();
 */
export function removeContactListFromDom() {
    const contactListElements = document.querySelectorAll(
        '.contacts_list_items_container, .contacts_list_letter_seperator'
    );
    contactListElements.forEach((element) => {
        element.remove();
    });
}
