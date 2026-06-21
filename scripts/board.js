window.addEventListener('DOMContentLoaded', init);

// const BASE_URL = 'https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/';

let fetchedTasks

function init() {
    fetchTasks();
}

function openDialog(id) {
    document.getElementById(id).showModal();
}

function closeDialog(id) {
    document.getElementById(id).close();
}

async function fetchTasks() {
    let response;
    let taskData;
    try {
        response = await fetch(BASE_URL + ".json");
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        taskData = await response.json();
        fetchedTasks = taskData
        console.log(fetchedTasks);
    } catch (error) {
        console.error('Fehler beim Abrufen', error.message);
    } finally {
        if (!fetchedTasks || !fetchedTasks.length) {
            return
        }

    }
}