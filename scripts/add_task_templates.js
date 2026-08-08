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

export function templateSelectedContacts(shortName, color) {
    return `<div>
        <div class="contacts_list_name_symbol"
            style="--contact-color: ${color};">
            ${shortName}
        </div>
    </div>`;
}