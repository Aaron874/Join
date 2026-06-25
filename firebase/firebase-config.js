import { initializeApp } from
'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

import { getAuth, signInAnonymously, onAuthStateChanged } from
'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';

// import { getFirestore,collection, getDocs } from
// 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

import { getDatabase, ref, set, get } 
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAUkUOHWuTh0X6H96PID37QCQJHEdrHQFQ",
  authDomain: "join-dca51.firebaseapp.com",
  projectId: "join-dca51",
  storageBucket: "join-dca51.firebasestorage.app",
  messagingSenderId: "707693553539",
  appId: "1:707693553539:web:c01dff2bd425a39cb578b6",
  measurementId: "G-5DJKC4GC7C",
  databaseURL: "https://join-dca51-default-rtdb.europe-west1.firebasedatabase.app/"
};

export const app = initializeApp(firebaseConfig);

export const db = getDatabase(app);

export const auth = getAuth(app);

export { onAuthStateChanged };

export { ref, set, get };

export async function loginAsGuest() {
  return signInAnonymously(auth)
};


