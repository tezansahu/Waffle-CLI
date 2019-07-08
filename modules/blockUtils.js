const moment = require("moment");
const chalk = require("chalk");
const ora = require('ora');
require("isomorphic-fetch");

const spinner = ora('Fetching data from aleth.io');

let block = {}

block.getDetails = async (base_url, identifier, showTxns) => {
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
    
    if(showTxns){
        await getBlockTxn(base_url, identifier);
    }
}

getBlockTxn = async (base_url, identifier) => {
    let nextPageLink = "";
    let jsonData;
    do{
        spinner.start();
        let data; 
        try{
            if(nextPageLink == ""){
                data = await fetch(`${base_url}/blocks/${identifier}/transactions?page[limit]=100`);
            }   
            else{
                data = await fetch(nextPageLink);
            }
        }
        catch{
            spinner.stop()
            console.log(chalk.red("Error fetching data! Please try again later"));
            return;
        };
        jsonData = await data.json();
        spinner.stop();

        if(jsonData["errors"] != undefined){
            for(let i = 0; i < jsonData["errors"].length; i++){
                console.error(chalk.red("Error " + jsonData["errors"][i]["status"] + ": " + jsonData["errors"][i]["title"]))
                return;
            }
        }
        if(nextPageLink == ""){
            console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
            console.log(chalk.bold.cyan(`Transactions Included`))
            console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
        }
        for(i = 0; i < jsonData["meta"]["count"]; i++){
            console.log("Transaction Hash:\t", jsonData["data"][i]["id"]);
            console.log("Timestamp:\t\t", moment.unix(parseInt(jsonData["data"][i]["attributes"]["blockCreationTime"])).local().toString());
            console.log("Gas Used:\t\t", jsonData["data"][i]["attributes"]["txGasUsed"]);
            console.log("Gas Price:\t\t", jsonData["data"][i]["attributes"]["txGasPrice"], "Wei");
            console.log("Transaction Fee:\t", (parseInt(jsonData["data"][i]["attributes"]["fee"])*Math.pow(10, -18)).toString(), "ETH");            
            if(jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"] != ""){
                console.log("Function Called:\t", jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"]);
            }
            console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"))
        }
        nextPageLink = `${base_url}/blocks/${identifier}/transactions?page[limit]=100&page` + jsonData["links"]["next"].substring(jsonData["links"]["next"].indexOf("[next]"));
    }
    while(jsonData["meta"]["page"]["hasNext"] == true);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}

module.exports = block;