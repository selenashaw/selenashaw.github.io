let handlefail = function(err){
  console.log(err);
}

function addVideoStream(streamId, username){
  let remoteContainer = document.getElementById("remoteStream");
  let streamDiv = document.createElement("div");
  streamDiv.id = streamId;
  streamDiv.style.transform = "rotateY(180deg)";
  // this adds to the style in the remoteStream div
  streamDiv.style.height = "20vh";
  streamDiv.style.width = "20vw";
  streamDiv.style.border = "1px solid #099dfd";
  streamDiv.style.borderRadius = "3px";
  streamDiv.style.marginTop = "10px";
  streamDiv.style.marginRight = "10px";
  streamDiv.style.textAlign = "left";
  streamDiv.style.justifySelf = "center";
  streamDiv.style.display = "inline-block";
  remoteContainer.appendChild(streamDiv);

  let participants = document.getElementById("participants");
  let userSpan = document.createElement("span");
  userSpan.textContent = username;
  let newline = document.createElement("br");
  participants.appendChild(newline);
  participants.appendChild(userSpan);
}

document.getElementById("joinButton").onclick = function() {
  let channelName = document.getElementById("channel").value;
  let Username = document.getElementById("username").value;
  let appId = "985eb96782c245ffb5dcea8564a3a687";

  let client = AgoraRTC.createClient({
    mode: "live",
    codec: "h264"
  })

  client.init(appId, ()=> console.log("AgoraRTC Client Connected"),handlefail)

  client.join(
    null,
    channelName,
    Username,
    () =>{
      var localStream = AgoraRTC.createStream({
        video: true,
        audio: true,
      })

      localStream.init(function() {
        localStream.play("myStream");

        // add name to participants list
        let participants = document.getElementById("participants");
        let userSpan = document.createElement("span");
        userSpan.textContent= Username;
        participants.appendChild(userSpan);

        console.log("App id: ${appId}\nChannel id: ${channelName}");
        client.publish(localStream);
      })
    }
  )

  client.on("stream-added", function(evt){
    client.subscribe(evt.stream,handlefail);
  })

  client.on("stream-subscribed", function(evt){
    console.log("Subscribed Stream");
    let stream = evt.stream;
    addVideoStream(stream.getId(),stream.params.streamID);
    stream.play(stream.getId());
  })

}
