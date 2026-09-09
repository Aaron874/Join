import { contactsList } from './contacts.js';
import {
    renderContactsListLetterSeperator,
    renderContactsListItems,
} from '../templates/contactsTemplate.js';

let firstLetterList = [];
const contactsListContainer = document.querySelector('.contacts_list_container');

/**
 * Resets the mobile list/single-view layout to its default state by showing the contact list
 * container and hiding the single contact view container, regardless of their current state.
 *
 * @returns {void}
 */
export function resetListAndSingleViewVisibility() {
    const viewContainer = document.querySelector('.contacts_single_view_container');
    const listContainer = document.querySelector('.contacts_list_container');
    viewContainer.classList.remove('visible_flex');
    listContainer.classList.remove('hidden');
}

/**
 * Builds the list of first letters used for the alphabetical separators in the contact list,
 * by extracting the (uppercased) first letter of each contact's name, ignoring names that
 * don't start with a valid letter, and then sorting the resulting list.
 *
 * @returns {void}
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
 * Deduplicates and alphabetically sorts firstLetterList (using German locale collation),
 * then triggers rendering of the letter separators in the contact list.
 *
 * @returns {void}
 */
function sortLetterSeperatorList() {
    firstLetterList = [...new Set(firstLetterList)];
    firstLetterList.sort((a, b) => a.localeCompare(b, 'de'));
    createContactsListLetterSeperator();
}

/**
 * Renders the alphabetical letter separators into the contact list container, one per entry
 * in firstLetterList, then triggers rendering of the actual contact list items.
 *
 * @returns {void}
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
 * Iterates over contactsList, extracting each contact's display data and delegating to
 * pushContactsToList to render it into the appropriate letter-grouped section of the contact
 * list.
 *
 * @returns {void}
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
 * Renders a single contact list item and inserts it into the DOM directly after its
 * corresponding alphabetical letter separator, based on the contact's first letter.
 *
 * @param {string} shortName - The contact's initials shown in the avatar.
 * @param {string} person - The contact's full name.
 * @param {string} email - The contact's email.
 * @param {string} firstLetter - The uppercased first letter of the contact's name, used to locate the matching letter separator.
 * @param {string} color - The contact's avatar color.
 * @param {string|number} id - The contact's ID.
 * @returns {void}
 */
function pushContactsToList(shortName, person, email, firstLetter, color, id) {
    let targetElement = document.querySelector(`[data-letter="${firstLetter}"]`);
    targetElement.after(renderContactsListItems(shortName, person, email, color, id));
}

/**
 * Retrieves the ID of the first contact currently rendered in the contact list DOM, by
 * extracting it from the element's ID attribute.
 *
 * @returns {string|null} The ID of the first contact in the list, or null if the list is empty.
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
 * Removes all currently rendered contact list items and letter separators from the DOM,
 * clearing the contact list container in preparation for a fresh render.
 *
 * @returns {void}
 */

export function removeContactListFromDom() {
    const contactListElements = document.querySelectorAll(
        '.contacts_list_items_container, .contacts_list_letter_seperator'
    );
    contactListElements.forEach((element) => {
        element.remove();
    });
}
