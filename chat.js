import { auth, db } from "./firebase.js";

import {
  ref,
  push,
  set,
  onValue
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const params =
  new URLSearchParams(location.search);

const otherUid =
  params.get("uid");

let currentUid = "";

const chatContainer =
  document.getElementById("chatContainer");

auth.onAuthStateChanged(user => {

  if(!user){
    location.href = "login.html";
    return;
  }

  currentUid = user.uid;

  loadMessages();

});

function getRoomId(){

  return [currentUid, otherUid]
    .sort()
    .join("_");

}

window.sendMessage = async function(){

  const text =
    document.getElementById("messageInput").value;

  if(!text.trim()) return;

  const roomId = getRoomId();

  await set(
    push(ref(db, "Chats/" + roomId)),
    {
      senderUid:currentUid,
      receiverUid:otherUid,
      message:text,
      type:"text",
      timestamp:Date.now()
    }
  );

  document.getElementById("messageInput").value = "";

};

function loadMessages(){

  const roomId = getRoomId();

  onValue(
    ref(db, "Chats/" + roomId),

    snapshot => {

      chatContainer.innerHTML = "";

      snapshot.forEach(child => {

        const data = child.val();

        const div =
          document.createElement("div");

        div.className =
          "message " +
          (data.senderUid === currentUid
            ? "mine"
            : "other");

        div.innerText = data.message;

        chatContainer.appendChild(div);

      });

      chatContainer.scrollTop =
        chatContainer.scrollHeight;

    }

  );

}
