window.contactList = [];

async function loadBoardContacts(){
    const { getContacts } = await import(
        '../firebase/contacts.service.js'
    );
    window.contactList = await getContacts();
    return window.contactList;
}

function contactListInitials(contactName){
    return contactName
    .split(' ')
    .splice(0, 2)
    .map(word => word[0]?.toUpperCase())
    .join('');
}