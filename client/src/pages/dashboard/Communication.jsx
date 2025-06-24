import React from 'react';
import "../../styles/Dashboard/Communication.css"

// Icons for better UI (You can use a library like react-icons)
const PinIcon = () => '📌';
const PollIcon = () => '📊';
const MediaIcon = () => '🖼️';
const MembersIcon = () => '👥';
const SendIcon = () => '➤';
const PaperclipIcon = () => '📎';

// Dummy Data wahi use kar lete hain, bas presentation badal denge
const hubData = {
    // ... (same dummy data as before) ...
    currentUser: 'u1',
    users: { 'u1': { name: 'You', avatar: 'https://i.pravatar.cc/150?u=u1' }, 'u2': { name: 'Priya', avatar: 'https://i.pravatar.cc/150?u=u2' }, 'u3': { name: 'Rohan', avatar: 'https://i.pravatar.cc/150?u=u3' }, 'u4': { name: 'Dad', avatar: 'https://i.pravatar.cc/150?u=u4' }, },
    chats: [ { id: 'c1', type: 'group', name: '🏡 Family Hangout', lastMessage: 'Rohan: Sounds good!', timestamp: '10:45 AM', unread: 2, avatar: 'https://cdn-icons-png.flaticon.com/512/2991/2991195.png' }, { id: 'c2', type: 'private', name: 'Priya', lastMessage: 'Okay, I will check.', timestamp: '9:30 AM', unread: 0, avatar: 'https://i.pravatar.cc/150?u=u2' }, { id: 'c3', type: 'private', name: 'Dad', lastMessage: 'Don\'t forget the bill.', timestamp: 'Yesterday', unread: 1, avatar: 'https://i.pravatar.cc/150?u=u4' } ],
    messages: { 'c1': [ { id: 'm1', userId: 'u4', text: 'Hey everyone, what\'s the plan for dinner tonight?', timestamp: '10:40 AM', reactions: { '👍': 1 } }, { id: 'm2', userId: 'u2', text: 'How about we order Pizza? 🍕', replyTo: 'm1', timestamp: '10:42 AM', reactions: { '❤️': 2 } }, { id: 'm3', userId: 'u3', text: '@Priya Sounds good!', timestamp: '10:45 AM', reactions: {} } ], 'c2': [{ id: 'm4', userId: 'u2', text: 'Okay, I will check.', timestamp: '9:30 AM', reactions: {} }], 'c3': [{ id: 'm5', userId: 'u4', text: 'Don\'t forget the bill.', timestamp: 'Yesterday', reactions: {} }] },
    activePoll: { question: 'Next holiday destination?', options: [{ text: 'Goa', votes: 2 }, { text: 'Manali', votes: 1 }], totalVotes: 3 },
    pinnedNotes: [ {id: 'p1', text: 'WiFi Password: OurFamilyRocks!'}, {id: 'p2', text: 'Emergency Contact: 99XXXXXX00'} ],
    recentMedia: [ 'https://images.unsplash.com/photo-1588315029705-be1451db68d8?w=100', 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=100', 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=100', 'https://images.unsplash.com/photo-1484723050470-7bf3384e54e2?w=100' ]
};

const CommunicationHub = () => {
  const [activeChatId, setActiveChatId] = React.useState('c1');
  const activeChat = hubData.chats.find(c => c.id === activeChatId);

  return (
    <div className="hub-container">
      <div className="hub-header">
        <h1>Family Communication Hub</h1>
        <button className="btn btn-primary">New Message</button>
      </div>

      <div className="hub-main-grid">
        {/* ----------- Left Side: The Chat Interface ----------- */}
        <div className="chat-section">
          {/* List of chats */}
          <div className="chat-selector-card">
            {hubData.chats.map(chat => (
              <div key={chat.id} className={`chat-selector-item ${chat.id === activeChatId ? 'active' : ''}`} onClick={() => setActiveChatId(chat.id)}>
                <img src={chat.avatar} alt={chat.name} className="avatar" />
                <div className="chat-selector-info">
                  <p className="chat-name">{chat.name}</p>
                  <p className="last-message">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && <span className="unread-dot"></span>}
              </div>
            ))}
          </div>

          {/* Active chat window */}
          <div className="active-chat-card">
            <div className="active-chat-header">
              <h3>{activeChat.name}</h3>
              <div className="header-actions">
                <span>🔔</span>
                <div className="child-mode-indicator">🛡️ Child Mode: ON</div>
              </div>
            </div>
            <div className="messages-display">
              {/* Messages will be mapped here */}
              {hubData.messages[activeChatId].map(msg => {
                const sender = hubData.users[msg.userId];
                const isSentByMe = msg.userId === hubData.currentUser;
                return (
                  <div key={msg.id} className={`message-wrapper ${isSentByMe ? 'sent' : 'received'}`}>
                    {!isSentByMe && <img src={sender.avatar} alt={sender.name} className="avatar-small" />}
                    <div className="message-content">
                      {!isSentByMe && <p className="sender-name">{sender.name}</p>}
                      <p className="message-text">{msg.text}</p>
                      <div className="message-meta">
                        <span className="timestamp">{msg.timestamp}</span>
                        {Object.keys(msg.reactions).length > 0 && <span className="reactions">❤️👍</span>}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="message-input-box">
              <button className="icon-btn"><PaperclipIcon /></button>
              <input type="text" placeholder="Type a message..." />
              <button className="send-btn"><SendIcon /></button>
            </div>
          </div>
        </div>

        {/* ----------- Right Side: The Info & Widgets Panel ----------- */}
        <div className="info-section">
          <div className="info-card">
            <h4 className="card-title"><PollIcon /> Active Poll</h4>
            <p className="poll-question">{hubData.activePoll.question}</p>
            <div className="poll-options">
              {hubData.activePoll.options.map(opt => (
                <div key={opt.text} className="poll-result">
                  <span>{opt.text}</span>
                  <strong>{Math.round((opt.votes / hubData.activePoll.totalVotes) * 100)}%</strong>
                </div>
              ))}
            </div>
            <button className="btn btn-secondary full-width">Vote Now</button>
          </div>

          <div className="info-card">
            <h4 className="card-title"><PinIcon /> Pinned Notes</h4>
            <ul className="pinned-list">
              {hubData.pinnedNotes.map(note => <li key={note.id}>{note.text}</li>)}
            </ul>
          </div>
          
          <div className="info-card">
            <h4 className="card-title"><MediaIcon /> Recent Media</h4>
            <div className="media-grid">
              {hubData.recentMedia.map((src, i) => <img key={i} src={src} alt="media"/>)}
            </div>
             <a href="#" className="view-all-link">View All</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunicationHub;