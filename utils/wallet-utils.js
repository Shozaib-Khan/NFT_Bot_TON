const { mnemonicToWalletKey } = require('@ton/crypto');
const { WalletContractV4 } = require('@ton/ton');

class WalletManager {
  static async generateMnemonic() {
    const { mnemonicNew } = require('@ton/crypto');
    return await mnemonicNew(24);
  }

  static async createWalletFromMnemonic(mnemonicWords) {
    try {
      const keyPair = await mnemonicToWalletKey(mnemonicWords);

      const wallet = WalletContractV4.create({ 
        workchain: 0, 
        publicKey: keyPair.publicKey 
      });

      return {
        address: wallet.address.toString(),
        mnemonic: mnemonicWords
      };
    } catch (error) {
      console.error('Wallet creation error:', error);
      throw error;
    }
  }
}

module.exports = WalletManager;
