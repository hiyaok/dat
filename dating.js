const TelegramBot = require('node-telegram-bot-api');

// ========================================
// 🔥 KONFIGURASI BOT
// ========================================
const BOT_TOKEN = '8079421257:AAGmmHUKlqLWXyN-rD1uZxaWW3EXlHokhzY'; // Ganti dengan token bot Anda dari @BotFather
const ADMIN_ID = '6291845861'; // Ganti dengan ID Telegram admin (angka, bukan username)
const CHANNEL_ID = '-1002672270285'; // Ganti dengan ID channel (angka, bukan @username)

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ========================================
// 💾 STORAGE & DATA STRUCTURE
// ========================================
const userSessions = new Map();
const messageIds = new Map(); // Store message IDs for editing

const formSteps = {
    platform: 'platform',
    personalInfo: 'personalInfo',
    height: 'height',
    interests: 'interests', 
    values: 'values',
    lifestyle: 'lifestyle',
    kids: 'kids',
    religion: 'religion',
    community: 'community',
    aboutYou: 'aboutYou',
    completed: 'completed'
};

const platforms = {
    tinder: '🔥 Tinder',
    badoo: '💖 Badoo', 
    bumble: '🐝 Bumble',
    boo: '👻 Boo'
};

const formOptions = {
    gender: ['👨 Pria', '👩 Wanita', '🏳️‍⚧️ Non-binary'],
    showProfile: ['✅ Yes', '❌ No'],
    mode: ['💕 Date', '👫 BFF'],
    meetWith: ['👨 Men', '👩 Women', '👥 Both'],
    purpose: [
        '💑 A long-term relationship',
        '💍 A life partner', 
        '🎉 Fun, casual dates',
        '🔥 Intimacy, without commitment',
        '💒 Marriage',
        '🌈 Ethical non-monogamy'
    ],
    interests: [
        '☕ Coffee', '✍️ Writing', '🎵 Concerts', '🎪 Festivals', '🏳️‍🌈 LGBTQ+ rights', '🧘 Yoga',
        '🎾 Tennis', '🍕 Foodie', '🥗 Vegetarian', '💃 Dancing', '🏛️ Museums & galleries',
        '🎨 Crafts', '🤠 Country', '🐕 Dog', '🌆 Exploring new cities', '🥾 Hiking trips',
        '🏕️ Camping', '⛷️ Skiing', '🍷 Wine', '🌱 Gardening', '🎶 R&B', '👻 Horror', '🧁 Baking',
        '🎭 Art', '♀️ Feminism', '🐱 Cats'
    ],
    values: [
        '🎯 Ambition', '💪 Confidence', '🤔 Curiosity', '🧠 Emotional intelligence',
        '❤️ Empathy', '🤲 Generosity', '🙏 Gratitude', '🙇 Humility', '😂 Humor',
        '💝 Kindness', '👑 Leadership', '🤝 Loyalty', '🔓 Openness', '😊 Optimism',
        '🎮 Playfulness', '😏 Sarcasm', '💅 Sassiness'
    ],
    alcohol: [
        '🍻 Yes, I drink',
        '🍷 I drink sometimes', 
        '🥤 I rarely drink',
        '🚫 No, I don\'t drink',
        '💪 I\'m sober'
    ],
    smoking: [
        '🚬 I smoke sometimes',
        '🚭 No, I don\'t smoke',
        '🔥 Yes, I smoke', 
        '⚠️ I\'m trying to quit'
    ],
    kidsOption: [
        '👶 Have kids',
        '🚫 Don\'t have kids',
        '❌ Don\'t want kids',
        '🤷 Open to kids',
        '💕 Want kids',
        '❓ Not sure'
    ],
    politics: ['🤐 Apolitical', '⚖️ Moderate', '🗳️ Liberal', '🏛️ Conservative'],
    community: [
        '✊🏿 Black Lives Matter', '♿ Disability rights', '🕊️ Anti religious hate',
        '🌍 Environmentalism', '♀️ Feminism', '🌐 Human rights', '🤝 Immigrant rights',
        '🏺 Indigenous rights', '🏳️‍🌈 LGBTQ+ rights', '🧠 Neurodiversity',
        '🩺 Reproductive rights', '🚫 Stop Asian Hate', '🏳️‍⚧️ Trans rights',
        '🤲 Volunteering', '🗳️ Voter rights'
    ]
};

