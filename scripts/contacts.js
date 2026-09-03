import {
    getFirstLetterForSeperator,
    seperatIdFromContactList,
    removeContactListFromDom,
} from './contactListBuilder.js';
import { waitForAuthenticatedUser } from '../firebase/auth-state.js';
import { createContact } from '../firebase/contacts.service.js';
import { getContacts, updateContact, getContact } from '../firebase/contacts.service.js';
import { getUserProfile } from '../firebase/user.service.js';
import { renderSingleContactView } from '../templates/contactsTemplate.js';
import {
    closeAddContactDialog,
    errorMessageDialog,
    contactSuccessfullyCreatedDialog,
    contactListInitials,
    eventListenerDeleteContactDialog
} from './contactsAddandEdit.js';
export let contactsList = [];
export const DEFAULT_CONTACT_COLOR = '#D1D1D1';
export const MOBILE_BREAKPOINT = 701;
const contactsSingleViewContainer = document.querySelector('#contacts_single_view_content_id');

window.result = await waitForAuthenticatedUser();

loadContacts();

async function loadContacts() {
    contactsList = await getContacts();
    await ensureSelfContactExists();
    getFirstLetterForSeperator();
}

async function ensureSelfContactExists() {
    const user = window.result;
    if (!user || user.isAnonymous) return;
    try {
        const profile = await getUserProfile();
        const name = profile?.name ?? profile?.username ?? user.displayName ?? '';
        const email = profile?.email ?? user.email ?? '';
        if (!name || !email) return;
        const alreadyExists = contactsList.some((contact) => contact.email === email);
        if (alreadyExists) return;
        await createContact({
            name,
            email,
            phone: '',
            color: DEFAULT_CONTACT_COLOR,
            shortName: contactListInitials(name),
        });
        contactsList = await getContacts();
    } catch (error) {
        console.error('Eigener Kontakt konnte nicht angelegt werden:', error);
    }
}

export function openSingleViewContact(id) {
    contactListMarkedContact(id);
    const contactIndex = searchIndex(id);
    switchListToSingleViewAndBack();
    const contact = contactsList[contactIndex];
    contactsSingleViewContainer.innerHTML = '';
    contactsSingleViewContainer.appendChild(
        renderSingleContactView(
            contact.shortName,
            contact.name,
            contact.email,
            contact.color,
            contact.phone,
            contact.id
        )
    );
}

function contactListMarkedContact(id) {
    const allContacts = document.querySelectorAll('.contacts_list_items_container');
    allContacts.forEach((contact) => contact.classList.remove('selected'));
    const selectedContact = document.getElementById('contact_id_' + id);
    selectedContact.classList.add('selected');
}

export function switchListToSingleViewAndBack() {
    let width = window.innerWidth;
    if (width < MOBILE_BREAKPOINT) {
        const viewContainer = document.querySelector('.contacts_single_view_container');
        const listContainer = document.querySelector('.contacts_list_container');
        viewContainer.classList.toggle('visible_flex');
        listContainer.classList.toggle('hidden');
    }
}

export function searchIndex(contactId) {
    for (let index = 0; index < contactsList.length; index++) {
        if (contactsList[index].id === contactId) {
            return index;
        }
    }
}

export async function updateContactInList(contactId, updatedContact) {
    await updateContact(contactId, updatedContact);
    const contactNumber = searchIndex(contactId);
    let changedContact = await getContact(contactId);
    contactsList[contactNumber] = changedContact;
    changeContactInDom(contactId, changedContact);
    closeAddContactDialog();
    openSingleViewContact(contactId);
}

function changeContactInDom(contactId, changedContact) {
    const button = document.getElementById('contact_id_' + contactId);
    button.querySelector('h4').textContent = changedContact.name;
    button.querySelector('p').textContent = changedContact.email;
    button.querySelector('.contacts_list_name_symbol').textContent = changedContact.shortName;
    button
        .querySelector('.contacts_list_name_symbol')
        .style.setProperty('--contact-color', changedContact.color);
}

export function deleteContactDialog(contactId, person) {
    const deleteDialog = document.getElementById('contact_dialog_delete_id');
    deleteDialog.showModal();
    const userNameSpan = deleteDialog.querySelector('#user_name_id');
    userNameSpan.textContent = '';
    userNameSpan.textContent = person;
    const deleteButton = deleteDialog.querySelector('button:first-of-type');
    const cancelButton = deleteDialog.querySelector('button:last-of-type');
    eventListenerDeleteContactDialog(contactId, deleteButton, cancelButton, deleteDialog);
}

export function removeContactFromDom(contactId) {
    const indexContact = searchIndex(contactId);
    contactsList.splice(indexContact, 1);
    removeContactListFromDom();
    getFirstLetterForSeperator();
    const firstContactListItem = seperatIdFromContactList();
    if (!firstContactListItem) {
        switchListToSingleViewAndBack();
        return;
    }
    openSingleViewContact(firstContactListItem);
}

export async function writeNewContact(contact) {
    try {
        await createContact(contact);
        await getContactsAfterCreation();
        let newContactId = idNewContact();
        removeContactListFromDom();
        getFirstLetterForSeperator();
        closeAddContactDialog();
        contactSuccessfullyCreatedDialog();
        openSingleViewContact(newContactId);
    } catch (error) {
        errorMessageDialog('Error saving new Contact. Please try again.');
    }
}

async function getContactsAfterCreation() {
    try {
        contactsList = await getContacts();
    } catch (error) {
        errorMessageDialog('Error by Loading Contact please try again.');
    }
}

function idNewContact() {
    const newContactId = contactsList[contactsList.length - 1].id;
    return newContactId;
}
