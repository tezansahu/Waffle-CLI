const moment = require("moment");
const chalk = require("chalk");
const ora = require('ora');
const tokenDetails = require("../tokenDatabase/tokenDetails.json");
require("isomorphic-fetch");

const spinner = ora('Fetching data from aleth.io');

let account = {}

//////////////////////////////////////////
// Get details about a specific account //
//////////////////////////////////////////
account.getDetails = async (base_url, address, filters) => {
    spinner.start();
    let data;
    try{
        data = await fetch(base_url+`/accounts/${address}`);
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
    console.log(chalk.bold.cyan(`Account Details`))
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    // console.log(jsonData);
    console.log("Address:\t\t", jsonData["data"]["attributes"]["address"]);
    console.log("Balance:\t\t", (parseInt(jsonData["data"]["attributes"]["balance"])*Math.pow(10, -18)).toString(), "ETH");
    console.log("Transactions:\t\t", jsonData["data"]["attributes"]["nonce"]);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------")); 
    if(filters.exists != true){
        await getLatestTransactions(base_url, address);
    }
    else{
        if(filters.etherTransfers){
            await getEtherTransfers(base_url, address, filters);
        }
        else if(filters.tokenTransfers){
            await getTokenTransfers(base_url, address, filters);
        }
        else if(filters.tokenBalances){
            await getTokenBalances(address);            
        }
    }
    
}



getTokenBalances = async (address) => {
    let spinner = ora("Fetching token balances");
    let url = `https://web3api.io/api/v1/addresses/${address}/tokens`;
    let api_key = "UAK85fcd3c978f3c11801d9dbb5c989a815";
    spinner.start();
    let data;
    try{
        data = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': api_key,
            }
        });
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
    console.log(chalk.bold.cyan(`Token Balances [Count: ${jsonData["payload"]["totalRecords"]}]`))
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    // console.log(jsonData["payload"]["records"]);
    for(let i = 0; i < parseInt(jsonData["payload"]["totalRecords"]); i++){
        console.log("Name:\t\t", jsonData["payload"]["records"][i]["name"]);
        console.log("Symbol:\t\t", jsonData["payload"]["records"][i]["symbol"]);
        console.log("Address:\t", jsonData["payload"]["records"][i]["address"]);
        console.log("Amount Held:\t", (parseInt(jsonData["payload"]["records"][i]["amount"])*Math.pow(10, -1 * parseInt(jsonData["payload"]["records"][i]["decimals"]))).toString());
        console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"));
    }
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}
///////////////////////////////////////////////////////////////////////
// Get details about 10 latest transactions made to/from the account //
///////////////////////////////////////////////////////////////////////
getLatestTransactions = async (base_url, address) => {
    spinner.start();
    let data;
    try{
        data = await fetch(base_url+`/accounts/${address}/transactions`);
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
    let txTypeExplanation = {
        "CallTx": "[transaction calls a contract]",
        "ValueTx": "[transaction is a simple ether transfer]",
        "CreateTx": "[transaction deploys a new contract]"
    }

    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    console.log(chalk.bold.cyan(`Latest Transactions [Count: ${jsonData["meta"]["count"]}]`))
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    // console.log(jsonData);
    for(i = 0; i < jsonData["meta"]["count"]; i++){
        console.log("Transaction Hash:\t", jsonData["data"][i]["id"]);
        console.log("From:\t\t\t", jsonData["data"][i]["relationships"]["from"]["data"]["id"]);
        console.log("To:\t\t\t", jsonData["data"][i]["relationships"]["to"]["data"]["id"]);
        console.log("Transaction Type:\t", jsonData["data"][i]["attributes"]["msgType"], txTypeExplanation[jsonData["data"][i]["attributes"]["msgType"]]);
        console.log("Included Block:\t\t", jsonData["data"][i]["relationships"]["includedInBlock"]["data"]["id"])
        console.log("Timestamp:\t\t", moment.unix(parseInt(jsonData["data"][i]["attributes"]["blockCreationTime"])).local().toString());
        console.log("Gas Used:\t\t", jsonData["data"][i]["attributes"]["txGasUsed"]);
        console.log("Gas Price:\t\t", jsonData["data"][i]["attributes"]["txGasPrice"], "Wei");
        console.log("Transaction Fee:\t", (parseInt(jsonData["data"][i]["attributes"]["fee"])*Math.pow(10, -18)).toString(), "ETH");
        if(jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"] != ""){
            console.log("Function Called:\t", jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"]);
        }
        console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"))
    }
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}


/////////////////////////////////////////////////////////////////////////////////////
// Get details about the token trasfers involving the account according to filters //
/////////////////////////////////////////////////////////////////////////////////////
getTokenTransfers = async (base_url, address, filters) => {
    let nextPageLink = "";
    let jsonData;
    let query_url = `${base_url}/accounts/${address}/tokenTransfers?page[limit]=100`;
    if(filters.symbol != undefined){
        query_url += "&filter[token]=" + tokenDetails[filters.symbol]["address"];
    }
    if(filters.from != undefined){
        query_url += `&filter[from]=${filters.from}`
    }
    if(filters.to != undefined){
        query_url += `&filter[to]=${filters.to}`
    }
    // console.log(query_url);
    do{
        spinner.start();
        let data; 
        try{
            if(nextPageLink == ""){
                data = await fetch(query_url);
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
            console.log(chalk.bold.cyan(`Token Transfers`))
            console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
        }
        for(i = 0; i < jsonData["meta"]["count"]; i++){
            console.log("Transaction Hash:\t", jsonData["data"][i]["relationships"]["transaction"]["data"]["id"]);
            console.log("Token Symbol:\t\t", jsonData["data"][i]["attributes"]["symbol"])
            console.log("Value:\t\t\t", (parseInt(jsonData["data"][i]["attributes"]["value"])*Math.pow(10, -1 * jsonData["data"][i]["attributes"]["decimals"])).toString());          
            console.log("From:\t\t\t", jsonData["data"][i]["relationships"]["from"]["data"]["id"])
            console.log("To:\t\t\t", jsonData["data"][i]["relationships"]["to"]["data"]["id"])
            console.log("Timestamp:\t\t", moment.unix(parseInt(jsonData["data"][i]["attributes"]["blockCreationTime"])).local().toString());
            console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"))
        }
        nextPageLink = query_url + "&page" + jsonData["links"]["next"].substring(jsonData["links"]["next"].indexOf("[next]"));
    }
    while(jsonData["meta"]["page"]["hasNext"] == true);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}


////////////////////////////////////////////////////////////////
// Get details about the ether trasfers involving the account //
////////////////////////////////////////////////////////////////
getEtherTransfers = async (base_url, address, filters) => {
    if(filters.symbol != undefined){
        console.log(chalk.red("Error: Ether Transfers cannot be filtered using token symbol"));
        return;
    }
    let nextPageLink = "";
    let query_url = `${base_url}/accounts/${address}/etherTransfers?page[limit]=100`;
    // console.log(query_url);
    do{
        spinner.start();
        let data; 
        try{
            if(nextPageLink == ""){
                data = await fetch(query_url);
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
            console.log(chalk.bold.cyan(`Ether Transfers`))
            console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
        }
        for(i = 0; i < jsonData["meta"]["count"]; i++){
            if((filters.from != undefined && filters.from == jsonData["data"][i]["relationships"]["from"]["data"]["id"]) ||
                (filters.to != undefined && filters.to == jsonData["data"][i]["relationships"]["to"]["data"]["id"]) ||
                (filters.to == undefined && filters.from == undefined)){
                    console.log("Transaction Hash:\t", jsonData["data"][i]["relationships"]["transaction"]["data"]["id"]);
                    console.log("Value:\t\t\t", (parseInt(jsonData["data"][i]["attributes"]["value"])*Math.pow(10, -18)).toString(), "ETH");          
                    console.log("From:\t\t\t", jsonData["data"][i]["relationships"]["from"]["data"]["id"])
                    console.log("To:\t\t\t", jsonData["data"][i]["relationships"]["to"]["data"]["id"])
                    console.log("Timestamp:\t\t", moment.unix(parseInt(jsonData["data"][i]["attributes"]["blockCreationTime"])).local().toString());
                    console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"))
                }
        }
        nextPageLink = query_url + "&page" + jsonData["links"]["next"].substring(jsonData["links"]["next"].indexOf("[next]"));
    }
    while(jsonData["meta"]["page"]["hasNext"] == true);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}

module.exports = account;