// ========================================
// 🛠️ HELPER FUNCTIONS
// ========================================

// Create inline keyboard
function createInlineKeyboard(options, prefix, columns = 2) {
    const keyboard = [];
    for (let i = 0; i < options.length; i += columns) {
        const row = [];
        for (let j = 0; j < columns && i + j < options.length; j++) {
            const option = options[i + j];
            row.push({
                text: option,
                callback_data: `${prefix}_${i + j}`
            });
        }
        keyboard.push(row);
    }
    return { inline_keyboard: keyboard };
}

// Edit message instead of sending new one
async function editOrSendMessage(chatId, userId, text, keyboard = null) {
    const options = {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    };

    try {
        const messageId = messageIds.get(userId);
        if (messageId) {
            await bot.editMessageText(text, {
                chat_id: chatId,
                message_id: messageId,
                ...options
            });
        } else {
            const sentMessage = await bot.sendMessage(chatId, text, options);
            messageIds.set(userId, sentMessage.message_id);
        }
    } catch (error) {
        // If edit fails, send new message
        const sentMessage = await bot.sendMessage(chatId, text, options);
        messageIds.set(userId, sentMessage.message_id);
    }
}

// Validation functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateDate(date) {
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12][0-9]|3[01])\/(19|20)\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const [month, day, year] = date.split('/').map(Number);
    const dateObj = new Date(year, month - 1, day);
    
    return dateObj.getFullYear() === year && 
           dateObj.getMonth() === month - 1 && 
           dateObj.getDate() === day;
}

function validateHeight(height) {
    const num = parseInt(height);
    return num >= 100 && num <= 250; // Reasonable height range
}

function validateName(name) {
    return name && name.trim().length >= 2 && name.trim().length <= 50;
}

// ========================================
// 🚀 COMMAND HANDLERS
// ========================================

// Handler untuk command /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    
    const welcomeMessage = `
💘 **Hai, selamat datang di Bot Jual Beli Akun Dating!**

Kamu lagi cari akun buat nyari teman, gebetan, atau sekadar seru-seruan? Di sini tempatnya! 😍

Kami punya berbagai akun siap pakai untuk aplikasi populer:
🔥 **Tinder**  
💖 **Badoo**  
🐝 **Bumble**  
👻 **Boo**  

💬 Tinggal pilih, pesan, dan akun langsung kami buatkan dalam **4 hari kerja** dan dikirim!

Ketik /mulai atau klik tombol di bawah ini untuk lihat daftar akun & harga`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '🚀 Mulai Pesan Akun', callback_data: 'mulai' }],
            [{ text: '💬 Hubungi Admin', callback_data: 'contact_admin' }],
            [{ text: '❓ Info & FAQ', callback_data: 'info_faq' }]
        ]
    };

    editOrSendMessage(chatId, userId, welcomeMessage, keyboard);
});

// Handler untuk command /mulai
bot.onText(/\/mulai/, (msg) => {
    showPlatformSelection(msg.chat.id, msg.from.id);
});

// ========================================
// 📱 MAIN FUNCTIONS
// ========================================

function showPlatformSelection(chatId, userId) {
    const message = `
🎯 **Pilih Platform Dating yang Kamu Inginkan:**

Silakan pilih platform yang ingin kamu pesan akunnya:`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '🔥 Tinder', callback_data: 'platform_tinder' }],
            [{ text: '💖 Badoo', callback_data: 'platform_badoo' }],
            [{ text: '🐝 Bumble', callback_data: 'platform_bumble' }],
            [{ text: '👻 Boo', callback_data: 'platform_boo' }],
            [{ text: '🏠 Menu Utama', callback_data: 'main_menu' }]
        ]
    };

    editOrSendMessage(chatId, userId, message, keyboard);
}

