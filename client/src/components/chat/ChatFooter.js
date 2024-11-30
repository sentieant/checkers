import { useState, useRef } from 'react';

function Footer({ socket, participantName }) {
  const [chatEntry, setChatEntry] = useState();
  const messageInputRef = useRef();

  function transmitMessage(e) {
    e.preventDefault();
    if (messageInputRef.current.value === "") return;
    socket.emit('chat_send_message', {
      text: chatEntry,
      username: participantName + ":",
      id: `${socket.id}${Math.random()}`,
      sockedID: socket.id,
    })
    setChatEntry('');
    messageInputRef.current.value = "";
  }

  return (
    <div >
      <form className="chat-footer" onSubmit={transmitMessage}>
        <input
          className="chat-input"
          ref={messageInputRef}
          type="text"
          onChange={(e) => setChatEntry(e.target.value)}
        />
        <button
          className="chat-button"
          onClick={transmitMessage}> Send</button>
      </form>
    </div >
  );
}

export default Footer;