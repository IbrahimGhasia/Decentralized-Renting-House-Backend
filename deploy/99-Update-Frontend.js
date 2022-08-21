const fs = require("fs")
const { ethers, network } = require("hardhat")

const frontEndContractsFile = "../next-js-renthouse/constants/networkMapping.json"
const frontEndAbiLocation = "../next-js-renthouse/constants/"

module.exports = async function () {
    if (process.env.UPDATE_FRONT_END) {
        console.log("Updating Frontend...")
        await updateContractAddresses()
        await updateAbi()
        console.log("Frontend Updated Successfully!")
    }
}

async function updateContractAddresses() {
    const rentHouse = await ethers.getContract("RentHouse")
    const chainId = network.config.chainId.toString()
    const contractAddresses = JSON.parse(fs.readFileSync(frontEndContractsFile, "utf8"))
    if (chainId in contractAddresses) {
        if (!contractAddresses[chainId]["RentHouse"].includes(rentHouse.address)) {
            contractAddresses[chainId]["RentHouse"].push(rentHouse.address)
        }
    } else {
        contractAddresses[chainId] = { RentHouse: [rentHouse.address] }
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses))
}

async function updateAbi() {
    const rentHouse = await ethers.getContract("RentHouse")
    fs.writeFileSync(
        `${frontEndAbiLocation}RentHouse.json`,
        rentHouse.interface.format(ethers.utils.FormatTypes.json)
    )
}

module.exports.tags = ["all", "frontend"]
