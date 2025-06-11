const fs = require('fs');
const path = require('path');

const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const API_KEY = process.env.OPENROUTER_API_KEY;

function getFormattedInventory() {
  try {
    const filePath = path.join(__dirname, '../data/inventory.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const items = JSON.parse(rawData);

    if (!Array.isArray(items) || items.length === 0) {
      return 'Tidak ada produk yang tersedia saat ini.';
    }

    return items.map((item, index) => {
      return `${index + 1}. ${item.name} - Rp ${item.price.toLocaleString('id-ID')} (${item.description})`;
    }).join('\n');
  } catch (err) {
    console.error('Gagal membaca inventory:', err.message);
    return 'Inventaris tidak tersedia saat ini.';
  }
}

function getFormattedTransactionHistory() {
  try {
    const filePath = path.join(__dirname, '../data/history_transactions.json');
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const transactions = JSON.parse(rawData);

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return 'Belum ada transaksi yang tercatat.';
    }

    return transactions.slice(-10).map((trx, index) => {
      const date = new Date(trx.date).toLocaleDateString('id-ID');
      const typeLabel = {
        Incoming: 'Barang Masuk',
        Outgoing: 'Barang Keluar',
        Adjustment: 'Penyesuaian',
      }[trx.type] || trx.type;

      return `${index + 1}. [${typeLabel}] ${trx.item} (${trx.quantity > 0 ? '+' : ''}${trx.quantity}) pada ${date} — Catatan: ${trx.notes}`;
    }).join('\n');
  } catch (err) {
    console.error('Gagal membaca transaksi:', err.message);
    return 'Riwayat transaksi tidak tersedia.';
  }
}


async function getAIResponse(chatMessages) {
  const inventoryList = getFormattedInventory();
  const transactionHistory = getFormattedTransactionHistory();

  const systemPrompt = {
    role: 'system',
    content: `Anda adalah agen bernama 'Helper-Alex', Layanan Pelanggan yang ramah dan profesional untuk sistem manajemen gudang dan inventaris. Selalu jawab pertanyaan atau keluhan pengguna dengan sopan, informatif, dan membantu, khususnya terkait:
- ketersediaan produk,
- status pengiriman,
- masalah gudang,
- serta kendala teknis pada aplikasi.

Gunakan bahasa Indonesia yang mudah dipahami. Jika pertanyaannya tidak jelas, bantu arahkan pengguna untuk menjelaskan dengan baik.

Berikut adalah daftar produk yang tersedia saat ini:
${inventoryList}

Dan berikut adalah riwayat 10 transaksi terakhir:
${transactionHistory}
`,
  };

  try {
    const messages = [
      systemPrompt,
      ...chatMessages.map((msg) => ({
        role: msg.from === 'user' ? 'user' : 'assistant',
        content: msg.text,
      })),
    ];

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1-0528:free',
        messages,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenRouter error:', errText);
      throw new Error('Failed to fetch AI response');
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || 'Maaf, saya tidak dapat merespons saat ini.';
  } catch (error) {
    console.error('Error in getAIResponse:', error.message);
    throw error;
  }
}

module.exports = { getAIResponse };
