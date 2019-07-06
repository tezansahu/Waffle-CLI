const ora = require('ora');
const Web3 = require("web3")
const ENS = require('ethereum-ens');

const url = `https://mainnet.infura.io/v3/066d8d3dc9f84a3e8efff7440c21646c`;
const provider = new Web3.providers.HttpProvider(url);

const ens = new ENS(provider);
const spinner = ora('Resolving ENS address');

let ensUtils = {}

ensUtils.getAddress = async (ensDomain) => {
    spinner.start();
    address = await ens.resolver(ensDomain).addr()
        .catch((err) => {
            // console.log(chalk.red("Error: ENS name not found!\n"));
            spinner.stop();
            return "0x0000000000000000000000000000000000000000"
        })
    spinner.stop();
    return address;
}

module.exports = ensUtils;