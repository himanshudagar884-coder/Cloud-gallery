import { auth, db } from "./firebase.js";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

import {
  ref,
  set
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

window.signup = async function(){

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  const result = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await set(ref(db, "Users/" + result.user.uid), {
    username,
    email,
    online:true
  });

  location.href = "gallery.html";
};

window.login = async function(){

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  location.href = "gallery.html";
};
