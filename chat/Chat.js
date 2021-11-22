const chatForm = document.getElementById('chat-form');
const chatText = document.getElementById('chat');


chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
  
    // Get message text
    let msg = e.target.elements.msg.value;
  
    msg = msg.trim();
  
    if (!msg) {
      return false;
    }

    printChat(msg);
    
    // Clear input
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();

});

function printChat(toDraw)
{
    chatText.innerHTML += toDraw;
    chatText.innerHTML += "<br>";
}