const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat');

let chan = [];
let muted = [];
let username = "test";
let channel = "General";
let act_div;
let act_but;

const socket = io();
chan.push("General");

socket.on("connect", () => {
  username = socket.id;
});

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  // outputUsers(users);
});

socket.on('msgToClient', (username, message, div_name) => {
  if (muted.indexOf(username) == -1)
    outputMessage(username, message, div_name);

  chatMessages.scrollTop = chatMessages.scrollHeight;
})

const g_div = document.createElement('div');
g_div.id = "General";
g_div.style.height = "100%";
document.querySelector('.chat').appendChild(g_div);

act_div = g_div;

const g_but = document.getElementById('GeneralChannel');
g_but.style.backgroundColor = "#B8B8B8";
act_but = g_but;
g_but.addEventListener('click', (e) => {
    e.preventDefault();

    let my_div = g_div;

    console.log("change chan for", "General");
    channel = "General";
    //add next LATER
    act_div.style.height = "0px";
    act_div.style.display = "none";
    my_div.style.height = "100%";
    my_div.style.display = "";
    act_div = my_div;
    act_but.style.backgroundColor = "#DCDCDC";
    g_but.style.backgroundColor = "#B8B8B8";
    act_but = g_but;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Get message text
    let msg = e.target.elements.msg.value;
  
    msg = msg.trim();
  
    if (!msg) {
      return false;
    }

    //upgrade parser
    if (msg.substring(0, 6) == "/mute ") {
      if (muted.indexOf(msg.substring(6)) == -1)
        muted.push(msg.substring(6));
    }
    else if (msg.substring(0, 8) == "/unmute ") {
      let index;
      index = muted.indexOf(msg.substring(8));
      if (index != -1)
        muted.splice(index, 1);
    }
    else if (msg.substring(0, 6) == "/join ") {
      if (chan.indexOf(msg.substring(6)) == -1)
        joinChannel(msg.substring(6));
    }
    else {
      socket.emit('msgToServer', username, msg, channel);
    }
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

function joinChannel(name) {
  chan.push(name);
  const new_input = document.querySelector('.button').cloneNode();
  new_input.value = name;
  new_input.style.backgroundColor = "#DCDCDC";
  // new_input.style.backgroundImage = "url('css/assets/bonobo.jpg')";
  const div = document.createElement('div');
  div.style.height = 0;
  div.style.display = "none";
  div.id = name;
  document.querySelector('.chat').appendChild(div);
  new_input.addEventListener('click', (e) => {
    e.preventDefault()
    
    let my_div = div;
    console.log("change chan for", name);
    //add next LATER
    channel = name;
    act_div.style.height = "0px";
    act_div.style.display = "none";
    my_div.style.height = "100%";
    my_div.style.display = "";
    act_div = my_div;
    act_but.style.backgroundColor = "#DCDCDC";
    new_input.style.backgroundColor = "#B8B8B8";
    act_but = new_input;
  });
  document.querySelector('.channel').appendChild(new_input);

  socket.emit("joinServer", name);
}

function outputMessage(username ,message, div_name) {
  console.log(username, message, div_name);

  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message;
  div.appendChild(para);
  document.getElementById(div_name).appendChild(div);
}

// function outputUsers(users) {
//   userList.innerHTML = '';
//   users.forEach((user) => {
//     const li = document.createElement('li');
//     li.innerText = user.username;
//     userList.appendChild(li);
//   });
// }