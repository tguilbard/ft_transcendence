const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat');

let chan = [];
let muted = [];
let room = "test";
let username;

const socket = io();
chan.push("general");

socket.on("connect", () => {
  username = socket.id;
});

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  // outputUsers(users);
});

socket.on('msgToClient', (message) => {
  if (muted.indexOf(message.username) == -1)
    outputMessage(message);

  chatMessages.scrollTop = chatMessages.scrollHeight;
})

document.querySelectorAll('.button').forEach(item => {
  item.addEventListener('click', (e) => {
    e.preventDefault();

    console.log("change chan for", item.value);
    //add next LATER
  })
})

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
      socket.emit('msgToServer', msg);
    }
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

function joinChannel(name) {
  chan.push(name);
  const new_input = document.querySelector('.button').cloneNode();
  new_input.value = name;
  new_input.addEventListener('click', (e) => {
    e.preventDefault()
    
    console.log("change chan for", name);
    //add next LATER
  });
  document.querySelector('.channel').appendChild(new_input);

  socket.emit("joinServer", name);
}

function outputMessage(message) {
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
  document.querySelector('.chat').appendChild(div);
}

// function outputUsers(users) {
//   userList.innerHTML = '';
//   users.forEach((user) => {
//     const li = document.createElement('li');
//     li.innerText = user.username;
//     userList.appendChild(li);
//   });
// }