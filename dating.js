//
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
    prompts: 'prompts',
    photos: 'photos',
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
    ],
    // PROMPT CATEGORIES (dari gambar)
    promptCategories: {
        lookingFor: {
            name: '💕 Looking for',
            prompts: [
                'What I\'d really like to find is',
                'I\'m hoping you',
                'What makes a relationship great is',
                'Hopefully you\'re also really into',
                'Teach me something about',
                'My favorite quality in a person is',
                'My ultimate green flag is',
                'The one thing I\'d love to know about you is',
                'Send me a like if you'
            ]
        },
        bitOfFun: {
            name: '🎉 Bit of fun',
            prompts: [
                'I get way too excited about',
                'The last note I wrote on my phone says',
                'If I could bring back one trend, it would be',
                'I\'ll never forget the time I',
                'I probably shouldn\'t admit this, but',
                'My favorite way to do nothing is',
                'My most random skill is',
                'Something funny I think about all the time is',
                'A fictional character I relate to is',
                'When my phone dies I',
                'A nickname my friends have for me is',
                'Two truths and a lie',
                'I was today years old when I learned'
            ]
        },
        dateNight: {
            name: '💕 Date night',
            prompts: [
                'Send me a like if you know a great spot for',
                'I\'ve got the best recommendation for',
                'I\'ll know we vibe on a date if',
                'An essential to a successful first date is',
                'I hype myself up for a first date by',
                'Instead of drinks, let\'s',
                'I know the best spot in town for',
                'Win me over by',
                'Together, we could',
                'My couples dress-up idea is',
                'If I cooked you dinner it would be',
                'My perfect first date is'
            ]
        },
        aboutMe: {
            name: '🌟 About me',
            prompts: [
                'I will never shut up about',
                'After work you can find me',
                'One thing to know about my friend group is',
                'One thing you need to know about me is',
                'My real-life superpower is',
                'I\'m happiest when',
                'My personal hell is',
                'The quickest way to my heart is',
                'My humble brag is',
                'If I had to describe dating me in 3 words',
                'I\'m a real nerd about',
                'My simple pleasures are',
                'I\'m known for'
            ]
        },
        selfCare: {
            name: '🧘 Self-care',
            prompts: [
                'I\'ve been challenging myself to',
                'I get out of a bad mood by',
                'My perfect Sunday includes',
                'My healthy obsession is',
                'Something I recently learned about myself is',
                'To me, self-care is',
                'I\'m really proud of',
                'My morning routine looks like',
                'I feel my hottest when',
                'When I unplug I like to',
                'My most important boundary is',
                'What my therapist would say about me'
            ]
        },
        realTalk: {
            name: '💬 Real talk',
            prompts: [
                'Do you agree or disagree that',
                'I disagree when people say I\'m',
                'The world would be a better place with more',
                'Low-key, I think I',
                'A pro and a con of dating me',
                'What if I told you that',
                'If loving this is wrong, I don\'t want to be right',
                'My dream is to',
                'I show I care by',
                'I get fully nervous when',
                'Don\'t be mad if I',
                'My family still don\'t know I',
                'My character flaw is'
            ]
        }
    }
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
        try {
            const sentMessage = await bot.sendMessage(chatId, text, options);
            messageIds.set(userId, sentMessage.message_id);
        } catch (sendError) {
            console.error('Error sending message:', sendError);
        }
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
• Email: admin@datingbot.com

