import { waitForAuthenticatedUser } from '../firebase/auth-state.js';
import { getAllContacts } from "../firebase/contacts.service.js";

let selectedContacts = [];
let contactsList = [];

document.addEventListener('click', event => {
    if (!event.target.closest('#contacts-dropdown-wrapper')) {
        dropdownContactsUp();
    }
});

/**
 * Initializes the contacts and loads all contacts after authentication.
 *
 * @returns {Promise<void>}
 */
export async function initContacts() {
    await waitForAuthenticatedUser();
    contactsList = await getAllContacts();
    document.getElementById("symbole_down_dropdown_contacts").style.display = "flex";
}

/**
 * Searches the contact list based on the entered search value.
 *
 * @returns {void}
 */
function searchContacts() {
    const searchedContacts = document.getElementById('dropdown_contacts');
    const input = document.getElementById('assigned-trigger').value.toLowerCase().trim();
    searchedContacts.innerHTML = '';
    if (input.length < 3) {
        searchedContacts.style.display = 'none';
        return;
    }
    const results = contactsList.filter(contact =>
        contact.name.toLowerCase().includes(input)
    );
    renderSearchedContacts(searchedContacts, results);
}

/**
 * Renders the contacts found by the contact search.
 *
 * @param {HTMLElement} searchedContacts - The container for the search results.
 * @param {Array} results - The contacts matching the search input.
 * @returns {void}
 */
function renderSearchedContacts(searchedContacts, results) {
    searchedContacts.style.display = 'flex';
    for (let index = 0; index < results.length; index++) {
        const shortName = contactListInitials(results[index].name);
        const contactName =
            results[index].name[0].toUpperCase() + results[index].name.slice(1);
        searchedContacts.innerHTML +=
            contactsTemplate(contactName, results[index].color, shortName);
    }
}

/**
 * Creates initials from the first two words of a contact name.
 *
 * @param {string} contactName - The full name of the contact.
 * @returns {string} The initials of the contact.
 */
function contactListInitials(contactName) {
    return contactName.trim().split(/\s+/).slice(0, 2)
        .map(word => word[0].toUpperCase()).join('');
}

/**
 * Opens the contacts dropdown and renders all contacts.
 *
 * @returns {void}
 */
function dropdownContactsDown() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = 'none';
    document.getElementById('symbole_up_dropdown_contacts').style.display = 'flex';
    document.getElementById('selected_contacts').textContent = '';
    const dropdown = document.getElementById('dropdown_contacts');
    dropdown.style.display = 'flex';
    renderContacts(dropdown);
}

/**
 * Renders all available contacts inside the contacts dropdown.
 *
 * @param {HTMLElement} dropdown - The contacts dropdown container.
 * @returns {void}
 */
function renderContacts(dropdown) {
    dropdown.innerHTML = '';
    for (let index = 0; index < contactsList.length; index++) {
        const shortName = contactListInitials(contactsList[index].name);
        const person =
            contactsList[index].name[0].toUpperCase() + contactsList[index].name.slice(1);
        const color = contactsList[index].color;
        dropdown.innerHTML += contactsTemplate(person, color, shortName);
    }
}

/**
 * Closes the contacts dropdown and displays the selected contacts.
 *
 * @returns {void}
 */
function dropdownContactsUp() {
    document.getElementById('symbole_down_dropdown_contacts').style.display = 'flex';
    document.getElementById('symbole_up_dropdown_contacts').style.display = '';
    document.getElementById('assigned-trigger').value = '';
    document.getElementById('selected_contacts').textContent = 'Select contacts to assign';
    document.getElementById('dropdown_contacts').style.display = '';
    showSelectedContacts();
}

/**
 * Clears the contact search input and selected contacts text.
 *
 * @returns {void}
 */
function clearInput() {
    document.getElementById('assigned-trigger').value = '';
    document.getElementById('selected_contacts').textContent = '';
}

/**
 * Creates the HTML template for a contact in the contacts dropdown.
 *
 * @param {string} contactName - The name of the contact.
 * @param {string} color - The color assigned to the contact.
 * @param {string} shortName - The initials of the contact.
 * @returns {string} The HTML template for the contact.
 */
