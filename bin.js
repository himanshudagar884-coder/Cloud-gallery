import { auth, db }
from "./firebase.js";

import {
  ref,
  onValue
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const binGallery =
  document.getElementById("binGallery");

auth.onAuthStateChanged(user => {

  if(!user){

    location.href = "login.html";
    return;

  }

  loadBin(user.uid);

});

function loadBin(uid){

  onValue(

    ref(db,
      "Users/" + uid + "/Bin"),

    snapshot => {

      binGallery.innerHTML = "";

      snapshot.forEach(child => {

        const data =
          child.val();

        const imageUrl =
          typeof data === "string"
            ? data
            : data.url;

        if(!imageUrl) return;

        const div =
          document.createElement("div");

        div.innerHTML = `

          <img
            src="${imageUrl}"
            class="media">

        `;

        binGallery.appendChild(div);

      });

    }

  );

}
