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

async function fetchTasks(path="tasks") {
    try {
        let response = await fetch(BASE_URL + path + ".json");
        if (!response.ok) {
            throw new Error(`HTTP-Fehler! Status: ${response.status}`);
        }
        let taskData = await response.json();
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

// function renderTasks(){
//     const taskContainer = dokument.getElementById('task-Cards');
//     taskContainer.innerText = fetchedTasks
//     .map(getTaskTemplate)
//     .join("")
// }