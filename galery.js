import { auth, db } from "./firebase.js";
import { uploadToCloudinary } from "./upload.js";

import {
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const gallery = document.getElementById("gallery");

let currentUid = "";

auth.onAuthStateChanged(user => {

  if(!user){
    location.href = "login.html";
    return;
  }

  currentUid = user.uid;

  loadGallery();
});

window.uploadMedia = async function(){

  const file = document.getElementById("fileInput").files[0];

  if(!file) return;

  const url = await uploadToCloudinary(file);

  await set(
    push(ref(db, "Users/" + currentUid + "/Gallery")),
    {
      url
    }
  );
};

function loadGallery(){

  onValue(
    ref(db, "Users/" + currentUid + "/Gallery"),
    snapshot => {

      gallery.innerHTML = "";

      snapshot.forEach(child => {

        const data = child.val();

        const imageUrl = typeof data === "string"
          ? data
          : data.url;

        if(!imageUrl) return;

        const img = document.createElement("img");

        img.src = imageUrl;
        img.className = "media";

        gallery.appendChild(img);
      });

    }
  );
}
