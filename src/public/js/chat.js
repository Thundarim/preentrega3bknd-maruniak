document.addEventListener("DOMContentLoaded", () => {
    const socket = io();
    let user;

    fetch('/api/sessions/current')
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch session data');
      }
      return response.json();
    })
    .then(sessionData => {
      user = `${sessionData.user.first_name} ${sessionData.user.last_name}`;
      console.log('Retrieved session data:', sessionData);
      console.log('Logged in user:', user);
    })
    .catch(error => {
      console.error('Error fetching session data:', error);
    });
  
        // Fetch messages from the server when the page loads
        fetch('/api/messages')
        .then(response => {
          if (!response.ok) {
            throw new Error('Failed to fetch messages');
          }
          return response.json();
        })
        .then(messages => {
          // Display fetched messages on the page
          messages.forEach(message => {
            displayMessage(message);
          });
        })
        .catch(error => {
          console.error('Error fetching messages:', error);
        });




    const chatBox = document.getElementById("messageInput");
    chatBox.addEventListener("keyup", (event) => {
        if (event.key === "Enter") {
            if (chatBox.value.trim().length > 0) {
                socket.emit("message", { user: user, message: chatBox.value });
                chatBox.value = "";
            }
        }
    });

   socket.on("message", data => {
        data.forEach(message => {
            displayMessage(message);
        });
    });

    function displayMessage(message) {
        let log = document.getElementById("messagesLogs");
        let messageElement = document.createElement("div");
        messageElement.textContent = `${message.user} dice: ${message.message}`;
        log.appendChild(messageElement);
    }
});
