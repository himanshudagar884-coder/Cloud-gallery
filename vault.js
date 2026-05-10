import { auth, db } from "./firebase.js";
import { uploadToCloudinary } from "./upload.js";

import {
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

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

window.unlockVault = function(){

  const password =
    document.getElementById("vaultPassword").value;

  if(password === "1234"){

    document.getElementById("vaultSection")
      .style.display = "block";

    loadVault();

  }else{

    alert("Wrong Password");

  }

};

window.uploadVaultMedia = async function(){

  const file =
    document.getElementById("vaultFile").files[0];

  if(!file) return;

  const url =
    await uploadToCloudinary(file);

  await set(
    push(ref(db,
      "Users/" + currentUid + "/Vault")),
    {
      url
    }
  );

};

function loadVault(){

  onValue(
    ref(db,
      "Users/" + currentUid + "/Vault"),

    snapshot => {

      vaultGallery.innerHTML = "";

      snapshot.forEach(child => {

        const data = child.val();

        const imageUrl =
          typeof data === "string"
            ? data
            : data.url;

        if(!imageUrl) return;

        const img =
          document.createElement("img");

        img.src = imageUrl;

        img.className = "media";

        vaultGallery.appendChild(img);

      });

    }

  );

}
