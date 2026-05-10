import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  getDatabase
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCajE_pKaqsxVT9Q6XHHVrEgORVbVvDAt0",
  authDomain: "cloudgallery-a45ca.firebaseapp.com",
  databaseURL: "https://cloudgallery-a45ca-default-rtdb.firebaseio.com",
  projectId: "cloudgallery-a45ca",
  storageBucket: "cloudgallery-a45ca.firebasestorage.app",
  messagingSenderId: "703978092595",
  appId: "1:703978092595:web:f3a43b1131057e6e758b46",
  measurementId: "G-ZC3JWWZ1G1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getDatabase(app);
