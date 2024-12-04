require('dotenv').config();

module.exports = {
  telegram: {
    botToken: process.env.TELEGRAM_BOT_TOKEN
  },
  ton: {
    network: process.env.TON_NETWORK || 'testnet'
  }
};