⏰ **Jam operasional:**
Senin - Minggu: 08:00 - 22:00 WIB`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '👨‍💼 Chat Admin', url: `tg://user?id=${ADMIN_ID}` }],
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
            prompts: [],
            photos: [],
            waitingFor: null
        });
    }
    
    const session = userSessions.get(userId);
    session.data.platform = platforms[platform];
    session.step = formSteps.personalInfo;

    const message = `
✅ **Platform dipilih: ${platforms[platform]}**

📝 **Personal Info - Step 1/9**

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
📏 **Tinggi Badan - Step 2/9**

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
🎯 **Hal yang Kamu Suka - Step 3/9**

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
💖 **Nilai yang Kamu Hargai - Step 4/9**

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
🍷 **Lifestyle & Kebiasaan - Step 5/9**

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
👶 **Anak & Rencana Keluarga - Step 6/9**

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
🛐 **Agama - Step 7/9**

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
✊ **Komunitas & Isu Sosial - Step 8/9**

Pilih **maksimal 3** isu yang kamu dukung **(${selectedCount}/3):**

${selectedCount > 0 ? '\n**✅ Sudah dipilih:**\n' + session.selectedCommunity.map(item => `• ${item}`).join('\n') + '\n' : ''}`;

    const keyboard = createInlineKeyboard(formOptions.community, 'community', 1);
    keyboard.inline_keyboard.push([
        { text: '✅ Selesai & Lanjut', callback_data: 'finish_community' }
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
    session.step = formSteps.prompts;
    showPromptCategories(chatId, userId);
}

// ========================================
// 💬 PROMPT SECTION (NEW)
// ========================================

function showPromptCategories(chatId, userId) {
    const session = userSessions.get(userId);
    const completedPrompts = session.prompts.length;
    
    const message = `
💬 **Tentang Kamu - Step 9/10**

**Wajib pilih minimal 3 prompt** untuk melengkapi profil **(${completedPrompts}/3):**

${completedPrompts > 0 ? '\n**✅ Prompt selesai:**\n' + session.prompts.map(p => `• ${p.category}: ${p.prompt}`).join('\n') + '\n' : ''}

Pilih kategori untuk melihat prompt:`;

    const categories = formOptions.promptCategories;
    const keyboard = {
        inline_keyboard: [
            [{ text: categories.lookingFor.name, callback_data: 'prompt_cat_lookingFor' }],
            [{ text: categories.bitOfFun.name, callback_data: 'prompt_cat_bitOfFun' }],
            [{ text: categories.dateNight.name, callback_data: 'prompt_cat_dateNight' }],
            [{ text: categories.aboutMe.name, callback_data: 'prompt_cat_aboutMe' }],
            [{ text: categories.selfCare.name, callback_data: 'prompt_cat_selfCare' }],
            [{ text: categories.realTalk.name, callback_data: 'prompt_cat_realTalk' }]
        ]
    };
    
    // Add finish button if at least 3 prompts completed
    if (completedPrompts >= 3) {
        keyboard.inline_keyboard.push([
            { text: '✅ Selesai Prompt & Lanjut', callback_data: 'finish_prompts' }
        ]);
    }
    
    keyboard.inline_keyboard.push([
        { text: '⏭️ Skip Semua Prompt', callback_data: 'skip_all_prompts' }
    ]);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'show_community' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function showPromptList(chatId, userId, categoryKey) {
    const category = formOptions.promptCategories[categoryKey];
    
    const message = `
${category.name}

Pilih prompt yang ingin kamu jawab:`;

    const keyboard = createInlineKeyboard(
        category.prompts, 
        `prompt_select_${categoryKey}`, 
        1
    );
    
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali ke Kategori', callback_data: 'back_to_prompt_categories' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function selectPrompt(chatId, userId, categoryKey, promptIndex) {
    const session = userSessions.get(userId);
    const category = formOptions.promptCategories[categoryKey];
    const selectedPrompt = category.prompts[promptIndex];
    
    const message = `
📝 **Prompt dipilih:**
${category.name}

"**${selectedPrompt}**"

Ketik jawaban kamu untuk prompt ini:

💡 **Tips:** Jawab dengan jujur dan menarik agar profile kamu stand out!`;
    
    const keyboard = {
        inline_keyboard: [
            [{ text: '🔙 Pilih Prompt Lain', callback_data: `prompt_cat_${categoryKey}` }],
            [{ text: '🏠 Menu Utama', callback_data: 'main_menu' }]
        ]
    };
    
    editOrSendMessage(chatId, userId, message, keyboard);
    
    // Set waiting for prompt answer
    session.waitingFor = `prompt_answer_${categoryKey}_${promptIndex}`;
}

function finishPrompts(chatId, userId) {
    const session = userSessions.get(userId);
    session.step = formSteps.photos;
    showPhotoUpload(chatId, userId);
}

// ========================================
// 📸 PHOTO UPLOAD SECTION (NEW)
// ========================================

function showPhotoUpload(chatId, userId) {
    const session = userSessions.get(userId);
    const uploadedPhotos = session.photos.length;
    
    const message = `
📸 **Upload Foto - Step 10/10**

**Wajib upload minimal 4 foto** untuk akun dating **(${uploadedPhotos}/4):**

${uploadedPhotos > 0 ? '\n**✅ Foto terupload:** ' + uploadedPhotos + ' foto\n' : ''}

**📝 Tips foto yang bagus:**
• Foto wajah yang jelas (minimal 1)
• Foto full body (minimal 1) 
• Foto aktivitas/hobi
• Foto dengan teman/keluarga
• Hindari foto blur atau gelap

**Cara upload:**
Kirim foto satu per satu ke chat ini`;

    const keyboard = {
        inline_keyboard: []
    };
    
    // Add finish button if at least 4 photos uploaded
    if (uploadedPhotos >= 4) {
        keyboard.inline_keyboard.push([
            { text: '✅ Selesai & Kirim Data', callback_data: 'finish_photos' }
        ]);
    }
    
    keyboard.inline_keyboard.push([
        { text: `📊 Foto: ${uploadedPhotos}/4`, callback_data: 'show_photo_count' }
    ]);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'back_to_prompts' },
        { text: '🏠 Menu Utama', callback_data: 'main_menu' }
    ]);
    
    editOrSendMessage(chatId, userId, message, keyboard);
}

