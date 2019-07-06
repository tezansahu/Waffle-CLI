const moment = require("moment");
const chalk = require("chalk");
const ora = require('ora');
require("isomorphic-fetch");

const spinner = ora('Fetching data from aleth.io');

let block = {}

block.getDetails = async (base_url, identifier) => {
    spinner.start();
    let data;
    try{
        data = await fetch(base_url+`/blocks/${identifier}`);
    }
    catch{
        spinner.stop();
        console.log(chalk.red("Error fetching data! Please try again later"))
        return;
    }
    let jsonData = await data.json();
    spinner.stop();
    if(jsonData["errors"] != undefined){
        for(let i = 0; i < jsonData["errors"].length; i++){
            console.error(chalk.red("Error " + jsonData["errors"][i]["status"] + ": " + jsonData["errors"][i]["title"]))
            return;
        }
    }
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    console.log(chalk.bold.cyan(`Block Details`))
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    // console.log(jsonData);
    console.log("Block Hash:\t\t\t", jsonData["data"]["attributes"]["blockHash"]);
    console.log("Block Number:\t\t\t", jsonData["data"]["attributes"]["number"]);
    console.log("Beneficiary Reward:\t\t", jsonData["data"]["attributes"]["blockBeneficiaryReward"]);
    console.log("Difficulty:\t\t\t", jsonData["data"]["attributes"]["blockDifficulty"]);
    console.log("Gas Limit:\t\t\t", jsonData["data"]["attributes"]["blockGasLimit"]);
    console.log("Canonical:\t\t\t", jsonData["data"]["attributes"]["canonical"]);
    console.log("HasBeneficiaryAlias:\t\t", jsonData["data"]["attributes"]["hasBeneficiaryAlias"]);
    console.log("Gas Used:\t\t\t", jsonData["data"]["attributes"]["blockGasUsed"]);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    
}

module.exports = block;