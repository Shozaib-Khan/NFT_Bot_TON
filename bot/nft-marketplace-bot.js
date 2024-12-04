const { Telegraf } = require('telegraf');
const axios = require('axios');
const WalletManager = require('../utils/wallet-utils');
const config = require('../config/config');

class NFTMarketplaceBot {
  constructor() {
    this.bot = new Telegraf(config.telegram.botToken);
    this.setupCommands();
    this.setupHandlers();
  }

  setupCommands() {
    this.bot.command('start', this.handleStartCommand.bind(this));
    this.bot.command('createwallet', this.handleCreateWalletCommand.bind(this));
    this.bot.command('mint', this.handleMintCommand.bind(this));
  }

  setupHandlers() {
    this.bot.on('photo', this.handlePhotoUpload.bind(this));
  }

  async handleStartCommand(ctx) {
    await ctx.reply('Welcome to TON NFT Marketplace! 🚀\n' +
      '• /createwallet - Create a new TON wallet\n' +
      '• /mint - Mint an NFT\n' +
      'Send an image directly to mint an NFT');
  }

  async handleCreateWalletCommand(ctx) {
    try {
      const mnemonic = await WalletManager.generateMnemonic();
      const walletInfo = await WalletManager.createWalletFromMnemonic(mnemonic);

      await ctx.reply(`🆕 TON Wallet Created!\n\n` +
        `Address: ${walletInfo.address}\n\n` +
        `🚨 IMPORTANT: Securely save these words:\n` +
        mnemonic.join(' '));
    } catch (error) {
      console.error('Wallet creation error:', error);
      await ctx.reply('Failed to create wallet. Please try again.');
    }
  }

  async handleMintCommand(ctx) {
    await ctx.reply('Send me an image to mint as an NFT! 🖼️');
  }

  async handlePhotoUpload(ctx) {
    try {
      // Get the highest resolution photo
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileLink = await ctx.telegram.getFile(photo.file_id);
      
      // Download file (basic implementation)
      const downloadResponse = await axios({
        method: 'get',
        url: `https://api.telegram.org/file/bot${config.telegram.botToken}/${fileLink.file_path}`,
        responseType: 'arraybuffer'
      });

      // Basic NFT minting simulation
      await ctx.reply(`✅ NFT Minted!\n` +
        `File size: ${downloadResponse.data.length} bytes\n` +
        `Simulated NFT Creation`);
    } catch (error) {
      console.error('NFT minting error:', error);
      await ctx.reply('Failed to mint NFT. Please try again.');
    }
  }

  launch() {
    this.bot.launch();
    console.log('TON NFT Marketplace Bot is running...');
  }
}

module.exports = NFTMarketplaceBot;
