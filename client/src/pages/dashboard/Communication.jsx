import React from 'react';
import "../../styles/Dashboard/Communication.css"

// Dummy Data - Asli app mein ye API se aayega
const familyData = {
  currentUser: 'u1',
  users: {
    'u1': { name: 'You', avatar: 'https://i.pravatar.cc/150?u=u1' },
    'u2': { name: 'Priya', avatar: 'https://i.pravatar.cc/150?u=u2' },
    'u3': { name: 'Rohan', avatar: 'https://i.pravatar.cc/150?u=u3' },
    'u4': { name: 'Dad', avatar: 'https://i.pravatar.cc/150?u=u4' },
  },
  chats: [
    { id: 'c1', type: 'group', name: '🏡 Family Group', avatar: 'https://static.vecteezy.com/system/resources/previews/000/628/192/original/vector-house-icon-symbol-sign.jpg', lastMessage: 'Rohan: Sounds good!', timestamp: '10:45 AM', unread: 2 },
    { id: 'c2', type: 'private', name: 'Priya', avatar: 'https://i.pravatar.cc/150?u=u2', lastMessage: 'Okay, I will check.', timestamp: '9:30 AM', unread: 0 },
    { id: 'c3', type: 'private', name: 'Dad', avatar: 'https://i.pravatar.cc/150?u=u4', lastMessage: 'Don\'t forget to pay the bill.', timestamp: 'Yesterday', unread: 1 },
  ],
  messages: {
    'c1': [
      { id: 'm1', userId: 'u4', text: 'Hey everyone, what\'s the plan for dinner tonight?', timestamp: '10:40 AM', reactions: { '👍': 1 } },
      { id: 'm2', userId: 'u2', text: 'How about we order Pizza? 🍕', replyTo: 'm1', timestamp: '10:42 AM', reactions: { '❤️': 2 } },
      { id: 'm3', userId: 'u3', text: '@Priya Sounds good!', timestamp: '10:45 AM', reactions: {} },
      { id: 'poll1', type: 'poll', question: 'What to cook for dinner?', options: [{ text: 'Pizza', votes: 2 }, { text: 'Pasta', votes: 1 }, { text: 'Indian', votes: 1 }], totalVotes: 4 }
    ],
    'c2': [{ id: 'm4', userId: 'u2', text: 'Okay, I will check.', timestamp: '9:30 AM', reactions: {} }],
    'c3': [{ id: 'm5', userId: 'u4', text: 'Don\'t forget to pay the bill.', timestamp: 'Yesterday', reactions: {} }],
  },
  activeChatDetails: {
    id: 'c1',
    pinned: [ {id: 'p1', text: 'WiFi Password: OurFamilyRocks!'}, {id: 'p2', text: 'Emergency Contact: 99XXXXXX00'} ],
    media: [ 'https://images.unsplash.com/photo-1588315029705-be1451db68d8?w=100', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100' ],
    members: ['u1', 'u2', 'u3', 'u4']
  }
};


const Communication = () => {
  const [activeChatId, setActiveChatId] = React.useState('c1');
  const activeChat = familyData.chats.find(c => c.id === activeChatId);
  
  return (
    <div className="communication-container">

      {/* -------------------- Left Panel: Chat List -------------------- */}
      <div className="chat-list-panel">
        <div className="panel-header">
          <h2>Communication</h2>
          <button className="new-chat-btn">+</button>
        </div>
        <div className="search-bar">
          <input type="text" placeholder="Search or start a new chat" />
        </div>
        <div className="chat-list">
          {familyData.chats.map(chat => (
            <div key={chat.id} className={`chat-list-item ${chat.id === activeChatId ? 'active' : ''}`} onClick={() => setActiveChatId(chat.id)}>
              <img src={chat.avatar} alt={chat.name} className="avatar" />
              <div className="chat-info">
                <p className="chat-name">{chat.name}</p>
                <p className="last-message">{chat.lastMessage}</p>
              </div>
              <div className="chat-meta">
                <p className="timestamp">{chat.timestamp}</p>
                {chat.unread > 0 && <span className="unread-count">{chat.unread}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* -------------------- Center Panel: Chat Window -------------------- */}
      <div className="chat-window-panel">
        <div className="panel-header chat-header">
          <img src={activeChat.avatar} alt={activeChat.name} className="avatar" />
          <div className="chat-info">
            <p className="chat-name">{activeChat.name}</p>
            <p className="chat-status">Priya, Rohan, Dad are online</p>
          </div>
          <div className="chat-actions">
            <span>📞</span> <span>📹</span> <span>⚙️</span>
          </div>
        </div>
        
        <div className="message-area">
          {familyData.messages[activeChatId].map(msg => {
            if (msg.type === 'poll') {
              return (
                <div key={msg.id} className="message-bubble poll-bubble">
                  <p className="poll-question">{msg.question}</p>
                  {msg.options.map(opt => (
                    <div key={opt.text} className="poll-option">
                      <div className="poll-label">{opt.text} ({Math.round((opt.votes/msg.totalVotes)*100)}%)</div>
                      <div className="poll-bar-bg"><div className="poll-bar-fg" style={{width: `${(opt.votes/msg.totalVotes)*100}%`}}></div></div>
                    </div>
                  ))}
                </div>
              )
            }
            const sender = familyData.users[msg.userId];
            const isSentByMe = msg.userId === familyData.currentUser;
            return (
              <div key={msg.id} className={`message-wrapper ${isSentByMe ? 'sent' : 'received'}`}>
                {!isSentByMe && <img src={sender.avatar} alt={sender.name} className="avatar" />}
                <div className="message-bubble">
                  {!isSentByMe && <p className="sender-name">{sender.name}</p>}
                  {msg.replyTo && <div className="reply-preview">Replying to "Hey everyone..."</div>}
                  <p className="message-text">{msg.text}</p>
                  <div className="reactions">
                    {Object.entries(msg.reactions).map(([emoji, count]) => <span key={emoji}>{emoji} {count}</span>)}
                  </div>
                  <p className="timestamp">{msg.timestamp}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="message-input-area">
          <button className="attach-btn">📎</button>
          <input type="text" placeholder={`Message in ${activeChat.name}...`} />
          <button className="emoji-btn">😀</button>
          <button className="send-btn">➤</button>
        </div>
      </div>

      {/* -------------------- Right Panel: Chat Details -------------------- */}
      <div className="chat-details-panel">
        <div className="details-section">
          <h4>📌 Pinned Messages</h4>
          <div className="pinned-list">
            {familyData.activeChatDetails.pinned.map(pin => <div key={pin.id} className="pinned-item">{pin.text}</div>)}
          </div>
        </div>
        <div className="details-section">
          <h4>📊 Create a Poll</h4>
          <div className="create-poll">
            <input type="text" placeholder="Ask a question..." />
            <button>Create</button>
          </div>
        </div>
        <div className="details-section">
          <h4>🖼️ Media Gallery</h4>
          <div className="media-grid">
            {familyData.activeChatDetails.media.map((src, i) => <img key={i} src={src} alt="media" />)}
            <div className="view-all">+9 more</div>
          </div>
        </div>
        <div className="details-section">
          <h4>👥 Members</h4>
          <div className="members-list">
            {familyData.activeChatDetails.members.map(uid => <div key={uid}><img src={familyData.users[uid].avatar} className="avatar-small" /> {familyData.users[uid].name}</div>)}
          </div>
        </div>
        <div className="details-section child-mode">
            <h4>🛡️ Child Mode</h4>
            <p>Safe chat is currently <strong>ON</strong> for Rohan.</p>
            <a href="#">Manage Settings</a>
        </div>
      </div>
    </div>
  );
};

export default Communication;