const TelegramBot = require('node-telegram-bot-api');

// Konfigurasi Bot
const BOT_TOKEN = '8079421257:AAGmmHUKlqLWXyN-rD1uZxaWW3EXlHokhzY'; // Ganti dengan token bot Anda
const ADMIN_ID = '6291845861'; // ID Telegram admin
const CHANNEL_ID = '-1002672270285'; // Channel untuk kirim data

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Storage sementara untuk data user
const userSessions = new Map();

// Struktur data form
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

// Platform pilihan
const platforms = {
    tinder: '🔥 Tinder',
    badoo: '💖 Badoo', 
    bumble: '🐝 Bumble',
    boo: '👻 Boo'
};

// Data pilihan untuk form
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
    ],
    realTalk: [
        '😰 I get fully nervous when...',
        '⚖️ A pro and a con of dating me...',
        '🤔 Do you agree or disagree that...',
        '🤫 Low-key, I think I...',
        '😅 My character flaw is...',
        '🙄 Don\'t be mad if I...',
        '🗣️ I disagree when people say I\'m...',
        '💖 If loving this is wrong, I don\'t want to be right...'
    ],
    bitOfFun: [
        '😄 A nickname my friends have for me is...',
        '🤯 I\'ll never forget the time I...',
        '🤐 I probably shouldn\'t admit this, but...',
        '📈 If I could bring back one trend, it would be...',
        '🎭 Two truths and a lie...',
        '📱 The last note I wrote on my phone says...',
        '🎬 A fictional character I relate to is...'
    ],
    dateNight: [
        '💕 My perfect first date is...',
        '✨ I\'ll know we vibe on a date if...',
        '👫 My couples dress-up idea is...',
        '🎪 Instead of drinks, let\'s...',
        '💃 I hype myself up for a first date by...',
        '🤝 Together, we could...',
        '🍽️ If I cooked you dinner it would be...',
        '📍 I know the best spot in town for...'
    ],
    openingMove: [
        '🎯 What will your opening move be?',
        '💕 What\'s your ideal first date?',
        '🎊 What do you want to achieve this year?',
        '✈️ Window seat or aisle? Convince me either way…',
        '🪴 What\'s an acceptable number of houseplants to have?',
        '👶 What was your dream job as a kid?'
    ]
};

// Fungsi helper untuk membuat inline keyboard yang bagus
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

// Handler untuk command /start
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
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

    bot.sendMessage(chatId, welcomeMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
});

// Handler untuk command /mulai
bot.onText(/\/mulai/, (msg) => {
    showPlatformSelection(msg.chat.id);
});

// Fungsi untuk menampilkan pilihan platform
function showPlatformSelection(chatId) {
    const message = `
🎯 **Pilih Platform Dating yang Kamu Inginkan:**

Silakan pilih platform yang ingin kamu pesan akunnya:`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '🔥 Tinder', callback_data: 'platform_tinder' }],
            [{ text: '💖 Badoo', callback_data: 'platform_badoo' }],
            [{ text: '🐝 Bumble', callback_data: 'platform_bumble' }],
            [{ text: '👻 Boo', callback_data: 'platform_boo' }],
            [{ text: '🔙 Kembali ke Menu', callback_data: 'back_to_menu' }]
        ]
    };

    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// Handler untuk callback query
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

    const session = userSessions.get(userId);

    // Handle different callback data
    if (data === 'mulai') {
        showPlatformSelection(chatId);
    } else if (data === 'back_to_menu') {
        bot.onText(/\/start/, (msg) => {
            bot.sendMessage(chatId, msg.text);
        });
    } else if (data === 'contact_admin') {
        contactAdmin(chatId, userId);
    } else if (data === 'info_faq') {
        showInfoFAQ(chatId);
    } else if (data.startsWith('platform_')) {
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
    } else if (data.startsWith('about_')) {
        handleAboutYou(chatId, userId, data);
    } else if (data === 'finish_interests') {
        finishInterests(chatId, userId);
    } else if (data === 'finish_values') {
        finishValues(chatId, userId);
    } else if (data === 'finish_community') {
        finishCommunity(chatId, userId);
    } else if (data === 'complete_form') {
        completeForm(chatId, userId);
    }

    bot.answerCallbackQuery(callbackQuery.id);
});

