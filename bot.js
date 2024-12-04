const { Telegraf } = require('telegraf');
const axios = require('axios'); 
const TONNFTMinter = require('../blockchain/nft-minter');
const config = require('../../config/config');

const fs = require('fs').promises;
const path = require('path');

const uploadsDir = path.join(__dirname, 'uploads');

async function ensureDirectory() {
    try {
        // Ensure the uploads directory exists
        await fs.mkdir(uploadsDir, { recursive: true });
        console.log('Uploads directory created or already exists.');
    } catch (error) {
        console.error('Error creating uploads directory:', error);
    }
}





class NFTMarketplaceBot {
  constructor() {
    this.bot = new Telegraf(config.telegram.botToken);
    this.nftMinter = new TONNFTMinter(config);
    
    // Call setup methods
    this.setupCommands();
    this.setupHandlers();
  }

  // Add command setup method
  setupCommands() {
    this.bot.command('start', this.handleStartCommand.bind(this));
    this.bot.command('createwallet', this.handleCreateWalletCommand.bind(this));
    this.bot.command('mint', this.handleMintCommand.bind(this));
  }

  // Add handler setup method
  setupHandlers() {
    this.bot.on('photo', this.handlePhotoUpload.bind(this));
  }

  // Command handlers
  async handleStartCommand(ctx) {
    await ctx.reply('Welcome to TON NFT Marketplace! 🚀\n' +
      '• /createwallet - Create a new TON wallet\n' +
      '• /mint - Mint an NFT\n' +
      'Send an image directly to mint an NFT');
  }

  async handleCreateWalletCommand(ctx) {
    try {
      // Implement wallet creation logic
      await ctx.reply('Wallet creation functionality coming soon!');
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
      
      // Log photo details for debugging
      console.log('Photo File ID:', photo.file_id);

      // Get file link
      let fileLink;
      try {
        fileLink = await ctx.telegram.getFile(photo.file_id);
        console.log('File Link:', fileLink);
      } catch (fileLinkError) {
        console.error('Error getting file link:', fileLinkError);
        await ctx.reply('Failed to get file link. Please try again.');
        return;
      }

      // Construct download URL
      const downloadUrl = `https://api.telegram.org/file/bot${config.telegram.botToken}/${fileLink.file_path}`;
      console.log('Download URL:', downloadUrl);

      // Download file with detailed error handling
      let downloadResponse;
      try {
        downloadResponse = await axios({
          method: 'get',
          url: downloadUrl,
          responseType: 'arraybuffer',
          timeout: 10000  // 10 seconds timeout
        });
        console.log('Download successful, file size:', downloadResponse.data.length);
      } catch (downloadError) {
        console.error('Download Error:', downloadError);
        await ctx.reply('Failed to download image. Please try again.');
        return;
      }

      // Optional: Save file locally for debugging
      try {
        await fs.writeFile(`./downloaded_image_${photo.file_id}.jpg`, downloadResponse.data);
        console.log('Image saved locally for debugging');
      } catch (saveError) {
        console.error('Failed to save image:', saveError);
      }

      // Prepare mnemonic (ensure it's an array)
      const ownerMnemonic = (process.env.OWNER_MNEMONIC || '').split(' ').filter(word => word.trim() !== '');
      
      if (ownerMnemonic.length !== 24) {
        throw new Error('Invalid mnemonic. Must be exactly 24 words.');
      }

      // Create NFT Collection (first-time setup)
      const collectionMetadata = {
        name: "Telegram NFT Marketplace Collection",
        description: "NFTs minted via Telegram Bot",
        image: "collection_image_url"
      };

      // Create collection first
      const collection = await this.nftMinter.createNFTCollection(
        ownerMnemonic, 
        collectionMetadata
      );

      // Prepare NFT Metadata
      const nftMetadata = {
        name: `NFT from ${ctx.from.username || 'Anonymous'}`,
        description: "Minted via TON NFT Marketplace",
        image: fileLink.file_path
      };

      // Mint the NFT
      const nftResult = await this.nftMinter.mintNFT(
        collection.collectionAddress, 
        nftMetadata
      );

      // Provide feedback to user
      await ctx.reply(`✅ NFT Minted Successfully!\n` +
        `Collection Address: ${collection.collectionAddress}\n` +
        `NFT Address: ${nftResult.nftAddress}`);

    } catch (error) {
      console.error('NFT Minting Process Error:', error);
      await ctx.reply('Failed to mint NFT. Please check:\n' +
        '1. Correct mnemonic setup\n' +
        '2. Sufficient testnet tokens\n' +
        '3. Network connectivity\n');
    }
    try {
      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const fileLink = await ctx.telegram.getFile(photo.file_id);

      // Download the file
      const downloadUrl = `https://api.telegram.org/file/bot${config.telegram.botToken}/${fileLink.file_path}`;
      const downloadResponse = await axios.get(downloadUrl, { responseType: 'arraybuffer' });

      // Save the file locally
      const fileName = `image_${Date.now()}.jpg`;
      const filePath = path.join(__dirname, 'uploads', fileName);
      await fs.writeFile(filePath, downloadResponse.data);

      // Construct the file URL
      const fileUrl = `http://localhost:3000/uploads/${fileName}`;

      // Mint the NFT using the file URL
      const nftResult = await this.nftMinter.mintNFT(
          'your-collection-address', // Replace with actual collection address
          { name: "NFT from Telegram", description: "Minted via TON Bot", image: fileUrl }
      );

      await ctx.reply(`✅ NFT Minted!\nAddress: ${nftResult.nftAddress}`);
  } catch (error) {
      console.error('NFT Minting Error:', error);
      
  }

  }


  // Launch method to start the bot
  launch() {
    this.bot.launch();
    console.log('TON NFT Marketplace Bot is running...');
  }

  // Optional: Graceful stop
  stopBot() {
    this.bot.stop();
  }
}

module.exports = NFTMarketplaceBot;