function showMainMenu(chatId, userId) {
    const message = `
🏠 **Menu Utama**

Selamat datang di Bot Jual Beli Akun Dating!
Pilih menu di bawah ini:`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '🚀 Mulai Pesan Akun', callback_data: 'mulai' }],
            [{ text: '💬 Hubungi Admin', callback_data: 'contact_admin' }],
            [{ text: '❓ Info & FAQ', callback_data: 'info_faq' }]
        ]
    };

    editOrSendMessage(chatId, userId, message, keyboard);
}

function contactAdmin(chatId, userId) {
    const message = `
💬 **Hubungi Admin**

Silakan klik tombol di bawah untuk chat langsung dengan admin kami:

📞 **Kontak tersedia:**
• Telegram: Chat langsung
• WhatsApp: +62 812-3456-7890
• Email: admin@datingbot.com

⏰ **Jam operasional:**
Senin - Minggu: 08:00 - 22:00 WIB`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '👨‍💼 Chat Admin', url: `tg://user?id=${ADMIN_ID}` }],
            [{ text: '📞 WhatsApp', url: 'https://wa.me/6281234567890' }],
            [{ text: '🔙 Kembali', callback_data: 'main_menu' }]
        ]
    };

    editOrSendMessage(chatId, userId, message, keyboard);
}

function showInfoFAQ(chatId, userId) {
    const message = `
❓ **INFO & FAQ**

**🔥 Layanan Kami:**
• Pembuatan akun dating profesional
• Support 24/7
• Garansi akun aktif
• Pengerjaan 4 hari kerja

**💰 Harga:**
• Tinder: Rp 150.000
• Badoo: Rp 125.000  
• Bumble: Rp 175.000
• Boo: Rp 100.000

**❓ FAQ:**
• **Q: Berapa lama proses pembuatan?**
  A: 4 hari kerja setelah pembayaran

• **Q: Apakah ada garansi?**
  A: Ya, garansi 30 hari akun aktif

• **Q: Bagaimana cara pembayaran?**
  A: Transfer bank, OVO, DANA, atau GoPay`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '🚀 Pesan Sekarang', callback_data: 'mulai' }],
            [{ text: '💬 Chat Admin', callback_data: 'contact_admin' }],
            [{ text: '🔙 Menu Utama', callback_data: 'main_menu' }]
        ]
    };

    editOrSendMessage(chatId, userId, message, keyboard);
}

// ========================================
// 📋 FORM HANDLERS
// ========================================

function handlePlatformSelection(chatId, userId, data) {
    const platform = data.split('_')[1];
    
    // Initialize user session
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            step: formSteps.platform,
            data: {},
            selectedInterests: [],
            selectedValues: [],
            selectedCommunity: [],
            waitingFor: null
        });
    }
    
    const session = userSessions.get(userId);
    session.data.platform = platforms[platform];
    session.step = formSteps.personalInfo;

    const message = `
✅ **Platform dipilih: ${platforms[platform]}**

📝 **Personal Info - Step 1/8**

Mari kita mulai dengan informasi dasar kamu:

**Silakan pilih gender kamu:**`;

    const keyboard = createInlineKeyboard(formOptions.gender, 'personal_gender', 1);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'mulai' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function handlePersonalInfo(chatId, userId, data) {
    const session = userSessions.get(userId);
    const [, field, index] = data.split('_');
    
    if (field === 'gender') {
        session.data.gender = formOptions.gender[parseInt(index)];
        askForName(chatId, userId);
    } else if (field === 'show') {
        session.data.showProfile = formOptions.showProfile[parseInt(index)];
        askForMode(chatId, userId);
    } else if (field === 'mode') {
        session.data.mode = formOptions.mode[parseInt(index)];
        askForMeetWith(chatId, userId);
    } else if (field === 'meet') {
        session.data.meetWith = formOptions.meetWith[parseInt(index)];
        askForPurpose(chatId, userId);
    } else if (field === 'purpose') {
        session.data.purpose = formOptions.purpose[parseInt(index)];
        askForHeight(chatId, userId);
    }
}

