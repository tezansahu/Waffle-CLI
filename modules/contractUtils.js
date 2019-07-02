const moment = require("moment");
const chalk = require("chalk");
require("isomorphic-fetch");

let contract = {}

contract.getDetails = async (base_url, address, spinner) => {
    spinner.start();
    const data = await fetch(base_url+`/contracts/${address}`);
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
    const data = await fetch(base_url+`/contracts/${address}/transactions/?page[limit]=${num}`);
    let jsonData = await data.json();
    // if(jsonData["data"]["relationships"]["token"]["data"] != null){
    //     tokenData = await fetch(base_url + "/tokens/" + jsonData["data"]["relationships"]["token"]["data"]["id"])
    //     tokenDataJSON = await tokenData.json();
    // }
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
    
    // console.log("Balance:\t\t", jsonData["data"]["attributes"]["balance"]);
    // console.log("Creation Time:\t\t", moment.unix(parseInt(jsonData["data"]["attributes"]["createdAtTimestamp"])).local().toString());
    // console.log("Constructor Arguments:\t", jsonData["data"]["attributes"]["constructorArgs"])
    // console.log(jsonData);
}


module.exports = contract;