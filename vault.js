import { auth, db } from "./firebase.js";
import { uploadToCloudinary } from "./upload.js";

import {
  ref,
  push,
  set,
  get,
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

window.unlockVault = async function(){

  const enteredPassword =
    document.getElementById("vaultPassword")
    .value
    .trim();

  if(!enteredPassword){

    alert("Enter Password");
    return;

  }

  try{

    // GET PASSWORD FROM FIREBASE
    const snapshot =
      await get(
        ref(db,
          "Users/" + currentUid)
      );

    if(!snapshot.exists()){

      alert("User Not Found");
      return;

    }

    const data = snapshot.val();

    // YOUR ANDROID APP PASSWORD FIELD
    const savedPassword =
      data.vaultPassword;

    if(!savedPassword){

      alert("No Vault Password Set");
      return;

    }

    if(enteredPassword === savedPassword){

      document.getElementById("vaultSection")
        .style.display = "block";

      document.querySelector(".vaultLock")
        .style.display = "none";

      loadVault();

    }else{

      alert("Wrong Password");

    }

  }catch(e){

    console.log(e);
    alert("Error Unlocking Vault");

  }

};

window.uploadVaultMedia = async function(){

  const file =
    document.getElementById("vaultFile")
    .files[0];

  if(!file) return;

  try{

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

    alert("Uploaded");

  }catch(e){

    console.log(e);
    alert("Upload Failed");

  }

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
