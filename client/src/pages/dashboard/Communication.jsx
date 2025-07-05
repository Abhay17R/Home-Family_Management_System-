  import React, { useState, useEffect, useCallback, useRef } from 'react';
  import API from '../../api/axios';
  import '../../styles/Dashboard/Communication.css';
  import familyavatar from '../../img/family.png';
  import defaultavatar from '../../img/dp.png';
  import { getSocket } from '../../context/AuthContext'; 
  import { useAuth } from '../../hooks/useAuth';

  const PinIcon = () => '📌';
  const PollIcon = () => '📊';
  const SendIcon = () => '➤';
  const PaperclipIcon = () => '📎';
  const BellIcon = () => '🔔';
  const ShieldIcon = () => '🛡️';
  const CloseIcon = () => '✕';

  const CommunicationHub = () => {
    const { user: currentUser, socketVersion } = useAuth();
    
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState({});
    const [polls, setPolls] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [loading, setLoading] = useState({ initial: true, messages: false });
    const [error, setError] = useState(null);
    const [messageInput, setMessageInput] = useState('');
    const [isCreatingPoll, setIsCreatingPoll] = useState(false);
    const [pollQuestion, setPollQuestion] = useState('');
    const [pollOptions, setPollOptions] = useState(['', '']);
    const [viewVotesPoll, setViewVotesPoll] = useState(null);
    const [pollDetails, setPollDetails] = useState(null);
    const messagesEndRef = useRef(null);

    const activeChat = chats.find(c => c._id === activeChatId);
    const activeMessages = messages[activeChatId] || [];

    useEffect(() => {
      if (currentUser) {
        const fetchInitialData = async () => {
          setLoading({ initial: true, messages: false });
          try {
            const [chatsRes, pollsRes] = await Promise.all([
              API.get('/communication/chats'),
              API.get('/communication/polls'),
            ]);
            setChats(chatsRes.data.chats);
            setPolls(pollsRes.data.polls || []);
            if (chatsRes.data.chats.length > 0) {
              const groupChat = chatsRes.data.chats.find(c => c.isGroupChat);
              setActiveChatId(groupChat ? groupChat._id : chatsRes.data.chats[0]._id);
            }
          } catch (err) {
            setError("Could not load your hub. Please try again.");
          } finally {
            setLoading({ initial: false, messages: false });
          }
        };
        fetchInitialData();
      }
    }, [currentUser]);

    const fetchChatMessages = useCallback(async (chatId) => {
      if (!chatId || String(chatId).startsWith('virtual-')) {
        setMessages(prev => ({ ...prev, [chatId]: [] }));
        return;
      }
      setLoading(prev => ({ ...prev, messages: true }));
      try {
        const res = await API.get(`/communication/messages/${chatId}`);
        setMessages(prev => ({ ...prev, [chatId]: res.data.messages }));
      } catch (err) {
        console.error("Failed to fetch messages for", chatId);
      } finally {
        setLoading(prev => ({ ...prev, messages: false }));
      }
    }, []);

    useEffect(() => {
      if (activeChatId) fetchChatMessages(activeChatId);
    }, [activeChatId, fetchChatMessages]);

    useEffect(() => {
      if (!currentUser || socketVersion === 0) return;

      const socket = getSocket();
      if (!socket) return;

      const handleVirtualChatCreated = ({ virtualId, newChat }) => {
        setChats(prev => prev.map(c => c._id === virtualId ? newChat : c));
        setActiveChatId(newChat._id);
        fetchChatMessages(newChat._id);
      };

      const handleNewMessage = (newMessage) => {
        const chatId = newMessage.chat._id;
        setMessages(prev => ({ ...prev, [chatId]: [...(prev[chatId] || []), newMessage] }));
        setChats(prev => prev.map(c => c._id === chatId ? { 
          ...c, 
          latestMessage: newMessage, 
          updatedAt: newMessage.createdAt 
        } : c).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)));
      };

      const handleNewPoll = (newPoll) => setPolls(prev => [newPoll, ...prev]);
      const handlePollUpdated = (updatedPoll) => {
        setPolls(prevPolls => prevPolls.map(p => p._id === updatedPoll._id ? updatedPoll : p));
      };

      socket.on('virtual_chat_created', handleVirtualChatCreated);
      socket.on('new_message', handleNewMessage);
      socket.on('new_poll', handleNewPoll);
      socket.on('poll_updated', handlePollUpdated);

      return () => {
        if (socket) {
          socket.off('virtual_chat_created', handleVirtualChatCreated);
          socket.off('new_message', handleNewMessage);
          socket.off('new_poll', handleNewPoll);
          socket.off('poll_updated', handlePollUpdated);
        }
      };
    }, [socketVersion, currentUser, fetchChatMessages]);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeMessages]);

    const handleSendMessage = async (e) => {
      e.preventDefault();
      if (!messageInput.trim() || !activeChatId) return;
      const currentActiveChat = chats.find(c => c._id === activeChatId);
      const requestBody = { content: messageInput, chatId: activeChatId };
      if (currentActiveChat?.isVirtual) {
        const recipient = currentActiveChat.users.find(u => u._id !== currentUser?._id);
        if (recipient) requestBody.recipientId = recipient._id;
        else return;
      }
      try {
        await API.post('/communication/messages', requestBody);
        setMessageInput('');
      } catch (err) {
        alert("Failed to send message.");
      }
    };

    const handleCreatePoll = async (e) => {
      e.preventDefault();
      const filteredOptions = pollOptions.filter(opt => opt.trim() !== '');
      if (!pollQuestion.trim() || filteredOptions.length < 2) return alert("Question and at least 2 options required.");
      const pollData = { question: pollQuestion, options: filteredOptions };
      try {
        await API.post('/communication/polls', pollData);
        setIsCreatingPoll(false);
        setPollQuestion('');
        setPollOptions(['', '']);
      } catch (err) {
        alert(err.response?.data?.message || "Failed to create poll.");
      }
    };

    const handleVote = async (pollId, optionId) => {
      try {
        await API.post(`/communication/polls/vote/${pollId}`, { optionId });
      } catch (err) {
        alert(err.response?.data?.message || "Failed to vote.");
      }
    };

    const fetchPollDetails = async (pollId) => {
      try {
        const res = await API.get(`/communication/polls/${pollId}`);
        setPollDetails(res.data.poll);
        setViewVotesPoll(pollId);
      } catch (err) {
        console.error("Error fetching poll details:", err);
        alert(err.response?.data?.message || "Failed to fetch poll details.");
      }
    };

    const closeVotesModal = () => {
      setViewVotesPoll(null);
      setPollDetails(null);
    };

    const handleOptionChange = (index, value) => {
      setPollOptions(p => {
        const n = [...p];
        n[index] = value;
        return n;
      });
    };

    const addPollOption = () => setPollOptions(p => [...p, '']);
    const removePollOption = (index) => {
      if (pollOptions.length > 2) setPollOptions(p => p.filter((_, i) => i !== index));
    };

    const calculatePollStats = (poll) => {
      const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
      return poll.options.map(option => ({
        ...option,
        percentage: totalVotes === 0 ? 0 : Math.round((option.votes.length / totalVotes) * 100)
      }));
    };

    if (loading.initial) return <div className="hub-container loading-container"><h1>Loading Your Hub...</h1></div>;
    if (error) return <div className="hub-container error-container"><h1>{error}</h1></div>;

    return (
      <div className="hub-container">
        <div className="hub-header"><h1>Family Communication Hub</h1></div>
        <div className="hub-main-grid">
          <div className="chat-section">
            <div className="chat-selector-card">
              {chats.map(chat => {
                const otherUser = chat.isGroupChat ? null : chat.users.find(u => u._id !== currentUser?._id);
                const chatName = chat.isGroupChat ? chat.chatName : otherUser?.name || 'User';
                const chatAvatar = chat.isGroupChat ? familyavatar : (otherUser?.avatar?.url || defaultavatar);
                const lastMessageText = chat.latestMessage ? 
                  `${chat.latestMessage.sender.name}: ${chat.latestMessage.content.substring(0, 20)}${chat.latestMessage.content.length > 20 ? '...' : ''}` : 
                  (chat.isVirtual ? `Start a conversation` : 'No messages yet');
                
                return (
                  <div key={chat._id} className={`chat-selector-item ${chat._id === activeChatId ? 'active' : ''}`} onClick={() => setActiveChatId(chat._id)}>
                    <img src={chatAvatar} alt={chatName} className="avatar" />
                    <div className="chat-selector-info">
                      <p className="chat-name">{chatName}</p>
                      <p className="last-message">{lastMessageText}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="active-chat-card">
              {activeChat ? (
                <>
                  <div className="active-chat-header">
                    <h3>{activeChat.isGroupChat ? activeChat.chatName : activeChat.users.find(u => u._id !== currentUser._id)?.name}</h3>
                    <div className="header-actions"><span><BellIcon /></span><div className="child-mode-indicator"><ShieldIcon /> RealTime</div></div>
                  </div>
                  <div className="messages-display">
                    {loading.messages ? <div className="loading-container"><h4>Loading Messages...</h4></div> : activeMessages.map(msg => {
                      const isSentByMe = msg.sender._id === currentUser?._id;
                      return (
                        <div key={msg._id} className={`message-wrapper ${isSentByMe ? 'sent' : 'received'}`}>
                          <div className="message-content">
                            {!isSentByMe && <p className="sender-name">{msg.sender.name}</p>}
                            <p className="message-text">{msg.content}</p>
                            <div className="message-meta">
                              <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                  <form className="message-input-box" onSubmit={handleSendMessage}>
                    <button type="button" className="icon-btn"><PaperclipIcon /></button>
                    <input type="text" placeholder="Type a message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
                    <button type="submit" className="send-btn"><SendIcon /></button>
                  </form>
                </>
              ) : (<div className="no-chat-selected"><h2>Select a chat to start messaging</h2></div>)}
            </div>
          </div>

          <div className="info-section">
            <div className="info-card">
              <h4 className="card-title"><PollIcon /> Family Polls</h4>
              {polls.length > 0 ? (
                polls.map(poll => {
                  const optionsWithStats = calculatePollStats(poll);
                  const totalVotes = poll.options.reduce((sum, option) => sum + option.votes.length, 0);
                  const hasVoted = poll.options.some(option => 
                    option.votes.some(vote => 
                      vote._id === currentUser?._id || 
                      (typeof vote === 'string' && vote === currentUser?._id)
                    )
                  );
                  
                  return (
                    <div key={poll._id} className="poll-widget">
                      <div className="poll-header">
                        <h3 className="poll-question">{poll.question}</h3>
                        <span className="total-votes">{totalVotes} votes</span>
                      </div>
                      
                      <div className="poll-options">
                        {optionsWithStats.map(option => {
                          const userVotedThisOption = option.votes.some(vote => 
                            vote._id === currentUser?._id || 
                            (typeof vote === 'string' && vote === currentUser?._id)
                          );
                          
                          return (
                            <div 
                              key={option._id} 
                              className={`poll-option ${userVotedThisOption ? 'user-vote' : ''}`}
                              onClick={() => handleVote(poll._id, option._id)}
                            >
                              {userVotedThisOption && (
                                <span className="vote-indicator">✓</span>
                              )}
                              <div className="option-text">{option.text}</div>
                              {hasVoted && (
                                <div className="option-stats">
                                  <div className="progress-bar" style={{ width: `${option.percentage}%` }}></div>
                                  <span className="percentage">{option.percentage}%</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="poll-footer">
                        <button 
                          className="view-votes-btn"
                          onClick={() => fetchPollDetails(poll._id)}
                        >
                          View votes
                        </button>
                        <span className="poll-creator">Created by {poll.createdBy.name}</span>
                      </div>
                    </div>
                  );
                })
              ) : (<p>No active polls for the family.</p>)}
              <button className="btn-link" onClick={() => setIsCreatingPoll(true)}>+ Create New Poll</button>
            </div>

            {isCreatingPoll && (
              <div className="info-card poll-creator-card">
                <h4 className="card-title">Create a New Poll</h4>
                <form className="poll-creator-form" onSubmit={handleCreatePoll}>
                  <div className="form-group">
                    <label>Question</label>
                    <input 
                      type="text" 
                      placeholder="e.g., Next holiday spot?" 
                      value={pollQuestion} 
                      onChange={(e) => setPollQuestion(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Options</label>
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="option-input-row">
                        <input
                          type="text"
                          placeholder={`Option ${i + 1}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          onBlur={(e) => handleOptionChange(i, e.target.value.trim())}
                          required
                        />
                        {pollOptions.length > 2 && (
                          <button 
                            type="button" 
                            className="remove-option-btn"
                            onClick={() => removePollOption(i)}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button" 
                    className="add-option-btn"
                    onClick={addPollOption}
                  >
                    + Add Option
                  </button>
                  <div className="form-actions-poll">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => setIsCreatingPoll(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      Launch Poll
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Votes Modal */}
        {viewVotesPoll && pollDetails && (
          <div className="votes-modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>{pollDetails.question}</h3>
                <button className="close-modal" onClick={closeVotesModal}>
                  <CloseIcon />
                </button>
              </div>
              
              <div className="votes-list">
                {pollDetails.options.map(option => (
                  <div key={option._id} className="vote-option">
                    <div className="option-header">
                      <span>{option.text}</span>
                      <span className="vote-count">{option.votes.length} votes</span>
                    </div>
                    
                    <div className="voters-list">
                      {option.votes.length > 0 ? (
                        option.votes.map(voter => (
                          <div key={voter._id} className="voter">
                            <img 
                              src={voter.avatar?.url || defaultavatar} 
                              alt={voter.name} 
                              className="voter-avatar" 
                            />
                            <span className="voter-name">{voter.name}</span>
                          </div>
                        ))
                      ) : (
                        <div className="no-voters">No votes yet</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  export default CommunicationHub;