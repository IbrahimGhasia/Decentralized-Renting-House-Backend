const { network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    log("-----------------------------------------------")
    log("Deploying RentHouse...")
    const args = []
    const rentHouse = await deploy("RentHouse", {
        from: deployer,
        args: args,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`RentHouse deployed at ${rentHouse.address}`)

    if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
        log("Verifying...")
        await verify(rentHouse.address, args)
    }
    log("-----------------------------------------------")
}

module.exports.tags = ["all", "renthouse"]
