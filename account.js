import { auth, db } from "./firebase.js";
import { uploadToCloudinary } from "./upload.js";

import {
  ref,
  get,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

import {
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

let currentUid = "";

auth.onAuthStateChanged(async user => {

  if(!user){
    location.href = "login.html";
    return;
  }

  currentUid = user.uid;

  const snapshot = await get(ref(db, "Users/" + currentUid));

  const data = snapshot.val();

  document.getElementById("username").innerText = data.username || "User";
  document.getElementById("email").innerText = data.email || "";
});

window.logout = async function(){

  await signOut(auth);

  location.href = "login.html";
};