function contactsTemplate(contactName, color, shortName) {
    const checked = selectedContacts.some(
        contact => contact.name.trim() === contactName.trim()
    );
    return `
        <div class="contacts_div">
            <div class="contacts_dropdown_initials-plus-name_style">
                <div class="contacts_list_name_symbol" style="--contact-color: ${color};">${shortName}</div>
                <span>${contactName}</span>
            </div>
            <input class="contacts_input" type="checkbox" ${checked ? 'checked' : ''}
                onchange="toggleContact('${contactName}', '${shortName}', '${color}')"/>
        </div>`;
}

/**
 * Adds or removes a contact from the selected contacts.
 *
 * @param {string} contactName - The name of the contact.
 * @param {string} shortName - The initials of the contact.
 * @param {string} color - The color assigned to the contact.
 * @returns {void}
 */
function toggleContact(contactName, shortName, color) {
    const contactExists = selectedContacts.some(
        contact => contact.name === contactName
    );
    if (contactExists) {
        removeSelectedContact(contactName);
        return;
    }
    selectedContacts.push({
        name: contactName,
        shortName: shortName,
        color: color
    });
    showSelectedContacts();
}

/**
 * Removes a contact from the selected contacts.
 *
 * @param {string} contactName - The name of the contact to remove.
 * @returns {void}
 */
function removeSelectedContact(contactName) {
    selectedContacts = selectedContacts.filter(
        contact => contact.name !== contactName
    );
    showSelectedContacts();
}

/**
 * Displays the initials of all currently selected contacts.
 *
 * @returns {void}
 */
function showSelectedContacts() {
    const contactsDiv = document.getElementById('div_contacts_initials');
    contactsDiv.style.display = 'flex';
    contactsDiv.innerHTML = '';
    for (let index = 0; index < selectedContacts.length; index++) {
        contactsDiv.innerHTML += templateSelectedContacts(
            selectedContacts[index].shortName,
            selectedContacts[index].color
        );
    }
}

/**
 * Creates the HTML template for a selected contact.
 *
 * @param {string} shortName - The initials of the selected contact.
 * @param {string} color - The color assigned to the contact.
 * @returns {string} The HTML template for the selected contact.
 */
function templateSelectedContacts(shortName, color) {
    return `<div>
        <div class="contacts_list_name_symbol" style="--contact-color: ${color};">
            ${shortName}
        </div>
    </div>`;
}

/**
 * Returns the selected contacts in the format used for task assignment.
 *
 * @returns {Array} The contacts assigned to the task.
 */
export function getAssignedContacts() {
    return selectedContacts.map(contact => ({
        name: contact.name,
        shortName: contact.shortName,
        color: contact.color
    }));
}

/**
 * Returns all currently selected contacts.
 *
 * @returns {Array} The currently selected contacts.
 */
export function getSelectedContacts() {
    return selectedContacts;
}

/**
 * Resets the selected contacts and the contacts interface.
 *
 * @returns {void}
 */
export function resetContacts() {
    selectedContacts = [];
    document.getElementById("assigned-trigger").value = "";
    document.getElementById("selected_contacts").textContent = "Select contacts to assign";
    document.getElementById("div_contacts_initials").innerHTML = "";
    dropdownContactsUp();
}

/**
 * Sets the selected contacts and updates their display.
 *
 * @param {Array} contacts - The contacts that should be selected.
 * @returns {void}
 */
function setSelectedContacts(contacts) {
    selectedContacts = Array.isArray(contacts)
        ? contacts.map(contact => ({ ...contact }))
        : [];
    showSelectedContacts();
}

window.searchContacts = searchContacts;
window.clearInput = clearInput;
window.dropdownContactsDown = dropdownContactsDown;
window.dropdownContactsUp = dropdownContactsUp;
window.toggleContact = toggleContact;
window.showSelectedContacts = showSelectedContacts;
window.setSelectedContacts = setSelectedContacts;