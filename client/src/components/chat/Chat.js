import ChatBox from './ChatBody'
import Footer from './ChatFooter'
import { useEffect, useState, useRef } from 'react';

function Chatting({ socket, participantName }) {
  const [conversationLog, setConversationLog] = useState([{ id: "12345" }]);
  const scrollAnchorRef = useRef(null);

  useEffect(() => {
    socket.on('chat_recieve_message', (data) => {
      setConversationLog([...conversationLog, data]);
      if (conversationLog[conversationLog.length - 1].text === data.text
        && conversationLog[conversationLog.length - 1].username === data.username) {
        setConversationLog(conversationLog.slice(0, conversationLog.length));
      }
    });
  }, [socket, conversationLog])

  useEffect(() => {
    socket.on("recieve_player_color", () => {
      socket.emit('chat_send_message', {
        text: ` joined the table`,
        username: `${participantName}`,
        id: `${socket.id}${Math.random()}`,
        sockedID: socket.id,
        joinMessage: true,
      })
    })
  }, [socket, participantName])

  useEffect(() => {
    scrollAnchorRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversationLog]);

  return (
    <div className="chat">
      <h2 className="chat-title">Table Chat </h2>
      <ChatBox
        scrollAnchorRef={scrollAnchorRef}
        participantName={participantName}
        conversationLog={conversationLog}
        socket={socket} />
      <Footer
        participantName={participantName}
        setConversationLog={setConversationLog}
        socket={socket} />
    </div>
  );
}
export default Chatting;