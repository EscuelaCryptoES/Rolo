require("@nomicfoundation/hardhat-ethers");
import "@nomicfoundation/hardhat-verify";
import * as dotenv from 'dotenv';

dotenv.config();

module.exports = {
  solidity: "0.8.21", // Specify your Solidity version
  networks: {
    localhost: {
      // Configuration for the local network; Hardhat automatically handles this
    },
    sepolia: {
      url: process.env.SEPOLIA_API_URL, // Or use your Infura URL
      accounts: [`0x${process.env.PK}`] // Use the account private key for deployment
    },
    mainnet: {
      url: process.env.MAINNET_API_URL, // Or use your Infura URL
      accounts: [`0x${process.env.PK}`] // Use the account private key for deployment
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API
  },
};
