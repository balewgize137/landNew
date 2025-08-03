require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24", // Adjusted for better compatibility
  networks: {
    localhost: {
      url: "HTTP://127.0.0.1:7545"
    }
  }
};