function handlePhotoUpload(chatId, userId, photo) {
    const session = userSessions.get(userId);
    
    if (session.step === formSteps.photos) {
        session.photos.push({
            file_id: photo.file_id,
            file_unique_id: photo.file_unique_id,
            width: photo.width,
            height: photo.height
        });
        
        const uploadedCount = session.photos.length;
        const message = `✅ **Foto ${uploadedCount} berhasil diupload!**\n\n${uploadedCount >= 4 ? '🎉 Sudah mencukupi! Klik "Selesai" untuk lanjut.' : `Masih butuh ${4 - uploadedCount} foto lagi.`}`;
        
        bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        
        // Refresh photo upload menu
        setTimeout(() => {
            showPhotoUpload(chatId, userId);
        }, 2000);
    }
}

function finishPhotos(chatId, userId) {
    const session = userSessions.get(userId);
    if (session.photos.length >= 4) {
        session.step = formSteps.completed;
        completeForm(chatId, userId);
    } else {
        bot.sendMessage(chatId, `❌ **Upload minimal 4 foto!** (Sekarang: ${session.photos.length}/4)`, {
            parse_mode: 'Markdown'
        });
    }
}

// ========================================
// ✅ COMPLETE FORM
// ========================================

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

**💬 Prompts (${session.prompts.length}):**
${session.prompts.map(p => `• ${p.category}: "${p.answer}"`).join('\n')}

**📸 Foto:** ${session.photos.length} foto terupload

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

**💬 Prompts:** ${session.prompts.length} prompts completed
**📸 Photos:** ${session.photos.length} photos uploaded

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
            prompts: [],
            photos: [],
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
        case 'back_to_prompt_categories':
            showPromptCategories(chatId, userId);
            break;
        case 'finish_prompts':
            finishPrompts(chatId, userId);
            break;
        case 'skip_all_prompts':
            finishPrompts(chatId, userId);
            break;
        case 'back_to_prompts':
            showPromptCategories(chatId, userId);
            break;
        case 'finish_photos':
            finishPhotos(chatId, userId);
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
            } else if (data.startsWith('prompt_cat_')) {
                const categoryKey = data.replace('prompt_cat_', '');
                showPromptList(chatId, userId, categoryKey);
            } else if (data.startsWith('prompt_select_')) {
                const parts = data.split('_');
                const categoryKey = parts[2];
                const promptIndex = parseInt(parts[3]);
                selectPrompt(chatId, userId, categoryKey, promptIndex);
            }
            break;
    }

    bot.answerCallbackQuery(callbackQuery.id);
});

// ========================================
// 💬 MESSAGE HANDLERS
// ========================================

// Handle text messages (for input fields)
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const text = msg.text;

    // Skip if it's a command
    if (text && text.startsWith('/')) return;

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
                askForMode(chatId, userId);
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
            // Handle prompt answers
            if (session.waitingFor && session.waitingFor.startsWith('prompt_answer_')) {
                const parts = session.waitingFor.split('_');
                const categoryKey = parts[2];
                const promptIndex = parseInt(parts[3]);
                
                const category = formOptions.promptCategories[categoryKey];
                const selectedPrompt = category.prompts[promptIndex];
                
                // Save prompt answer
                session.prompts.push({
                    category: category.name,
                    prompt: selectedPrompt,
                    answer: text.trim()
                });
                
                session.waitingFor = null;
                
                bot.sendMessage(chatId, '✅ **Jawaban tersimpan!** Kamu bisa pilih prompt lain atau lanjut ke step berikutnya.', {
                    parse_mode: 'Markdown'
                });
                
                setTimeout(() => {
                    showPromptCategories(chatId, userId);
                }, 2000);
            }
            break;
    }
});

// Handle photo uploads
bot.on('photo', (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution
    
    if (userSessions.has(userId)) {
        handlePhotoUpload(chatId, userId, photo);
    }
});

// ========================================
// 🚀 BOT STARTUP
// ========================================

console.log('🤖 Bot Jual Beli Akun Dating sudah aktif!');
console.log('📱 Siap melayani pesanan akun dating...');
console.log('🔧 Fitur Update:');
console.log('   ✅ Edit message (anti-spam)');
console.log('   ✅ Validasi input lengkap'); 
console.log('   ✅ Navigation buttons fixed');
console.log('   ✅ Prompt categories (3 wajib)');
console.log('   ✅ Photo upload (4 wajib)');
console.log('   ✅ Send ke channel via ID');
console.log('   ❌ WhatsApp contact removed');
console.log('   ❌ Show profile option removed');

// Handle polling errors
bot.on('polling_error', (error) => {
    console.error('❌ Polling error:', error.message);
});

// Handle webhook errors  
bot.on('webhook_error', (error) => {
    console.error('❌ Webhook error:', error.message);
});