function askForName(chatId, userId) {
    const message = `
👤 **Nama Depan**

Ketik nama depan yang ingin digunakan untuk akun dating:

⚠️ **Aturan nama:**
• Minimal 2 karakter
• Maksimal 50 karakter
• Hanya huruf dan spasi`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔙 Kembali', callback_data: 'mulai' }],
            [{ text: '🏠 Menu Utama', callback_data: 'main_menu' }]
        ]
    };
    
    editOrSendMessage(chatId, userId, message, keyboard);
    
    const session = userSessions.get(userId);
    session.waitingFor = 'name';
}

function askForBirthDate(chatId, userId) {
    const message = `
📅 **Tanggal Lahir**

Ketik tanggal lahir dalam format: **MM/DD/YYYY**

📝 **Contoh yang benar:**
• 05/15/1995
• 12/01/1990
• 03/25/2000

⚠️ **Format harus tepat: MM/DD/YYYY**`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔙 Kembali', callback_data: 'mulai' }],
            [{ text: '🏠 Menu Utama', callback_data: 'main_menu' }]
        ]
    };
    
    editOrSendMessage(chatId, userId, message, keyboard);
    
    const session = userSessions.get(userId);
    session.waitingFor = 'birthdate';
}

function askForEmail(chatId, userId) {
    const message = `
📧 **Email**

Ketik alamat email yang valid:

📝 **Contoh yang benar:**
• user@gmail.com
• nama@yahoo.com
• test@outlook.com

⚠️ **Email harus mengandung @ dan domain yang valid**`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔙 Kembali', callback_data: 'mulai' }],
            [{ text: '🏠 Menu Utama', callback_data: 'main_menu' }]
        ]
    };
    
    editOrSendMessage(chatId, userId, message, keyboard);
    
    const session = userSessions.get(userId);
    session.waitingFor = 'email';
}

