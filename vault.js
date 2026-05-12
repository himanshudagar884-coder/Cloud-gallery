import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getDatabase,
  ref,
  get
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

/* FIREBASE */

const firebaseConfig = {

  apiKey: "AIzaSyCajE_pKaqsxVT9Q6XHHVrEgORVbVvDAt0",

  authDomain:
  "cloudgallery-a45ca.firebaseapp.com",

  databaseURL:
  "https://cloudgallery-a45ca-default-rtdb.firebaseio.com",

  projectId:
  "cloudgallery-a45ca",

  storageBucket:
  "cloudgallery-a45ca.firebasestorage.app",

  messagingSenderId:
  "703978092595",

  appId:
  "1:703978092595:web:f3a43b1131057e6e758b46"

};

const app =
initializeApp(firebaseConfig);

const db =
getDatabase(app);

/* USER */

const currentUser =
JSON.parse(
localStorage.getItem("cloudUser")
);

/* UNLOCK VAULT */

window.unlockVault =
async function(){

  const enteredPassword =
  document
  .getElementById("vaultPassword")
  .value
  .trim();

  if(!currentUser){

    alert("Login first");

    return;

  }

  try{

    const vaultPasswordRef =
    ref(
      db,
      "VaultPasswords/" +
      currentUser.uid
    );

    const snapshot =
    await get(
      vaultPasswordRef
    );

    if(!snapshot.exists()){

      alert(
        "Vault password not set"
      );

      return;

    }

    const realPassword =
    snapshot.val();

    if(
      enteredPassword ===
      realPassword
    ){

      alert(
        "Vault Unlocked"
      );

      loadVault();

    }else{

      alert(
        "Wrong Password"
      );

    }

  }catch(error){

    console.log(error);

    alert("Vault Error");

  }

};

/* LOAD VAULT */

async function loadVault(){

  const gallery =
  document.getElementById(
    "vaultGallery"
  );

  gallery.innerHTML = "";

  try{

    /* POSSIBLE DATABASE PATHS */

    const possiblePaths = [

      "Vault/" +
      currentUser.uid,

      "vault/" +
      currentUser.uid,

      "PrivateVault/" +
      currentUser.uid,

      "Users/" +
      currentUser.uid +
      "/vault"

    ];

    let foundData =
    null;

    for(const path of possiblePaths){

      const snapshot =
      await get(
        ref(db,path)
      );

      if(snapshot.exists()){

        foundData =
        snapshot.val();

        break;

      }

    }

    if(!foundData){

      gallery.innerHTML = `

        <p style="
        padding:20px;
        text-align:center;
        color:#666;
        ">

          No Vault Media

        </p>

      `;

      return;

    }

    Object.keys(foundData)
    .reverse()
    .forEach(key=>{

      const item =
      foundData[key];

      const imageUrl =

        item.url ||

        item.imageUrl ||

        item.downloadUrl ||

        item.mediaUrl ||

        item.image ||

        item.photo;

      if(!imageUrl)
        return;

      const wrapper =
      document.createElement(
        "div"
      );

      wrapper.style.position =
      "relative";

      const img =
      document.createElement(
        "img"
      );

      img.src =
      imageUrl;

      img.className =
      "media";

      wrapper.appendChild(
        img
      );

      gallery.appendChild(
        wrapper
      );

    });

  }catch(error){

    console.log(error);

    alert(
      "Error loading vault"
    );

  }

}
