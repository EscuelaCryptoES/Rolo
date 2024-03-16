import * as dotenv from 'dotenv';
import "@nomiclabs/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";

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
    gnosis: {
      url: process.env.GNOSIS_API_URL, // Or use your Infura URL
      accounts: [`0x${process.env.PK}`] // Use the account private key for deployment
    }
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey: process.env.ETHERSCAN_API
  },
};
