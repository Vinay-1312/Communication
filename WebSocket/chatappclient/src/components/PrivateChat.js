import React, { useState, useEffect } from 'react';
import { HubConnectionBuilder } from '@microsoft/signalr';

function PrivateChat() {
  const [currentUser, setCurrentUser] = useState('');
  const [targetUser, setTargetUser] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [connection, setConnection] = useState(null);

  // This effect triggers when we have a currentUser name to use
  // and tries to establish a SignalR connection.


  const establishConnection = () => {
    if (currentUser) {
        const newConnection = new HubConnectionBuilder()
          // Pass "userName" as a query param so the server can map it to the connection
          .withUrl(`http://localhost:5157/chathub?userName=${currentUser}`)
          .withAutomaticReconnect()
          .build();
  
        setConnection(newConnection);
      }
  }

  // Once we have a connection instance, start it and set up listeners
  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log('Connected to SignalR for private chat!');

          // Listen for "ReceivePrivateMessage" from server
          connection.on('ReceivePrivateMessage', (senderConnectionId, incomingMessage) => {
            // For demo, we use the sender's connection ID as an identifier.
            // You could also store a username or user ID if that was passed instead.
            setMessages((prev) => [
              ...prev,
              { from: senderConnectionId, text: incomingMessage }
            ]);
          });
        })
        .catch((error) => console.error('Connection failed: ', error));
    }
  }, [connection]);

  const sendPrivateMessage = async () => {
    if (connection && targetUser && message) {
      try {
        // Call the hub method "SendPrivateMessage" with the targetUser name & message
        await connection.invoke('SendPrivateMessage', targetUser, currentUser,message);
        setMessage('');
      } catch (error) {
        console.error('Send message error: ', error);
      }
    }
  };

  return (
    <div style={{ margin: '20px' }}>
      <h2>One-to-One Chat Demo</h2>

      {/* If not connected yet, show input for the user to enter their name */}
      {!connection && (
        <div style={{ marginBottom: '10px' }}>
          <input
            type="text"
            placeholder="Enter your username"
            value={currentUser}
            onChange={(e) => setCurrentUser(e.target.value)}
            style={{ marginRight: '10px' }}
          />
          <button onClick={establishConnection} disabled={!currentUser}>Connect</button>
        </div>
      )}

      {/* Once connected, show the chat UI */}
      {connection && (
        <div>
          <div style={{ marginBottom: '10px' }}>
            <input
              type="text"
              placeholder="Target username"
              value={targetUser}
              onChange={(e) => setTargetUser(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <input
              type="text"
              placeholder="Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ marginRight: '10px' }}
            />
            <button onClick={sendPrivateMessage}>Send</button>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '10px' }}>
            <h4>Messages</h4>
            {messages.map((msg, idx) => (
              <p key={idx}>
                <strong>{msg.from}:</strong> {msg.text}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default PrivateChat;
