import { auth, db }
from "./firebase.js";

import { uploadToCloudinary }
from "./upload.js";

import {
  ref,
  push,
  set,
  onValue,
  remove
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let currentUid = "";

const gallery =
  document.getElementById("gallery");

auth.onAuthStateChanged(user => {

  if(!user){

    location.href = "login.html";
    return;

  }

  currentUid = user.uid;

  loadGallery();

});

window.uploadMedia =
async function(){

  const file =
    document
    .getElementById("fileInput")
    .files[0];

  if(!file){

    alert("Select File");
    return;

  }

  try{

    const url =
      await uploadToCloudinary(file);

    await set(

      push(
        ref(
          db,
          "Users/" +
          currentUid +
          "/Gallery"
        )
      ),

      {
        url
      }

    );

    alert("Uploaded");

  }catch(e){

    console.log(e);

    alert("Upload Failed");

  }

};

function loadGallery(){

  onValue(

    ref(
      db,
      "Users/" +
      currentUid +
      "/Gallery"
    ),

    snapshot => {

      gallery.innerHTML = "";

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

        div.style.position =
          "relative";

        div.innerHTML = `

          <img
            src="${imageUrl}"
            class="media">

          <button
            class="deleteBtn">
            🗑
          </button>

        `;

        div
        .querySelector(".deleteBtn")
        .onclick =
        async () => {

          try{

            // MOVE TO BIN
            await set(

              push(
                ref(
                  db,
                  "Users/" +
                  currentUid +
                  "/Bin"
                )
              ),

              data

            );

            // DELETE FROM GALLERY
            await remove(child.ref);

          }catch(e){

            console.log(e);

            alert("Delete Failed");

          }

        };

        gallery.appendChild(div);

      });

    }

  );

}
