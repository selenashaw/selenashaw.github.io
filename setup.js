// vaildInputs returns true if there is a username and a room in the form, in which
// case the form will advance to the videocall page, otherwise it returns false
// and the empty field is highlighted
let validInputs = function() {
  let user = document.getElementById("username");
  let room = document.getElementById("room");

  if(user.value != "") {
    user.className = "";
    if(room.value != "") {
      room.className = "";
      // storing the user and room names for later use
      window.localStorage.setItem("userName", user.value);
      window.localStorage.setItem("roomName", room.value);
      return true;
    }
    else {
      room.className = "badInput";
      return false;
    }
  }
  else {
    user.className = "badInput";
    return false;
  }
};

// returns the name of the user
let getName = function() {
  return window.localStorage.getItem("userName");
}

// returns the name of the room
let getRoom = function() {
  return window.localStorage.getItem("roomName");
}