function askForShowProfile(chatId, userId) {
    const message = `
👁️ **Tampilkan di Profil**

Apakah ingin menampilkan informasi ini di profil?`;

    const keyboard = createInlineKeyboard(formOptions.showProfile, 'personal_show', 2);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'mulai' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function askForMode(chatId, userId) {
    const message = `
🎯 **Mode Penggunaan**

Pilih mode penggunaan aplikasi:`;

    const keyboard = createInlineKeyboard(formOptions.mode, 'personal_mode', 2);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'mulai' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function askForMeetWith(chatId, userId) {
    const message = `
👥 **Ingin Bertemu dengan**

Kamu ingin bertemu dengan:`;

    const keyboard = createInlineKeyboard(formOptions.meetWith, 'personal_meet', 1);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'mulai' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function askForPurpose(chatId, userId) {
    const message = `
💕 **Tujuan**

Kamu berharap menemukan:`;

    const keyboard = createInlineKeyboard(formOptions.purpose, 'personal_purpose', 1);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'mulai' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function askForHeight(chatId, userId) {
    const message = `
📏 **Tinggi Badan - Step 2/8**

Ketik tinggi badan dalam cm:

📝 **Contoh yang benar:**
• 170
• 165
• 180

⚠️ **Range: 100-250 cm**`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔙 Kembali', callback_data: 'mulai' }],
            [{ text: '🏠 Menu Utama', callback_data: 'main_menu' }]
        ]
    };
    
    editOrSendMessage(chatId, userId, message, keyboard);
    
    const session = userSessions.get(userId);
    session.waitingFor = 'height';
    session.step = formSteps.height;
}

// Handle interests
function showInterests(chatId, userId) {
    const session = userSessions.get(userId);
    const selectedCount = session.selectedInterests.length;
    
    const message = `
🎯 **Hal yang Kamu Suka - Step 3/8**

Pilih **5 hal** yang kamu suka **(${selectedCount}/5):**

${selectedCount > 0 ? '\n**✅ Sudah dipilih:**\n' + session.selectedInterests.map(item => `• ${item}`).join('\n') + '\n' : ''}

💡 **Tip:** Klik lagi untuk menghapus pilihan`;

    const keyboard = createInlineKeyboard(formOptions.interests, 'interests', 2);
    
    // Navigation buttons
    const navButtons = [];
    if (selectedCount === 5) {
        navButtons.push({ text: '✅ Lanjut ke Step 4', callback_data: 'finish_interests' });
    }
    navButtons.push({ text: `📊 ${selectedCount}/5`, callback_data: 'show_count' });
    
    keyboard.inline_keyboard.push(navButtons);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'mulai' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function handleInterests(chatId, userId, data) {
    const session = userSessions.get(userId);
    const index = parseInt(data.split('_')[1]);
    const interest = formOptions.interests[index];
    
    if (!session.selectedInterests.includes(interest)) {
        if (session.selectedInterests.length < 5) {
            session.selectedInterests.push(interest);
        }
    } else {
        // Remove if already selected
        session.selectedInterests = session.selectedInterests.filter(item => item !== interest);
    }
    
    // Refresh the interests menu
    showInterests(chatId, userId);
}

function finishInterests(chatId, userId) {
    const session = userSessions.get(userId);
    if (session.selectedInterests.length === 5) {
        session.step = formSteps.values;
        showValues(chatId, userId);
    } else {
        const message = `❌ **Pilih tepat 5 hal!** (Sekarang: ${session.selectedInterests.length}/5)`;
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    }
}

// Handle values (similar pattern)
function showValues(chatId, userId) {
    const session = userSessions.get(userId);
    const selectedCount = session.selectedValues.length;
    
    const message = `
💖 **Nilai yang Kamu Hargai - Step 4/8**

Pilih **3 nilai** yang kamu hargai dalam seseorang **(${selectedCount}/3):**

${selectedCount > 0 ? '\n**✅ Sudah dipilih:**\n' + session.selectedValues.map(item => `• ${item}`).join('\n') + '\n' : ''}

💡 **Tip:** Klik lagi untuk menghapus pilihan`;

    const keyboard = createInlineKeyboard(formOptions.values, 'values', 2);
    
    const navButtons = [];
    if (selectedCount === 3) {
        navButtons.push({ text: '✅ Lanjut ke Step 5', callback_data: 'finish_values' });
    }
    navButtons.push({ text: `📊 ${selectedCount}/3`, callback_data: 'show_count' });
    
    keyboard.inline_keyboard.push(navButtons);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'show_interests' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function handleValues(chatId, userId, data) {
    const session = userSessions.get(userId);
    const index = parseInt(data.split('_')[1]);
    const value = formOptions.values[index];
    
    if (!session.selectedValues.includes(value)) {
        if (session.selectedValues.length < 3) {
            session.selectedValues.push(value);
        }
    } else {
        session.selectedValues = session.selectedValues.filter(item => item !== value);
    }
    
    showValues(chatId, userId);
}

function finishValues(chatId, userId) {
    const session = userSessions.get(userId);
    if (session.selectedValues.length === 3) {
        session.step = formSteps.lifestyle;
        showLifestyle(chatId, userId);
    }
}

function showLifestyle(chatId, userId) {
    const message = `
🍷 **Lifestyle & Kebiasaan - Step 5/8**

Pilih kebiasaan minum alkohol:`;

    const keyboard = createInlineKeyboard(formOptions.alcohol, 'lifestyle_alcohol', 1);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'show_values' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function handleLifestyle(chatId, userId, data) {
    const session = userSessions.get(userId);
    const [, field, index] = data.split('_');
    
    if (field === 'alcohol') {
        session.data.alcohol = formOptions.alcohol[parseInt(index)];
        askForSmoking(chatId, userId);
    } else if (field === 'smoking') {
        session.data.smoking = formOptions.smoking[parseInt(index)];
        session.step = formSteps.kids;
        showKids(chatId, userId);
    }
}

function askForSmoking(chatId, userId) {
    const message = `
🚬 **Kebiasaan Merokok**

Pilih kebiasaan merokok:`;

    const keyboard = createInlineKeyboard(formOptions.smoking, 'lifestyle_smoking', 1);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'show_lifestyle' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function showKids(chatId, userId) {
    const message = `
👶 **Anak & Rencana Keluarga - Step 6/8**

Pilih status tentang anak:`;

    const keyboard = createInlineKeyboard(formOptions.kidsOption, 'kids', 1);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'show_lifestyle' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function handleKids(chatId, userId, data) {
    const session = userSessions.get(userId);
    const index = parseInt(data.split('_')[1]);
    
    session.data.kids = formOptions.kidsOption[index];
    session.step = formSteps.religion;
    askForReligion(chatId, userId);
}

function askForReligion(chatId, userId) {
    const message = `
🛐 **Agama - Step 7/8**

Ketik agama kamu atau ketik "Skip" untuk melewati:

📝 **Contoh:**
• Islam
• Kristen
• Hindu
• Buddha
• Skip (untuk melewati)`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '⏭️ Skip', callback_data: 'skip_religion' }],
            [{ text: '🔙 Kembali', callback_data: 'show_kids' }],
            [{ text: '🏠 Menu Utama', callback_data: 'main_menu' }]
        ]
    };
    
    editOrSendMessage(chatId, userId, message, keyboard);
    
    const session = userSessions.get(userId);
    session.waitingFor = 'religion';
}

function handlePolitics(chatId, userId, data) {
    const session = userSessions.get(userId);
    const index = parseInt(data.split('_')[1]);
    
    session.data.politics = formOptions.politics[index];
    session.step = formSteps.community;
    showCommunity(chatId, userId);
}

function askForPolitics(chatId, userId) {
    const message = `
🗳️ **Politik**

Pilih pandangan politik:`;

    const keyboard = createInlineKeyboard(formOptions.politics, 'politics', 2);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'ask_religion' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function showCommunity(chatId, userId) {
    const session = userSessions.get(userId);
    const selectedCount = session.selectedCommunity.length;
    
    const message = `
✊ **Komunitas & Isu Sosial - Step 8/8**

Pilih **maksimal 3** isu yang kamu dukung **(${selectedCount}/3):**

${selectedCount > 0 ? '\n**✅ Sudah dipilih:**\n' + session.selectedCommunity.map(item => `• ${item}`).join('\n') + '\n' : ''}`;

    const keyboard = createInlineKeyboard(formOptions.community, 'community', 1);
    keyboard.inline_keyboard.push([
        { text: '✅ Selesai Form', callback_data: 'finish_community' }
    ]);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'ask_politics' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function handleCommunity(chatId, userId, data) {
    const session = userSessions.get(userId);
    const index = parseInt(data.split('_')[1]);
    const community = formOptions.community[index];
    
    if (!session.selectedCommunity.includes(community)) {
        if (session.selectedCommunity.length < 3) {
            session.selectedCommunity.push(community);
        }
    } else {
        session.selectedCommunity = session.selectedCommunity.filter(item => item !== community);
    }
    
    showCommunity(chatId, userId);
}

function finishCommunity(chatId, userId) {
    const session = userSessions.get(userId);
    session.step = formSteps.completed;
    completeForm(chatId, userId);
}

// Complete form and send data
function completeForm(chatId, userId) {
    const session = userSessions.get(userId);
    const userData = session.data;
    
    // Create summary message
    const summaryMessage = `
🎉 **FORM SELESAI!**

📋 **RINGKASAN DATA AKUN DATING**

**👤 Platform:** ${userData.platform}
**🏷️ Nama:** ${userData.firstName || 'Belum diisi'}
**📅 Tanggal Lahir:** ${userData.birthDate || 'Belum diisi'}
**⚧️ Gender:** ${userData.gender || 'Belum diisi'}
**📧 Email:** ${userData.email || 'Belum diisi'}
**🎯 Mode:** ${userData.mode || 'Belum diisi'}
**👥 Ingin Bertemu:** ${userData.meetWith || 'Belum diisi'}
**💕 Tujuan:** ${userData.purpose || 'Belum diisi'}
**📏 Tinggi:** ${userData.height || 'Belum diisi'} cm

**🎯 Interests (${session.selectedInterests.length}/5):**
${session.selectedInterests.map(item => `• ${item}`).join('\n')}

**💖 Values (${session.selectedValues.length}/3):**
${session.selectedValues.map(item => `• ${item}`).join('\n')}

**🍷 Lifestyle:**
• Alkohol: ${userData.alcohol || 'Belum diisi'}
• Merokok: ${userData.smoking || 'Belum diisi'}

**👶 Anak:** ${userData.kids || 'Belum diisi'}
**🛐 Agama:** ${userData.religion || 'Belum diisi'}
**🗳️ Politik:** ${userData.politics || 'Belum diisi'}

**✊ Community Issues (${session.selectedCommunity.length}/3):**
${session.selectedCommunity.map(item => `• ${item}`).join('\n')}

---
**📞 Langkah Selanjutnya:**
Silakan hubungi admin untuk proses pembuatan akun!`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '💬 Hubungi Admin', callback_data: 'contact_admin' }],
            [{ text: '🔄 Pesan Lagi', callback_data: 'mulai' }],
            [{ text: '🏠 Menu Utama', callback_data: 'main_menu' }]
        ]
    };

    editOrSendMessage(chatId, userId, summaryMessage, keyboard);

    // Send data to channel and admin
    sendToChannelAndAdmin(userData, session, userId, chatId);
    
    // Clear session
    userSessions.delete(userId);
    messageIds.delete(userId);
}

// Send data to channel and admin
async function sendToChannelAndAdmin(userData, session, userId, chatId) {
    const dataMessage = `
🔔 **NEW ORDER - AKUN DATING**

**👤 Customer Info:**
• User ID: ${userId}
• Chat ID: ${chatId}
• Username: @${userData.username || 'N/A'}

**📋 Order Details:**
• Platform: ${userData.platform}
• Nama: ${userData.firstName || 'N/A'}
• Email: ${userData.email || 'N/A'}
• Gender: ${userData.gender || 'N/A'}
• Tinggi: ${userData.height || 'N/A'} cm
• Tanggal Lahir: ${userData.birthDate || 'N/A'}

**🎯 Preferences:**
• Interests: ${session.selectedInterests.join(', ')}
• Values: ${session.selectedValues.join(', ')}
• Community: ${session.selectedCommunity.join(', ')}

**📞 Next Action:** Contact customer for payment & processing

#NewOrder #DatingBot`;

    // Send to channel (using ID, not username)
    try {
        if (CHANNEL_ID) {
            await bot.sendMessage(CHANNEL_ID, dataMessage, { parse_mode: 'Markdown' });
            console.log('✅ Data sent to channel successfully');
        }
    } catch (error) {
        console.error('❌ Error sending to channel:', error.message);
    }

    // Send to admin
    try {
        if (ADMIN_ID) {
            await bot.sendMessage(ADMIN_ID, dataMessage, { parse_mode: 'Markdown' });
            console.log('✅ Data sent to admin successfully');
        }
    } catch (error) {
        console.error('❌ Error sending to admin:', error.message);
    }
}

// ========================================
// 🔄 CALLBACK QUERY HANDLER
// ========================================

bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;
    const userId = callbackQuery.from.id;

    // Initialize user session if not exists
    if (!userSessions.has(userId)) {
        userSessions.set(userId, {
            step: formSteps.platform,
            data: {},
            selectedInterests: [],
            selectedValues: [],
            selectedCommunity: [],
            waitingFor: null
        });
    }

    // Handle different callback data
    switch(data) {
        case 'mulai':
            showPlatformSelection(chatId, userId);
            break;
        case 'main_menu':
            showMainMenu(chatId, userId);
            break;
        case 'contact_admin':
            contactAdmin(chatId, userId);
            break;
        case 'info_faq':
            showInfoFAQ(chatId, userId);
            break;
        case 'show_interests':
            showInterests(chatId, userId);
            break;
        case 'finish_interests':
            finishInterests(chatId, userId);
            break;
        case 'show_values':
            showValues(chatId, userId);
            break;
        case 'finish_values':
            finishValues(chatId, userId);
            break;
        case 'show_lifestyle':
            showLifestyle(chatId, userId);
            break;
        case 'show_kids':
            showKids(chatId, userId);
            break;
        case 'ask_religion':
            askForReligion(chatId, userId);
            break;
        case 'skip_religion':
            userSessions.get(userId).data.religion = 'Skip';
            askForPolitics(chatId, userId);
            break;
        case 'ask_politics':
            askForPolitics(chatId, userId);
            break;
        case 'show_community':
            showCommunity(chatId, userId);
            break;
        case 'finish_community':
            finishCommunity(chatId, userId);
            break;
        default:
            // Handle prefixed callbacks
            if (data.startsWith('platform_')) {
                handlePlatformSelection(chatId, userId, data);
            } else if (data.startsWith('personal_')) {
                handlePersonalInfo(chatId, userId, data);
            } else if (data.startsWith('interests_')) {
                handleInterests(chatId, userId, data);
            } else if (data.startsWith('values_')) {
                handleValues(chatId, userId, data);
            } else if (data.startsWith('lifestyle_')) {
                handleLifestyle(chatId, userId, data);
            } else if (data.startsWith('kids_')) {
                handleKids(chatId, userId, data);
            } else if (data.startsWith('politics_')) {
                handlePolitics(chatId, userId, data);
            } else if (data.startsWith('community_')) {
                handleCommunity(chatId, userId, data);
            }
            break;
    }

    bot.answerCallbackQuery(callbackQuery.id);
});

