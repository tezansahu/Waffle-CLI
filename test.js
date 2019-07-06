const Web3 = require("web3")
var ENS = require('ethereum-ens');

const url = `https://mainnet.infura.io/v3/066d8d3dc9f84a3e8efff7440c21646c`;
const provider = new Web3.providers.HttpProvider(url);

const ens = new ENS(provider);

async function run() {
    let address = await ens.resolver("tezan.deserves.et").addr().catch(err => console.error(err));
    console.log(address);
}

run();