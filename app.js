import { auth, db } from "./firebase.js";

import {
  ref,
  update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

auth.onAuthStateChanged(user => {

  if(user){

    const userRef = ref(db, "Users/" + user.uid);

    update(userRef, {
      online:true
    });

    window.addEventListener("beforeunload", async () => {

      await update(userRef, {
        online:false
      });

    });
  }

});
