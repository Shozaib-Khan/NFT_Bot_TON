require('dotenv').config();
const NFTMarketplaceBot = require('./src/bot/bot');

const bot = new NFTMarketplaceBot();
bot.launch();

// Enable graceful stop
process.once('SIGINT', () => bot.stopBot());
process.once('SIGTERM', () => bot.stopBot());