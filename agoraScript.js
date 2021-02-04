let appId = "8104cf00c083443fba6e201ea26d19fd";

let globalStream;
let isAudioMuted = false;
let isVideoMuted = false;
let isScreenShare = false;
let isChatOpen = false;
let channel;

let myName = getName();

let rtm = AgoraRTM.createInstance(appId);

let client = AgoraRTC.createClient({
  mode: "live",
  codec: "h264"
});

let handlefail = function(err) {
  console.log(err);
};

let roomnameDiv = document.getElementById("roomText");
let roomSpan = document.createElement("span");
roomSpan.style.fontSize = "1.2rem";
roomSpan.textContent = getRoom();
roomnameDiv.appendChild(roomSpan);

client.init(appId, ()=> console.log("AgoraRTC Client Connected Successfully", handlefail));

let screenClient = AgoraRTC.createClient({
  mode: "live",
  codec: "h264"
});

screenClient.init(appId, ()=> console.log("AgoraRTC Client Connected Successfully", handlefail));

rtm.login({uid:getName()}).then(() => {
  channel = rtm.createChannel(getRoom());
  channel.join();
  console.log("Channel created and joined.");
  channel.on("ChannelMessage", function(message) {
    let chat = document.getElementById("chat");
    let messagespan = document.createElement("span");
    messagespan.textContent = message.text;
    let newline = document.createElement("br");
    chat.append(messagespan);
    chat.append(newline);
    console.log(message);
  });
}).catch(error => {handlefail});


// this function adds a user to the streams div
let addVideoStream = function(streamId, isMyStream){
  let container = document.getElementById("myStream");
  let streamDiv = document.createElement("div");
  streamDiv.id = streamId;
  if (!isMyStream) {
    streamDiv.style.transform = "rotateY(180deg)";
  }
  streamDiv.style.height = "15vw";
  streamDiv.style.width= "20vw";
  streamDiv.style.textAlign="justify";
  streamDiv.style.marginRight = "5px";
  streamDiv.style.display = "inline-block";
  container.appendChild(streamDiv);
};

// this function stops the user's stream and removes it from the page
let removeMyVideoStream = function(){
  globalStream.stop();
  let remDiv = document.getElementById(globalStream.getId());
  remDiv.parentNode.removeChild(remDiv);
};

// this function stops the stream and removes it's div from the page
let removeVideoStream = function(evt){
  let stream = evt.stream;
  stream.stop();
  let remDiv = document.getElementById(stream.getId());
  remDiv.parentNode.removeChild(remDiv);
}


client.join(
  null,
  getRoom(),
  getName(),
  () =>{
    var localStream = AgoraRTC.createStream({
      video: true,
      audio: true,
      screen: false,
      screenAudio: false
    })
    localStream.init(function(evt) {
      addVideoStream(getName(), true);
      localStream.play(getName());
      console.log("App id: ${appId}\nChannel id: ${channelName}");
      client.publish(localStream);
    });
    globalStream = localStream;
  }
);

// the below four functions handle the client events
client.on("stream-added", function(evt){
  client.subscribe(evt.stream,handlefail);
});

client.on("stream-subscribed", function(evt){
  console.log("Subscribed Stream");
  let stream = evt.stream;
  if(stream.getId() === "ScreenShare") {
    stream.play('centerScreen');
  }
  else {
    addVideoStream(stream.getId(), false);
    stream.play(stream.getId());
  }
});

client.on("stream-removed", removeVideoStream);

client.on("peer-leave", function(evt) {
  removeVideoStream(evt);
});

// leaves the call and returns the user to the home page when leave button is pressed
document.getElementById("leave").onclick = function(){
  client.leave(function() {
    console.log("Left the Call");
  }, handlefail);
  removeMyVideoStream();
  channel.leave();
  rtm.logout();
  window.location.href = "index.html";
}

// mutes/unmutes video when the video button is pressed
document.getElementById("video").onclick = function() {
  if(!isVideoMuted) {
    globalStream.muteVideo();
  }
  else {
    globalStream.unmuteVideo();
  }
  isVideoMuted = !isVideoMuted;
};

// mutes/unmutes audio when the audio button is pressed
document.getElementById("audio").onclick = function() {
  if(!isAudioMuted) {
    globalStream.muteAudio();
  }
  else {
    globalStream.unmuteAudio();
  }
  isAudioMuted = !isAudioMuted;
};

// starts screensharing when the screenshare button is pressed
document.getElementById("screenshare").onclick = function() {
  if(!isScreenShare) {
    screenClient.join(
    null,
    getRoom(),
    "ScreenShare",
    () =>{
      var screenshare = AgoraRTC.createStream({
        streamId: "ScreenShare",
        video: false,
        audio: false,
        screen: true,
        screenAudio: true
      })
      screenshare.init(function(evt) {
        addVideoStream("ScreenShare", false);
        console.log("App id: ${appId}\nChannel id: ${channelName}");
        screenClient.publish(screenshare);
      });
    }
  );  
  }
  isScreenShare = !isScreenShare
}

// reveals the chat when the chatButton is pressed
document.getElementById("chatButton").onclick = function() {
  let chatbox = document.getElementById("chat");
  let msginput = document.getElementById("messageInput");
  if(!isChatOpen) {
    chatbox.style.display = "block";
    msginput.style.display = "block";
  } 
  else {
    chatbox.style.display = "none";
    msginput.style.display = "none";
  }
  isChatOpen = !isChatOpen;
}

// sends a message through the chat when the send button is clicked and puts
// the message in the user's chat
document.getElementById("send").onclick = function() {
  let message = document.getElementById("message").value;
  message = myName + ": " + message;
  document.getElementById("message").value ="";
  channel.sendMessage({ text: message }).then(() => {
    let chat = document.getElementById("chat");
    let messagespan = document.createElement("span");
    messagespan.textContent = message;
    let newline = document.createElement("br");
    chat.append(messagespan);
    chat.append(newline);
    console.log("Message sent");
  }).catch(error => {handlefail});
}
