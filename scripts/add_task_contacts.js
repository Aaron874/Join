let contactsList = [];
let selectedContacts = [];

export function initContactDropdown() {
    const input = document.getElementById("assigned-trigger");
    input.addEventListener("input", searchContacts);
}

export function setContacts(contacts) {
    contactsList = contacts;
}

export function searchContacts() {
    const input = document.getElementById("assigned-trigger").value;
    const searchTerm = input.toLowerCase().trim();
    const dropdown = document.getElementById("dropdown_contacts");
    dropdown.innerHTML = "";
    if (searchTerm.length < 3) return hideDropdown(dropdown);
    const results = filterContacts(searchTerm);
    showDropdown(dropdown);
    renderContacts(results);
}

function filterContacts(searchTerm) {
    return contactsList.filter(contact =>
        contact.name.toLowerCase().includes(searchTerm)
    );
}

export function dropdownContactsDown() {
    setContactDropdownState(true);
    renderContacts(contactsList);
}

export function dropdownContactsUp() {
    setContactDropdownState(false);
    showSelectedContacts();
}

function setContactDropdownState(open) {
    setArrowVisibility(open);
    const dropdown = document.getElementById("dropdown_contacts");
    dropdown.style.display = open ? "flex" : "";
    updateContactPlaceholder(open);
}

function setArrowVisibility(open) {
    const down = document.getElementById("symbole_down_dropdown_contacts");
    const up = document.getElementById("symbole_up_dropdown_contacts");
    down.style.display = open ? "none" : "flex";
    up.style.display = open ? "flex" : "";
}

function updateContactPlaceholder(open) {
    const input = document.getElementById("assigned-trigger");
    const placeholder = document.getElementById("selected_contacts");
    if (!open) input.value = "";
    placeholder.textContent = open ? "" : "Select contacts to assign";
}

export function clearInput() {
    document.getElementById("assigned-trigger").value = "";
    document.getElementById("selected_contacts").textContent = "";
}

function renderContacts(contacts) {
    const dropdown = document.getElementById("dropdown_contacts");
    dropdown.innerHTML = contacts.map(contactTemplate).join("");
    bindContactCheckboxes(dropdown);
}

function contactTemplate(contact) {
    const name = capitalizeName(contact.name);
    const shortName = contactListInitials(contact.name);
    const checked = isContactSelected(name) ? "checked" : "";
    return `<div class="contacts_div">
        ${contactInfoTemplate(name, contact.color, shortName)}
        ${contactCheckboxTemplate(name, contact.color, shortName, checked)}
    </div>`;
}

function contactInfoTemplate(name, color, shortName) {
    return `<div class="contacts_dropdown_initials-plus-name_style">
        <div class="contacts_list_name_symbol" style="--contact-color:${color};">
            ${shortName}
        </div>
        <span>${name}</span>
    </div>`;
}

function contactCheckboxTemplate(name, color, shortName, checked) {
    return `<input class="contacts_input" type="checkbox" data-contact
        data-name="${name}" data-short-name="${shortName}"
        data-color="${color}" ${checked}>`;
}

function bindContactCheckboxes(dropdown) {
    dropdown.querySelectorAll("[data-contact]").forEach(checkbox => {
        checkbox.addEventListener("change", () => toggleFromDataset(checkbox));
    });
}

function toggleFromDataset(checkbox) {
    toggleContact(
        checkbox.dataset.name,
        checkbox.dataset.shortName,
        checkbox.dataset.color
    );
}

function isContactSelected(name) {
    return selectedContacts.some(contact => contact.name.trim() === name.trim());
}

export function toggleContact(contactName, shortName, color) {
    if (isContactSelected(contactName)) {
        removeSelectedContact(contactName);
    } else {
        selectedContacts.push({ name: contactName, shortName, color });
    }
    showSelectedContacts();
}

function removeSelectedContact(contactName) {
    selectedContacts = selectedContacts.filter(
        contact => contact.name !== contactName
    );
}

export function showSelectedContacts() {
    const container = document.getElementById("div_contacts_initials");
    container.style.display = "flex";
    container.innerHTML = selectedContacts.map(selectedContactTemplate).join("");
}

function selectedContactTemplate(contact) {
    return `<div>
        <div class="contacts_list_name_symbol"
            style="--contact-color:${contact.color};">
            ${contact.shortName}
        </div>
    </div>`;
}

function contactListInitials(contactName) {
    return contactName.trim().split(/\s+/).slice(0, 2)
        .map(word => word[0].toUpperCase()).join("");
}

function capitalizeName(name) {
    return name[0].toUpperCase() + name.slice(1);
}

function hideDropdown(dropdown) {
    dropdown.style.display = "none";
}

function showDropdown(dropdown) {
    dropdown.style.display = "flex";
}

export function getSelectedContacts() {
    return [...selectedContacts];
}

export function resetContacts() {
    selectedContacts = [];
    clearContactFields();
    dropdownContactsUp();
    showSelectedContacts();
}

function clearContactFields() {
    document.getElementById("assigned-trigger").value = "";
    document.getElementById("selected_contacts").textContent =
        "Select contacts to assign";
}

window.setSelectedContacts = function (contacts) {
    selectedContacts = contacts;
    showSelectedContacts();
};
