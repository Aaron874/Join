import {
    ref,
    push
}
    from "https://www.gstatic.com/firebasejs/12.0.0/firebase-database.js";

import { db }
    from "./firebase.config.js";

export function createTask(task) {
    return push(
        ref(db, "tasks"),
        task
    );
}