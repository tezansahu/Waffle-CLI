const moment = require("moment");
const chalk = require("chalk");
require("isomorphic-fetch");

let block = {}

block.getDetails = async (base_url, hash, spinner) => {
    spinner.start();
    let data;
    try{
        data = await fetch(base_url+`/blocks/${hash}`);
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

    // console.log(jsonData);
    console.log("ID:\t\t\t\t", jsonData["data"]["attributes"]["blockHash"]);
    console.log("Beneficiary Reward:\t\t", jsonData["data"]["attributes"]["blockBeneficiaryReward"]);
    console.log("Difficulty:\t\t\t", jsonData["data"]["attributes"]["blockDifficulty"]);
    console.log("Gas Limit:\t\t\t", jsonData["data"]["attributes"]["blockGasLimit"]);
    console.log("Canonical:\t\t\t", jsonData["data"]["attributes"]["canonical"]);
    console.log("HasBeneficiaryAlias:\t\t", jsonData["data"]["attributes"]["hasBeneficiaryAlias"]);
    console.log("Gas Used:\t\t\t", jsonData["data"]["attributes"]["blockGasUsed"]);
    console.log("Number:\t\t\t\t", jsonData["data"]["attributes"]["number"]);
    
}

module.exports = block;