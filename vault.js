import { auth, db }
from "./firebase.js";

import { uploadToCloudinary }
from "./upload.js";

import {
  ref,
  push,
  set,
  get,
  onValue,
  remove
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

let currentUid = "";

const vaultGallery =
  document.getElementById("vaultGallery");

auth.onAuthStateChanged(user => {

  if(!user){

    location.href = "login.html";
    return;

  }

  currentUid = user.uid;

});

window.unlockVault =
async function(){

  const enteredPassword =
    document
    .getElementById("vaultPassword")
    .value
    .trim();

  if(!enteredPassword){

    alert("Enter Password");
    return;

  }

  try{

    const snapshot =
      await get(
        ref(
          db,
          "Users/" + currentUid
        )
      );

    const data =
      snapshot.val();

    // CHANGE THIS IF NEEDED
    const savedPassword =
      data.vaultPassword ||
      data.vaultLock ||
      data.password;

    if(!savedPassword){

      alert("Vault Lock Not Set");
      return;

    }

    if(
      enteredPassword ===
      savedPassword
    ){

      document
      .querySelector(".vaultLock")
      .style.display = "none";

      document
      .getElementById("vaultSection")
      .style.display = "block";

      loadVault();

    }else{

      alert("Wrong Password");

    }

  }catch(e){

    console.log(e);

    alert("Vault Error");

  }

};

window.uploadVaultMedia =
async function(){

  const file =
    document
    .getElementById("vaultFile")
    .files[0];

  if(!file) return;

  const url =
    await uploadToCloudinary(file);

  await set(

    push(
      ref(
        db,
        "Users/" +
        currentUid +
        "/Vault"
      )
    ),

    {
      url
    }

  );

};

function loadVault(){

  onValue(

    ref(
      db,
      "Users/" +
      currentUid +
      "/Vault"
    ),

    snapshot => {

      vaultGallery.innerHTML = "";

      snapshot.forEach(child => {

        const data =
          child.val();

        const imageUrl =
          typeof data === "string"
            ? data
            : data.url;

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

          await remove(child.ref);

        };

        vaultGallery
        .appendChild(div);

      });

    }

  );

}
