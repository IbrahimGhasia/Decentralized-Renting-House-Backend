const networkConfig = {
    31337: {
        name: "localhost",
    },
    80001: {
        name: "mumbai",
        callbackGasLimit: "500000",
    },
}

const developmentChains = ["hardhat", "localhost"]

module.exports = {
    networkConfig,
    developmentChains,
}