// ========================================
// 💬 TEXT MESSAGE HANDLER (WITH VALIDATION)
// ========================================

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    // Skip if it's a command or callback
    if (!text || text.startsWith('/')) return;

    // Check if user has active session
    if (!userSessions.has(userId)) return;

    const session = userSessions.get(userId);

    // Handle different input types with validation
    switch(session.waitingFor) {
        case 'name':
            if (validateName(text)) {
                session.data.firstName = text.trim();
                session.waitingFor = null;
                askForBirthDate(chatId, userId);
            } else {
                bot.sendMessage(chatId, '❌ **Nama tidak valid!** Minimal 2 karakter, maksimal 50 karakter.', {
                    parse_mode: 'Markdown'
                });
            }
            break;
            
        case 'birthdate':
            if (validateDate(text)) {
                session.data.birthDate = text;
                session.waitingFor = null;
                askForEmail(chatId, userId);
            } else {
                bot.sendMessage(chatId, '❌ **Format tanggal salah!** Gunakan format MM/DD/YYYY (contoh: 05/15/1995)', {
                    parse_mode: 'Markdown'
                });
            }
            break;
            
        case 'email':
            if (validateEmail(text)) {
                session.data.email = text.toLowerCase().trim();
                session.waitingFor = null;
                askForShowProfile(chatId, userId);
            } else {
                bot.sendMessage(chatId, '❌ **Email tidak valid!** Pastikan menggunakan format yang benar (contoh: user@gmail.com)', {
                    parse_mode: 'Markdown'
                });
            }
            break;
            
        case 'height':
            if (validateHeight(text)) {
                session.data.height = text;
                session.waitingFor = null;
                session.step = formSteps.interests;
                showInterests(chatId, userId);
            } else {
                bot.sendMessage(chatId, '❌ **Tinggi badan tidak valid!** Masukkan angka antara 100-250 cm', {
                    parse_mode: 'Markdown'
                });
            }
            break;
            
        case 'religion':
            session.data.religion = text.trim();
            session.waitingFor = null;
            askForPolitics(chatId, userId);
            break;
            
        default:
            // No waiting input, ignore
            break;
    }
});

// ========================================
// 🚀 BOT STARTUP
// ========================================

console.log('🤖 Bot Jual Beli Akun Dating sudah aktif!');
console.log('📱 Siap melayani pesanan akun dating...');
console.log('🔧 Fitur:');
console.log('   ✅ Edit message (anti-spam)');
console.log('   ✅ Validasi input lengkap'); 
console.log('   ✅ Navigation buttons bekerja');
console.log('   ✅ Send ke channel via ID');
console.log('   ✅ Inline keyboard responsive');

// Handle polling errors
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
});

// Handle webhook errors  
bot.on('webhook_error', (error) => {
    console.error('❌ Webhook error:', error.message);
});
