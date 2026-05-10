import { auth, db }
from "./firebase.js";

import { uploadToCloudinary }
from "./upload.js";

import {
  ref,
  push,
  set,
  onValue
}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const APP_ID =
"232ebc3e05c743f782ea4181f0940925";

const client =
AgoraRTC.createClient({
  mode:"rtc",
  codec:"vp8"
});

let localTracks = [];
let remoteUsers = {};
let currentUid = "";
let otherUid = "";
let muted = false;
let speakerEnabled = true;

const chatContainer =
document.getElementById(
  "chatContainer"
);

const params =
new URLSearchParams(
  location.search
);

otherUid =
params.get("uid");

auth.onAuthStateChanged(
user => {

  if(!user){

    location.href =
    "login.html";

    return;

  }

  currentUid =
  user.uid;

  loadMessages();

});

function getRoomId(){

  return [
    currentUid,
    otherUid
  ]
  .sort()
  .join("_");

}

window.sendMessage =
async function(){

  const input =
  document.getElementById(
    "messageInput"
  );

  const message =
  input.value.trim();

  if(!message) return;

  await set(

    push(
      ref(
        db,
        "Chats/" +
        getRoomId()
      )
    ),

    {
      senderUid:currentUid,
      receiverUid:otherUid,
      message:message,
      type:"text",
      timestamp:Date.now()
    }

  );

  input.value = "";

};

function loadMessages(){

  onValue(

    ref(
      db,
      "Chats/" +
      getRoomId()
    ),

    snapshot => {

      chatContainer.innerHTML =
      "";

      snapshot.forEach(
      child => {

        const data =
        child.val();

        const div =
        document.createElement(
          "div"
        );

        div.className =
        "message " +

        (
          data.senderUid ===
          currentUid
          ? "mine"
          : "other"
        );

        if(
          data.type ===
          "image"
        ){

          div.innerHTML = `

            <img
              src="${data.message}"
              style="
              width:200px;
              border-radius:12px;
              ">

          `;

        }

        else if(
          data.type ===
          "audio"
        ){

          div.innerHTML = `

            <audio controls>

              <source
                src="${data.message}">

            </audio>

          `;

        }

        else{

          div.innerText =
          data.message;

        }

        chatContainer
        .appendChild(div);

      });

      chatContainer.scrollTop =
      chatContainer.scrollHeight;

    }

  );

}

document
.getElementById("chatImage")
.addEventListener(
"change",

async e => {

  const file =
  e.target.files[0];

  if(!file) return;

  const imageUrl =
  await uploadToCloudinary(
    file
  );

  await set(

    push(
      ref(
        db,
        "Chats/" +
        getRoomId()
      )
    ),

    {
      senderUid:currentUid,
      receiverUid:otherUid,
      message:imageUrl,
      type:"image",
      timestamp:Date.now()
    }

  );

}

);

let recorder;
let chunks = [];

window.startRecording =
async function(){

  const stream =
  await navigator
  .mediaDevices
  .getUserMedia({
    audio:true
  });

  recorder =
  new MediaRecorder(stream);

  recorder.start();

  chunks = [];

  recorder.ondataavailable =
  e => {

    chunks.push(e.data);

  };

  setTimeout(() => {

    recorder.stop();

  }, 5000);

  recorder.onstop =
  async () => {

    const blob =
    new Blob(
      chunks,
      {
        type:"audio/mp3"
      }
    );

    const file =
    new File(
      [blob],
      "voice.mp3"
    );

    const audioUrl =
    await uploadToCloudinary(
      file
    );

    await set(

      push(
        ref(
          db,
          "Chats/" +
          getRoomId()
        )
      ),

      {
        senderUid:currentUid,
        receiverUid:otherUid,
        message:audioUrl,
        type:"audio",
        timestamp:Date.now()
      }

    );

  };

};

window.startVoiceCall =
async function(){

  document
  .getElementById(
    "callScreen"
  )
  .style.display =
  "flex";

  await client.join(
    APP_ID,
    getRoomId(),
    null,
    currentUid
  );

  localTracks =
  await AgoraRTC
  .createMicrophoneAudioTrack();

  await client.publish([
    localTracks
  ]);

  startRingtone();

};

window.startVideoCall =
async function(){

  document
  .getElementById(
    "callScreen"
  )
  .style.display =
  "flex";

  await client.join(
    APP_ID,
    getRoomId(),
    null,
    currentUid
  );

  localTracks =
  await AgoraRTC
  .createMicrophoneAndCameraTracks();

  localTracks[1]
  .play("local-player");

  await client.publish(
    localTracks
  );

  startRingtone();

};

client.on(
"user-published",

async (
  user,
  mediaType
) => {

  remoteUsers[
    user.uid
  ] = user;

  await client.subscribe(
    user,
    mediaType
  );

  stopRingtone();

  if(
    mediaType ===
    "video"
  ){

    user.videoTrack
    .play(
      "remote-player"
    );

  }

  if(
    mediaType ===
    "audio"
  ){

    user.audioTrack
    .play();

  }

}

);

window.endCall =
async function(){

  stopRingtone();

  if(
    Array.isArray(
      localTracks
    )
  ){

    localTracks
    .forEach(track => {

      if(track){

        track.stop();
        track.close();

      }

    });

  }

  await client.leave();

  document
  .getElementById(
    "callScreen"
  )
  .style.display =
  "none";

};

window.toggleMute =
async function(){

  muted = !muted;

  if(
    Array.isArray(
      localTracks
    )
  ){

    await localTracks[0]
    .setMuted(muted);

  }

};

window.toggleSpeaker =
function(){

  speakerEnabled =
  !speakerEnabled;

  const audios =
  document.querySelectorAll(
    "audio"
  );

  audios.forEach(
  audio => {

    audio.muted =
    !speakerEnabled;

  });

};

window.switchCamera =
async function(){

  const cameras =
  await AgoraRTC
  .getCameras();

  if(
    cameras.length < 2
  ) return;

  await localTracks[1]
  .setDevice(
    cameras[1]
    .deviceId
  );

};

function startRingtone(){

  const ringtone =
  document.getElementById(
    "ringtone"
  );

  ringtone.play();

}

function stopRingtone(){

  const ringtone =
  document.getElementById(
    "ringtone"
  );

  ringtone.pause();

  ringtone.currentTime =
  0;

}