// Handle platform selection
function handlePlatformSelection(chatId, userId, data) {
    const platform = data.split('_')[1];
    const session = userSessions.get(userId);
    session.data.platform = platforms[platform];
    session.step = formSteps.personalInfo;

    const message = `
✅ **Platform dipilih: ${platforms[platform]}**

📝 **Personal Info - Step 1/8**

Mari kita mulai dengan informasi dasar kamu:

**Silakan pilih gender kamu:**`;

    const keyboard = createInlineKeyboard(formOptions.gender, 'personal_gender', 1);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// Handle personal info step by step
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

Ketik nama depan yang ingin digunakan untuk akun dating:`;
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
    });
    
    const session = userSessions.get(userId);
    session.waitingFor = 'name';
}

function askForBirthDate(chatId, userId) {
    const message = `
📅 **Tanggal Lahir**

Ketik tanggal lahir dalam format: **MM/DD/YYYY**
Contoh: 05/15/1995`;
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
    });
    
    const session = userSessions.get(userId);
    session.waitingFor = 'birthdate';
}

function askForEmail(chatId, userId) {
    const message = `
📧 **Email**

Ketik alamat email yang ingin digunakan:`;
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
    });
    
    const session = userSessions.get(userId);
    session.waitingFor = 'email';
}

function askForShowProfile(chatId, userId) {
    const message = `
👁️ **Tampilkan di Profil**

Apakah ingin menampilkan informasi ini di profil?`;

    const keyboard = createInlineKeyboard(formOptions.showProfile, 'personal_show', 2);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

function askForMode(chatId, userId) {
    const message = `
🎯 **Mode Penggunaan**

Pilih mode penggunaan aplikasi:`;

    const keyboard = createInlineKeyboard(formOptions.mode, 'personal_mode', 2);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

function askForMeetWith(chatId, userId) {
    const message = `
👥 **Ingin Bertemu dengan**

Kamu ingin bertemu dengan:`;

    const keyboard = createInlineKeyboard(formOptions.meetWith, 'personal_meet', 1);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

function askForPurpose(chatId, userId) {
    const message = `
💕 **Tujuan**

Kamu berharap menemukan:`;

    const keyboard = createInlineKeyboard(formOptions.purpose, 'personal_purpose', 1);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

function askForHeight(chatId, userId) {
    const message = `
📏 **Tinggi Badan - Step 2/8**

Ketik tinggi badan dalam cm (contoh: 170):`;
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
    });
    
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

${selectedCount > 0 ? '\n**Sudah dipilih:**\n' + session.selectedInterests.map(item => `• ${item}`).join('\n') + '\n' : ''}`;

    const keyboard = createInlineKeyboard(formOptions.interests, 'interests', 2);
    
    // Add finish button if exactly 5 selected
    if (selectedCount === 5) {
        keyboard.inline_keyboard.push([
            { text: '✅ Selesai & Lanjut', callback_data: 'finish_interests' }
        ]);
    }
    
    keyboard.inline_keyboard.push([
        { text: `📊 Dipilih: ${selectedCount}/5`, callback_data: 'show_selected' }
    ]);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

function handleInterests(chatId, userId, data) {
    const session = userSessions.get(userId);
    const index = parseInt(data.split('_')[1]);
    const interest = formOptions.interests[index];
    
    if (!session.selectedInterests.includes(interest)) {
        if (session.selectedInterests.length < 5) {
            session.selectedInterests.push(interest);
            bot.sendMessage(chatId, `✅ **Ditambahkan:** ${interest}`, {
                parse_mode: 'Markdown'
            });
            
            // Refresh the interests menu
            setTimeout(() => {
                showInterests(chatId, userId);
            }, 1000);
        } else {
            bot.sendMessage(chatId, `❌ **Maksimal 5 pilihan saja!**`, {
                parse_mode: 'Markdown'
            });
        }
    } else {
        // Remove if already selected
        session.selectedInterests = session.selectedInterests.filter(item => item !== interest);
        bot.sendMessage(chatId, `➖ **Dihapus:** ${interest}`, {
            parse_mode: 'Markdown'
        });
        
        // Refresh the interests menu
        setTimeout(() => {
            showInterests(chatId, userId);
        }, 1000);
    }
}

function finishInterests(chatId, userId) {
    const session = userSessions.get(userId);
    if (session.selectedInterests.length === 5) {
        session.step = formSteps.values;
        showValues(chatId, userId);
    } else {
        bot.sendMessage(chatId, `❌ **Pilih tepat 5 hal!** (Sekarang: ${session.selectedInterests.length}/5)`, {
            parse_mode: 'Markdown'
        });
    }
}

// Handle values
function showValues(chatId, userId) {
    const session = userSessions.get(userId);
    const selectedCount = session.selectedValues.length;
    
    const message = `
💖 **Nilai yang Kamu Hargai - Step 4/8**

Pilih **3 nilai** yang kamu hargai dalam seseorang **(${selectedCount}/3):**

${selectedCount > 0 ? '\n**Sudah dipilih:**\n' + session.selectedValues.map(item => `• ${item}`).join('\n') + '\n' : ''}`;

    const keyboard = createInlineKeyboard(formOptions.values, 'values', 2);
    
    if (selectedCount === 3) {
        keyboard.inline_keyboard.push([
            { text: '✅ Selesai & Lanjut', callback_data: 'finish_values' }
        ]);
    }
    
    keyboard.inline_keyboard.push([
        { text: `📊 Dipilih: ${selectedCount}/3`, callback_data: 'show_selected_values' }
    ]);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

function handleValues(chatId, userId, data) {
    const session = userSessions.get(userId);
    const index = parseInt(data.split('_')[1]);
    const value = formOptions.values[index];
    
    if (!session.selectedValues.includes(value)) {
        if (session.selectedValues.length < 3) {
            session.selectedValues.push(value);
            bot.sendMessage(chatId, `✅ **Ditambahkan:** ${value}`, {
                parse_mode: 'Markdown'
            });
            setTimeout(() => {
                showValues(chatId, userId);
            }, 1000);
        } else {
            bot.sendMessage(chatId, `❌ **Maksimal 3 pilihan saja!**`, {
                parse_mode: 'Markdown'
            });
        }
    } else {
        session.selectedValues = session.selectedValues.filter(item => item !== value);
        bot.sendMessage(chatId, `➖ **Dihapus:** ${value}`, {
            parse_mode: 'Markdown'
        });
        setTimeout(() => {
            showValues(chatId, userId);
        }, 1000);
    }
}

function finishValues(chatId, userId) {
    const session = userSessions.get(userId);
    if (session.selectedValues.length === 3) {
        session.step = formSteps.lifestyle;
        showLifestyle(chatId, userId);
    } else {
        bot.sendMessage(chatId, `❌ **Pilih tepat 3 nilai!** (Sekarang: ${session.selectedValues.length}/3)`, {
            parse_mode: 'Markdown'
        });
    }
}

// Handle lifestyle
function showLifestyle(chatId, userId) {
    const message = `
🍷 **Lifestyle & Kebiasaan - Step 5/8**

Pilih kebiasaan minum alkohol:`;

    const keyboard = createInlineKeyboard(formOptions.alcohol, 'lifestyle_alcohol', 1);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
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
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// Handle kids
function showKids(chatId, userId) {
    const message = `
👶 **Anak & Rencana Keluarga - Step 6/8**

Pilih status tentang anak:`;

    const keyboard = createInlineKeyboard(formOptions.kidsOption, 'kids', 1);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
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
🛐 **Agama & Politik - Step 7/8**

Ketik agama kamu (atau ketik "Skip" untuk skip):`;
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
    });
    
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
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// Handle community
function showCommunity(chatId, userId) {
    const session = userSessions.get(userId);
    const selectedCount = session.selectedCommunity.length;
    
    const message = `
✊ **Komunitas & Isu Sosial - Step 8/8**

Pilih **maksimal 3** isu yang kamu dukung **(${selectedCount}/3):**

${selectedCount > 0 ? '\n**Sudah dipilih:**\n' + session.selectedCommunity.map(item => `• ${item}`).join('\n') + '\n' : ''}`;

    const keyboard = createInlineKeyboard(formOptions.community, 'community', 1);
    
    keyboard.inline_keyboard.push([
        { text: '✅ Selesai Form', callback_data: 'finish_community' }
    ]);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

function handleCommunity(chatId, userId, data) {
    const session = userSessions.get(userId);
    const index = parseInt(data.split('_')[1]);
    const community = formOptions.community[index];
    
    if (!session.selectedCommunity.includes(community)) {
        if (session.selectedCommunity.length < 3) {
            session.selectedCommunity.push(community);
            bot.sendMessage(chatId, `✅ **Ditambahkan:** ${community}`, {
                parse_mode: 'Markdown'
            });
            setTimeout(() => {
                showCommunity(chatId, userId);
            }, 1000);
        } else {
            bot.sendMessage(chatId, `❌ **Maksimal 3 pilihan saja!**`, {
                parse_mode: 'Markdown'
            });
        }
    } else {
        session.selectedCommunity = session.selectedCommunity.filter(item => item !== community);
        bot.sendMessage(chatId, `➖ **Dihapus:** ${community}`, {
            parse_mode: 'Markdown'
        });
        setTimeout(() => {
            showCommunity(chatId, userId);
        }, 1000);
    }
}

function finishCommunity(chatId, userId) {
    const session = userSessions.get(userId);
    session.step = formSteps.aboutYou;
    showAboutYou(chatId, userId);
}

// Handle about you section
function showAboutYou(chatId, userId) {
    const message = `
💬 **Tentang Kamu - Langkah Terakhir!**

Pilih kategori untuk melengkapi profil:`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '🗨️ Real Talk', callback_data: 'about_realtalk' }],
            [{ text: '🎉 Bit of Fun', callback_data: 'about_bitoffun' }],
            [{ text: '💕 Date Night', callback_data: 'about_datenight' }],
            [{ text: '🎯 Opening Move', callback_data: 'about_opening' }],
            [{ text: '✅ Selesai & Kirim', callback_data: 'complete_form' }]
        ]
    };
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

function handleAboutYou(chatId, userId, data) {
    const [, category] = data.split('_');
    
    let options, title;
    switch(category) {
        case 'realtalk':
            options = formOptions.realTalk;
            title = '🗨️ **Real Talk**';
            break;
        case 'bitoffun':
            options = formOptions.bitOfFun;
            title = '🎉 **Bit of Fun**';
            break;
        case 'datenight':
            options = formOptions.dateNight;
            title = '💕 **Date Night**';
            break;
        case 'opening':
            options = formOptions.openingMove;
            title = '🎯 **Opening Move**';
            break;
    }
    
    const message = `
${title}

Pilih prompt yang ingin kamu jawab:`;

    const keyboard = createInlineKeyboard(options, `prompt_${category}`, 1);
    keyboard.inline_keyboard.push([
        { text: '🔙 Kembali', callback_data: 'back_about' }
    ]);
    
    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// Complete form and send data
function completeForm(chatId, userId) {
    const session = userSessions.get(userId);
    const userData = session.data;
    
    // Create summary message
    const summaryMessage = `
🎉 **FORM COMPLETED!**

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
            [{ text: '🏠 Menu Utama', callback_data: 'back_to_menu' }]
        ]
    };

    bot.sendMessage(chatId, summaryMessage, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });

    // Send data to channel and admin
    sendToChannelAndAdmin(userData, session, userId, chatId);
    
    // Clear session
    userSessions.delete(userId);
}

