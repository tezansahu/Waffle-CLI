const moment = require("moment");
const chalk = require("chalk");
require("isomorphic-fetch");

let contract = {}

contract.getDetails = async (base_url, address, spinner) => {
    spinner.start();
    let data;
    try{
        data = await fetch(base_url+`/contracts/${address}`);
    }
    catch{
        spinner.stop();
        console.log(chalk.red("Error fetching data! Please try again later"))
        return;
    }
    let jsonData = await data.json();
    if(jsonData["data"]["relationships"]["token"]["data"] != null){
        tokenData = await fetch(base_url + "/tokens/" + jsonData["data"]["relationships"]["token"]["data"]["id"])
        tokenDataJSON = await tokenData.json();
    }
    spinner.stop();
    console.log("Address:\t\t", jsonData["data"]["attributes"]["address"]);
    console.log("Balance:\t\t", jsonData["data"]["attributes"]["balance"]);
    console.log("Creation Time:\t\t", moment.unix(parseInt(jsonData["data"]["attributes"]["createdAtTimestamp"])).local().toString());
    console.log("Constructor Arguments:\t", jsonData["data"]["attributes"]["constructorArgs"])
    if(jsonData["data"]["relationships"]["token"]["data"] == null){
        console.log("Token Associated:\tNone", )
    }
    else{

        console.log("Token Associated:\t", tokenDataJSON["data"]["attributes"]["name"], "(" + tokenDataJSON["data"]["attributes"]["symbol"] + ")");
        console.log("Token Type:\t\t", ...tokenDataJSON["data"]["attributes"]["tokenTypes"]);
        console.log("Total Supply:\t\t", tokenDataJSON["data"]["attributes"]["totalSupply"]);
    }
}

contract.getTransactions = async (base_url, address, num, spinner) => {
    spinner.start();
    let data; 
    try{   
        data = await fetch(base_url+`/contracts/${address}/transactions/?page[limit]=${num}`);
    }
    catch{
        spinner.stop()
        console.log(chalk.red("Error fetching data! Please try again later"));
        return;
    };
    let jsonData = await data.json();
    spinner.stop();
    for(i = 0; i < jsonData["meta"]["count"]; i++){
        console.log("Transaction Hash:\t", jsonData["data"][i]["id"]);
        console.log("From:\t\t\t", jsonData["data"][i]["relationships"]["from"]["data"]["id"]);
        console.log("To:\t\t\t", jsonData["data"][i]["relationships"]["to"]["data"]["id"]);
        console.log("Gas Used:\t\t", jsonData["data"][i]["attributes"]["txGasUsed"]);
        console.log("Gas Price:\t\t", jsonData["data"][i]["attributes"]["txGasPrice"]);
        console.log("Transaction Fee:\t", jsonData["data"][i]["attributes"]["fee"]);
        if(jsonData["data"][i]["attributes"]["msgPayload"] != null){
            console.log("Function Called:\t", jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"]);
        }
        console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"))
    }
}

contract.getBlock = async (base_url, address, spinner) => {
    spinner.start();
    let data; 
    try{   
        data = await fetch(`${base_url}/contracts/${address}/createdAtBlock`);
    }
    catch{
        spinner.stop()
        console.log(chalk.red("Error fetching data! Please try again later"));
        return;
    };
    let jsonData = await data.json();
    spinner.stop();
    console.log("Block Number:\t\t", jsonData["data"]["attributes"]["number"]);
    console.log("Block Hash:\t\t", jsonData["data"]["attributes"]["blockHash"]);
    console.log("Creation Time\t\t", moment.unix(parseInt(jsonData["data"]["attributes"]["blockCreationTime"])).local().toString());
    console.log("Block Difficulty:\t", jsonData["data"]["attributes"]["blockDifficulty"]);
    console.log("Block Reward:\t\t", (parseInt(jsonData["data"]["attributes"]["blockBeneficiaryReward"])*Math.pow(10, -18)).toString(), "ETH");
    console.log("Mined By:\t\t", jsonData["data"]["attributes"]["hasBeneficiaryAlias"]);
    console.log("Block Gas Used:\t\t", jsonData["data"]["attributes"]["blockGasUsed"]);
}

module.exports = contract;