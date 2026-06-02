window.addEventListener('DOMContentLoaded', init);

const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';


function init() {

}

function openDialog(id){
    document.getElementById(id).showModal();
}

function closeDialog(id){
    document.getElementById(id).close();
}