// Send data to channel and admin
function sendToChannelAndAdmin(userData, session, userId, chatId) {
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

**🎯 Preferences:**
• Interests: ${session.selectedInterests.join(', ')}
• Values: ${session.selectedValues.join(', ')}
• Community: ${session.selectedCommunity.join(', ')}

**📞 Next Action:** Contact customer for payment & processing`;

    // Send to channel
    if (CHANNEL_ID) {
        bot.sendMessage(CHANNEL_ID, dataMessage, { parse_mode: 'Markdown' });
    }

    // Send to admin
    if (ADMIN_ID) {
        bot.sendMessage(ADMIN_ID, dataMessage, { parse_mode: 'Markdown' });
    }
}

// Contact admin function
function contactAdmin(chatId, userId) {
    const message = `
💬 **Hubungi Admin**

Silakan klik tombol di bawah untuk chat langsung dengan admin kami:`;

    const keyboard = {
        inline_keyboard: [
            [{ text: '👨‍💼 Chat Admin', url: `tg://user?id=${ADMIN_ID}` }],
            [{ text: '📞 Via WhatsApp', url: 'https://wa.me/6281234567890' }],
            [{ text: '🔙 Kembali', callback_data: 'back_to_menu' }]
        ]
    };

    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

// Show Info & FAQ
function showInfoFAQ(chatId) {
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
            [{ text: '🏠 Menu Utama', callback_data: 'back_to_menu' }]
        ]
    };

    bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
    });
}

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

    // Handle different input types
    switch(session.waitingFor) {
        case 'name':
            session.data.firstName = text;
            session.waitingFor = null;
            askForBirthDate(chatId, userId);
            break;
            
        case 'birthdate':
            session.data.birthDate = text;
            session.waitingFor = null;
            askForEmail(chatId, userId);
            break;
            
        case 'email':
            session.data.email = text;
            session.waitingFor = null;
            askForShowProfile(chatId, userId);
            break;
            
        case 'height':
            session.data.height = text;
            session.waitingFor = null;
            session.step = formSteps.interests;
            showInterests(chatId, userId);
            break;
            
        case 'religion':
            session.data.religion = text;
            session.waitingFor = null;
            askForPolitics(chatId, userId);
            break;
            
        default:
            // Handle prompt answers
            if (session.waitingFor && session.waitingFor.startsWith('prompt_')) {
                const [, category, index] = session.waitingFor.split('_');
                if (!session.data.prompts) session.data.prompts = {};
                session.data.prompts[`${category}_${index}`] = text;
                session.waitingFor = null;
                
                bot.sendMessage(chatId, '✅ **Jawaban tersimpan!**', {
                    parse_mode: 'Markdown'
                });
                
                setTimeout(() => {
                    showAboutYou(chatId, userId);
                }, 1000);
            }
            break;
    }
});

// Handle prompt selection
bot.on('callback_query', (callbackQuery) => {
    const data = callbackQuery.data;
    const chatId = callbackQuery.message.chat.id;
    const userId = callbackQuery.from.id;
    
    if (data.startsWith('prompt_')) {
        const [, category, index] = data.split('_');
        const session = userSessions.get(userId);
        
        let options;
        switch(category) {
            case 'realtalk':
                options = formOptions.realTalk;
                break;
            case 'bitoffun':
                options = formOptions.bitOfFun;
                break;
            case 'datenight':
                options = formOptions.dateNight;
                break;
            case 'opening':
                options = formOptions.openingMove;
                break;
        }
        
        const selectedPrompt = options[parseInt(index)];
        
        bot.sendMessage(chatId, `
📝 **Prompt dipilih:**
${selectedPrompt}

**Ketik jawaban kamu:**`, {
            parse_mode: 'Markdown'
        });
        
        session.waitingFor = `prompt_${category}_${index}`;
    }
    
    bot.answerCallbackQuery(callbackQuery.id);
});

console.log('🤖 Bot Jual Beli Akun Dating sudah aktif!');
console.log('📱 Siap melayani pesanan akun dating...');
