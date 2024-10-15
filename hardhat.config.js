require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { PRIVATE_KEY, ALCHEMY_API_URL } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.27",
  networks: {
    sepolia: {
      url: ALCHEMY_API_URL,
      accounts: [`0x${PRIVATE_KEY}`]
    }
  }
};
