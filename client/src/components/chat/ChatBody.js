function ChatBox({ socket, conversationLog, participantName, scrollAnchorRef }) {
  return (
    <>
      <ul className="chat-body" >
        {conversationLog.map((chatEntry, index) => {
          return (
            <li key={chatEntry.id} className="chat-message" >
              <span className="chat-message-username">{chatEntry.username}</span>
              <span className="chat-message-text">{chatEntry.text}</span>
            </li>
          );
        })}
        <div ref={scrollAnchorRef} />
      </ul>
    </>
  );
}

export default ChatBox;