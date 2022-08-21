require("@nomiclabs/hardhat-waffle")
require("hardhat-gas-reporter")
require("@nomiclabs/hardhat-etherscan")
require("dotenv").config()
require("solidity-coverage")
require("hardhat-deploy")

/** @type import('hardhat/config').HardhatUserConfig */

const MUMBAI_TESTNET_RPC_URL = process.env.MUMBAI_TESTNET_RPC_URL
const PRIVATE_KEY = process.env.PRIVATE_KEY
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            chainId: 31337,
        },
        localhost: {
            chainId: 31337,
        },
        mumbai: {
            url: MUMBAI_TESTNET_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 80001,
            blockConfirmations: 6,
        },
    },
    etherscan: {
        apiKey: POLYGONSCAN_API_KEY,
    },
    solidity: {
        compilers: [{ version: "0.8.7" }],
    },
    gasReporter: {
        enabled: true,
        currency: "USD",
        outputFile: "gas-report.txt",
        noColors: true,
        // coinmarketcap: COINMARKETCAP_API_KEY,
    },
    namedAccounts: {
        deployer: {
            default: 0,
        },
    },
}
