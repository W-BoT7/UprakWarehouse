const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { getAIResponse } = require('../services/aiService');

const CHATS_FILE = path.join(__dirname, '../data/chats.json');

// ⏳ Muat data chat dari file saat server pertama kali start
let chats = [];
try {
  if (fs.existsSync(CHATS_FILE)) {
    chats = JSON.parse(fs.readFileSync(CHATS_FILE, 'utf-8'));
  }
} catch (err) {
  console.error('Failed to load chat history:', err.message);
}

// 💾 Simpan ke file
function saveChats() {
  fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2));
}

// GET list of chats (for sidebar)
router.get('/', (req, res) => {
  res.json(chats.map(({ id, name }) => ({ id, name })));
});

// GET full chat by ID
router.get('/:id', (req, res) => {
  const chat = chats.find((c) => c.id === req.params.id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });
  res.json(chat);
});

// POST new chat (with first user message + AI response)
router.post('/', async (req, res) => {
  const { name, message } = req.body;
  if (!name || !message)
    return res.status(400).json({ error: 'Name and message required' });

  const timestamp = Date.now().toString();

  const userMessage = {
    id: timestamp + '_user',
    from: 'user',
    text: message,
  };

  const newChat = {
    id: timestamp,
    name,
    messages: [userMessage],
  };

  try {
    const aiResponse = await getAIResponse([userMessage]);

    const aiMessage = {
      id: Date.now().toString() + '_agent',
      from: 'agent',
      text: aiResponse,
    };

    newChat.messages.push(aiMessage);
  } catch (err) {
    console.error('Error generating AI response on new chat:', err.message);
  }

  chats.push(newChat);
  saveChats(); // 💾 Simpan setelah menambah chat
  res.status(201).json(newChat);
});

// POST message to existing chat
router.post('/:id/messages', async (req, res) => {
  const chat = chats.find((c) => c.id === req.params.id);
  if (!chat) return res.status(404).json({ error: 'Chat not found' });

  const { from, text } = req.body;
  if (!from || !text)
    return res.status(400).json({ error: 'From and text required' });

  const newMessage = {
    id: Date.now().toString() + '_' + from,
    from,
    text,
  };

  chat.messages.push(newMessage);

  if (from === 'user') {
    try {
      const aiResponse = await getAIResponse(chat.messages);

      const aiMessage = {
        id: Date.now().toString() + '_agent',
        from: 'agent',
        text: aiResponse,
      };

      chat.messages.push(aiMessage);
    } catch (error) {
      console.error('AI reply error:', error.message);
    }
  }

  saveChats(); // 💾 Simpan setelah menambah pesan
  res.status(201).json(newMessage);
});

// ✅ DELETE chat by ID
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const index = chats.findIndex((chat) => chat.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Chat not found' });
  }

  chats.splice(index, 1);
  saveChats(); // 💾 Simpan setelah menghapus
  res.status(204).send(); // Tidak ada konten, sukses
});

module.exports = router;
