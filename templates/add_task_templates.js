/**
 * Create the HTML markup for a single contact item in the contacts dropdown.
 *
 * @param {string} contactName - The full name of the contact.
 * @param {string} color - The contact color used for the initials badge.
 * @param {string} shortName - The initials or short label shown in the badge.
 * @param {Array<{name: string}>} selectedContacts - Currently selected contacts.
 * @returns {string} HTML string for the contact checkbox entry.
 */
export function contactsTemplate(
    contactName,
    color,
    shortName,
    selectedContacts
) {
    const checked = selectedContacts.some(
        contact => contact.name.trim() === contactName.trim()
    );
    return `
        <div class="contacts_div">
            <div class="contacts_dropdown_initials-plus-name_style">
                <div class="contacts_list_name_symbol" style="--contact-color: ${color};" >${shortName}</div>
                <span>${contactName}</span>
            </div>
            <input class="contacts_input" type="checkbox" ${checked ? 'checked' : ''} onchange="toggleContact('${contactName}', '${shortName}', '${color}')"/>
        </div>`;
}

/**
 * Create the HTML markup for a selected contact initials badge.
 *
 * @param {string} shortName - The initials or short label shown in the badge.
 * @param {string} color - The contact color used for the badge background.
 * @returns {string} HTML string for the selected contact badge.
 */
export function templateSelectedContacts(shortName, color) {
    return `<div>
        <div class="contacts_list_name_symbol"
            style="--contact-color: ${color};">
            ${shortName}
        </div>
    </div>`;
}