import { auth, db } from "./firebase.js";

import {
  ref,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const usersList = document.getElementById("usersList");

let currentUid = "";

auth.onAuthStateChanged(user => {

  if(!user){
    location.href = "login.html";
    return;
  }

  currentUid = user.uid;

  loadUsers();
});

function loadUsers(){

  onValue(ref(db, "Users"), snapshot => {

    usersList.innerHTML = "";

    snapshot.forEach(child => {

      if(child.key === currentUid) return;

      const data = child.val();

      const div = document.createElement("div");

      div.style.background = "white";
      div.style.padding = "15px";
      div.style.margin = "10px";
      div.style.borderRadius = "10px";

      div.innerHTML = `
        <h3>${data.username || "User"}</h3>
        <p>${data.online ? "Online" : "Offline"}</p>
      `;

      div.onclick = () => {
        location.href = "chat.html?uid=" + child.key;
      };

      usersList.appendChild(div);
    });

  });
}
