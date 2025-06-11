import React, { useState, useEffect, useRef } from 'react';
import { FiSend, FiUser, FiMessageCircle, FiTrash } from 'react-icons/fi';
import '../components/style/CustomerService.css';

export default function CustomerService() {
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const selectedChat = chats.find((chat) => chat.id === selectedChatId);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(scrollToBottom, [selectedChat?.messages]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/chat');
        const chatList = await res.json();

        const fullChats = await Promise.all(
          chatList.map(async ({ id }) => {
            const res = await fetch(`http://localhost:5000/api/chat/${id}`);
            return await res.json();
          })
        );

        setChats(fullChats);
      } catch (error) {
        console.error('Failed to load chats:', error);
      }
    };

    loadChats();
  }, []);

  const fetchChat = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/chat/${id}`);
      const updatedChat = await res.json();
      setChats((prevChats) =>
        prevChats.map((chat) => (chat.id === id ? updatedChat : chat))
      );
    } catch (err) {
      console.error('Failed to fetch chat:', err);
    }
  };

  const handleSend = async () => {
    if (inputText.trim() === '') return;

    setLoading(true);

    try {
      if (!selectedChat) {
        const res = await fetch('http://localhost:5000/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: 'Service Agent',
            message: inputText,
          }),
        });

        const newChat = await res.json();

        const userMsg = {
          id: Date.now().toString(),
          from: 'user',
          text: inputText,
        };

        const typingMsg = {
          id: 'typing',
          from: 'agent',
          text: '...',
        };

        const newChatWithMessages = {
          ...newChat,
          messages: [userMsg, typingMsg],
        };

        setChats((prev) => [...prev, newChatWithMessages]);
        setSelectedChatId(newChat.id);

        await fetchChat(newChat.id);
      } else {
        const userMsg = {
          id: Date.now().toString(),
          from: 'user',
          text: inputText,
        };

        const typingMsg = {
          id: 'typing',
          from: 'agent',
          text: '...',
        };

        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.id === selectedChatId
              ? { ...chat, messages: [...chat.messages, userMsg, typingMsg] }
              : chat
          )
        );

        await fetch(`http://localhost:5000/api/chat/${selectedChatId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            from: 'user',
            text: inputText,
          }),
        });

        await fetchChat(selectedChatId);
      }

      setInputText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId) => {
    try {
      await fetch(`http://localhost:5000/api/chat/${chatId}`, {
        method: 'DELETE',
      });

      setChats((prev) => prev.filter((chat) => chat.id !== chatId));

      if (selectedChatId === chatId) {
        setSelectedChatId(null);
      }
    } catch (err) {
      console.error('Gagal menghapus chat:', err);
    }
  };

  return (
    <div className="cs-container">
      <aside className="cs-sidebar">
        <h2>
          <FiMessageCircle size={26} style={{ marginRight: 6 }} />
          Service Agent
        </h2>
        <ul>
          {chats.length === 0 && <li>No chats yet</li>}
          {chats.map((chat) => (
            <li key={chat.id} className={chat.id === selectedChatId ? 'active' : ''}>
              <div
                onClick={() => setSelectedChatId(chat.id)}
                style={{ flexGrow: 1, cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <FiUser style={{ marginRight: 6 }} /> {chat.name}
              </div>
              <FiTrash
                title="Hapus Chat"
                style={{ marginLeft: 8, color: 'red', cursor: 'pointer' }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
                }}
              />
            </li>
          ))}
        </ul>
      </aside>

      <main className="cs-chat-area">
        <header className="cs-chat-header">
          <h3>{selectedChat ? `Chat with ${selectedChat.name}` : 'No chat selected'}</h3>
        </header>

        <section className="cs-messages">
          {selectedChat ? (
            selectedChat.messages.map((msg) => (
              <div
                key={msg.id}
                className={`cs-message ${msg.from === 'agent' ? 'agent' : 'user'} ${msg.id === 'typing' ? 'typing' : ''}`}
              >
                {msg.text}
              </div>
            ))
          ) : (
            <p className="no-chat-text">Select a chat or start a new one by typing below.</p>
          )}
          <div ref={messagesEndRef} />
        </section>

        <footer className="cs-input-area">
          <input
            type="text"
            placeholder="Type your message..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={loading}
          />
          <button onClick={handleSend} disabled={inputText.trim() === '' || loading}>
            <FiSend size={20} />
          </button>
        </footer>
      </main>
    </div>
  );
}
