const moment = require("moment");
const chalk = require("chalk");
require("isomorphic-fetch");

let contract = {}

////////////////////////////////////////////
// Get generic details about the contract //
////////////////////////////////////////////
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

    if(jsonData["errors"] != undefined){
        for(let i = 0; i < jsonData["errors"].length; i++){
            spinner.stop();
            console.error(chalk.red("Error " + jsonData["errors"][i]["status"] + ": " + jsonData["errors"][i]["title"]))
            return;
        }
    }

    if(jsonData["data"]["relationships"]["token"]["data"] != null){
        tokenData = await fetch(base_url + "/tokens/" + jsonData["data"]["relationships"]["token"]["data"]["id"])
        tokenDataJSON = await tokenData.json();
    }
    spinner.stop();
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    console.log(chalk.bold.cyan("Basic Contract Information"))
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    console.log("Address:\t\t", jsonData["data"]["attributes"]["address"]);
    console.log("Balance:\t\t", jsonData["data"]["attributes"]["balance"]);
    console.log("Creation Time:\t\t", moment.unix(parseInt(jsonData["data"]["attributes"]["createdAtTimestamp"])).local().toString());
    console.log("Constructor Arguments:\t", jsonData["data"]["attributes"]["constructorArgs"])
    if(jsonData["data"]["relationships"]["token"]["data"] == null){
        console.log("Token Associated:\t None", )
    }
    else{

        console.log("Token Associated:\t", tokenDataJSON["data"]["attributes"]["name"], "(" + tokenDataJSON["data"]["attributes"]["symbol"] + ")");
        console.log("Token Type:\t\t", ...tokenDataJSON["data"]["attributes"]["tokenTypes"]);
        console.log("Total Supply:\t\t", tokenDataJSON["data"]["attributes"]["totalSupply"]);
    }
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}


///////////////////////////////////////////////////////////////
// Get details about the block where the contract is included//
///////////////////////////////////////////////////////////////
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
    if(jsonData["errors"] != undefined){
        for(let i = 0; i < jsonData["errors"].length; i++){
            console.error(chalk.red("Error " + jsonData["errors"][i]["status"] + ": " + jsonData["errors"][i]["title"]))
            return;
        }
    }
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    console.log(chalk.bold.cyan("Block Details"))
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    console.log("Block Number:\t\t", jsonData["data"]["attributes"]["number"]);
    console.log("Block Hash:\t\t", jsonData["data"]["attributes"]["blockHash"]);
    console.log("Creation Time\t\t", moment.unix(parseInt(jsonData["data"]["attributes"]["blockCreationTime"])).local().toString());
    console.log("Block Difficulty:\t", jsonData["data"]["attributes"]["blockDifficulty"]);
    console.log("Block Reward:\t\t", (parseInt(jsonData["data"]["attributes"]["blockBeneficiaryReward"])*Math.pow(10, -18)).toString(), "ETH");
    console.log("Mined By:\t\t", jsonData["data"]["attributes"]["hasBeneficiaryAlias"]);
    console.log("Block Gas Used:\t\t", jsonData["data"]["attributes"]["blockGasUsed"]);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}


////////////////////////////////////////////////////////
// Get details about the contract creation transaction//
////////////////////////////////////////////////////////
contract.getCreationTxn = async (base_url, address, spinner) => {
    spinner.start();
    let data; 
    try{   
        data = await fetch(`${base_url}/contracts/${address}/createdAtTransaction`);
    }
    catch{
        spinner.stop()
        console.log(chalk.red("Error fetching data! Please try again later"));
        return;
    };
    let jsonData = await data.json();
    spinner.stop();
    if(jsonData["errors"] != undefined){
        for(let i = 0; i < jsonData["errors"].length; i++){
            console.error(chalk.red("Error " + jsonData["errors"][i]["status"] + ": " + jsonData["errors"][i]["title"]))
            return;
        }
    }
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    console.log(chalk.bold.cyan("Contract Creation Transaction Details"))
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))

    console.log("Transaction Hash:\t", jsonData["data"]["attributes"]["txHash"]);
    console.log("Included Block:\t\t", jsonData["data"]["relationships"]["includedInBlock"]["data"]["id"])
    console.log("Creation Time\t\t", moment.unix(parseInt(jsonData["data"]["attributes"]["blockCreationTime"])).local().toString());
    console.log("Creator Account:\t", jsonData["data"]["relationships"]["from"]["data"]["id"]);
    console.log("Gas Used:\t\t", jsonData["data"]["attributes"]["txGasUsed"]);
    console.log("Gas Price:\t\t", jsonData["data"]["attributes"]["txGasPrice"], "Wei");
    console.log("Transaction Fee:\t", (parseInt(jsonData["data"]["attributes"]["fee"])*Math.pow(10, -18)).toString(), "ETH");
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}


//////////////////////////////////////////////////////////////////
// Get details about the transactions made to/from the contract //
//////////////////////////////////////////////////////////////////
contract.getTransactions = async (base_url, address, num, spinner) => {
    let nextPageLink = "";
    let jsonData;
    num = parseInt(num);
    do{
        spinner.start();
        let data; 
        try{   
            if(num > 100){
                if(nextPageLink == ""){
                    data = await fetch(base_url+`/contracts/${address}/transactions/?page[limit]=100`);
                }
                else{
                    data = await fetch(nextPageLink);
                }
            }
            else{
                if(nextPageLink == ""){
                    data = await fetch(base_url+`/contracts/${address}/transactions/?page[limit]=` + num.toString());
                }
                else{
                    data = await fetch(nextPageLink.replace("page[limit]=100", "page[limit]="+num.toString()));
                }
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
            console.log(chalk.bold.cyan("Transactions"))
            console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
        }
        
        for(i = 0; i < jsonData["meta"]["count"]; i++){
            console.log("Transaction Hash:\t", jsonData["data"][i]["id"]);
            console.log("From:\t\t\t", jsonData["data"][i]["relationships"]["from"]["data"]["id"]);
            console.log("To:\t\t\t", jsonData["data"][i]["relationships"]["to"]["data"]["id"]);
            console.log("Timestamp:\t\t", moment.unix(parseInt(jsonData["data"][i]["attributes"]["blockCreationTime"])).local().toString());
            console.log("Gas Used:\t\t", jsonData["data"][i]["attributes"]["txGasUsed"]);
            console.log("Gas Price:\t\t", jsonData["data"][i]["attributes"]["txGasPrice"], "Wei");
            console.log("Transaction Fee:\t", (parseInt(jsonData["data"][i]["attributes"]["fee"])*Math.pow(10, -18)).toString(), "ETH");            
            if(jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"] != ""){
                console.log("Function Called:\t", jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"]);
            }
            console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"))
        }
        num -= 100;
        nextPageLink = `${base_url}/contracts/${address}/transactions?page[limit]=100&page` + jsonData["links"]["next"].substring(jsonData["links"]["next"].indexOf("[next]"));
    }
    while(num > 0 && jsonData["meta"]["page"]["hasNext"] == true)
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}


/////////////////////////////////////////////////////////////////////////////////////
// Get details about the transactions made from a specific account to the contract //
/////////////////////////////////////////////////////////////////////////////////////
contract.getTransactionsFrom = async (base_url, address, account, spinner) => {
    let nextPageLink = "";
    let jsonData;
    do{
        spinner.start();
        let data; 
        try{
            if(nextPageLink == ""){
                data = await fetch(`${base_url}/contracts/${address}/transactions?filter[from]=${account}&page[limit]=100`);
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
            console.log(chalk.bold.cyan("Transactions"))
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
        nextPageLink = `${base_url}/contracts/${address}/transactions?filter[from]=${account}&page[limit]=100&page` + jsonData["links"]["next"].substring(jsonData["links"]["next"].indexOf("[next]"));
    }
    while(jsonData["meta"]["page"]["hasNext"] == true);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    
}

/////////////////////////////////////////////////////////////////////////////////////
// Get details about the transactions made to a specific account from the contract //
/////////////////////////////////////////////////////////////////////////////////////
contract.getTransactionsTo = async (base_url, address, account, spinner) => {
    let nextPageLink = "";
    let jsonData;
    do{
        spinner.start();
        let data; 
        try{
            if(nextPageLink == ""){
                data = await fetch(`${base_url}/contracts/${address}/transactions?filter[to]=${account}&page[limit]=100`);
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
            console.log(chalk.bold.cyan("Transactions"))
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
        nextPageLink = `${base_url}/contracts/${address}/transactions?filter[to]=${account}&page[limit]=100&page` + jsonData["links"]["next"].substring(jsonData["links"]["next"].indexOf("[next]"));
    }
    while(jsonData["meta"]["page"]["hasNext"] == true);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}


//////////////////////////////////////////////////////////////////////////
// Get details about the contract messages associated with the contract //
//////////////////////////////////////////////////////////////////////////
contract.getMessages = async (base_url, address, num, spinner) => {
    let nextPageLink = "";
    let jsonData;
    num = parseInt(num);
    do{
        spinner.start();
        let data; 
        try{   
            if(num > 100){
                if(nextPageLink == ""){
                    data = await fetch(base_url+`/contracts/${address}/contractMessages/?page[limit]=100`);
                }
                else{
                    data = await fetch(nextPageLink);
                }
            }
            else{
                if(nextPageLink == ""){
                    data = await fetch(base_url+`/contracts/${address}/contractMessages/?page[limit]=` + num.toString());
                }
                else{
                    data = await fetch(nextPageLink.replace("page[limit]=100", "page[limit]="+num.toString()));
                }
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
            console.log(chalk.bold.cyan("Contract Messages"))
            console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
        }
        
        for(i = 0; i < jsonData["meta"]["count"]; i++){
            console.log("Contract Message Hash:\t", jsonData["data"][i]["id"].replace("msg:", "").substring(0, 66));
            console.log("Message Type:\t\t", jsonData["data"][i]["attributes"]["msgType"]);
            console.log("From:\t\t\t", jsonData["data"][i]["relationships"]["from"]["data"]["id"]);
            console.log("To:\t\t\t", jsonData["data"][i]["relationships"]["to"]["data"]["id"]);
            console.log("Originator:\t\t", jsonData["data"][i]["relationships"]["originator"]["data"]["id"]);
            console.log("Parent Transaction:\t", jsonData["data"][i]["relationships"]["transaction"]["data"]["id"])
            console.log("Message Index:\t\t", jsonData["data"][i]["attributes"]["cmsgIndex"]);
            console.log("Timestamp:\t\t", moment.unix(parseInt(jsonData["data"][i]["attributes"]["blockCreationTime"])).local().toString());
            console.log("Gas Used:\t\t", jsonData["data"][i]["attributes"]["msgGasUsed"]);
            console.log("Gas Price:\t\t", jsonData["data"][i]["attributes"]["txGasPrice"], "Wei");
            console.log("Transaction Fee:\t", (parseInt(jsonData["data"][i]["attributes"]["fee"])*Math.pow(10, -18)).toString(), "ETH");            
            if(jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"] != ""){
                console.log("Function Called:\t", jsonData["data"][i]["attributes"]["msgPayload"]["funcDefinition"]);
            }
            console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"))
        }
        num -= 100;
        nextPageLink = `${base_url}/contracts/${address}/contractMessages?page[limit]=100&page` + jsonData["links"]["next"].substring(jsonData["links"]["next"].indexOf("[next]"));
    }
    while(num > 0 && jsonData["meta"]["page"]["hasNext"] == true)
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}

//////////////////////////////////////////////////////////////////////////
// Get details about the log entries (events) triggered by the contract //
//////////////////////////////////////////////////////////////////////////
contract.getLogEntries = async (base_url, address, num, spinner) => {
    let nextPageLink = "";
    let jsonData;
    num = parseInt(num);
    do{
        spinner.start();
        let data; 
        try{   
            if(num > 100){
                if(nextPageLink == ""){
                    data = await fetch(base_url+`/contracts/${address}/logEntries/?page[limit]=100`);
                }
                else{
                    data = await fetch(nextPageLink);
                }
            }
            else{
                if(nextPageLink == ""){
                    data = await fetch(base_url+`/contracts/${address}/logEntries/?page[limit]=` + num.toString());
                }
                else{
                    data = await fetch(nextPageLink.replace("page[limit]=100", "page[limit]="+num.toString()));
                }
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
            console.log(chalk.bold.cyan("Contract Log Entries"))
            console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
        }
        
        for(i = 0; i < jsonData["meta"]["count"]; i++){
            if(jsonData["data"][i]["attributes"]["eventDecoded"]["event"] != ""){
                console.log("Event Triggered:\t", jsonData["data"][i]["attributes"]["eventDecoded"]["event"]);
            }
            console.log("Event (Topic0):\t\t", jsonData["data"][i]["attributes"]["eventDecoded"]["topic0"])
            for(j = 0; j < jsonData["data"][i]["attributes"]["eventDecoded"]["inputs"].length; j++){
                let input = jsonData["data"][i]["attributes"]["eventDecoded"]["inputs"][j];
                console.log(`Input ${j+1}:\t\t`, `${input["value"]}\t[${input["name"]} (${input["type"]})]`);
            }
            console.log("Logged By (Contract):\t", jsonData["data"][i]["relationships"]["loggedBy"]["data"]["id"]);
            console.log("Parent Transaction:\t", jsonData["data"][i]["relationships"]["transaction"]["data"]["id"])
            console.log("Block Included:\t\t", jsonData["data"][i]["relationships"]["block"]["data"]["id"])
            if(jsonData["data"][i]["relationships"]["contractMessage"]["data"] != null){
                console.log("Contract Message Hash:\t", jsonData["data"][i]["relationships"]["contractMessage"]["data"]["id"].replace("msg:", "").substring(0, 66));
            }
            console.log(chalk.cyan("---------------------------------------------------------------------------------------------------------"))
        }
        num -= 100;
        nextPageLink = `${base_url}/contracts/${address}/logEntries?page[limit]=100&page` + jsonData["links"]["next"].substring(jsonData["links"]["next"].indexOf("[next]"));
    }
    while(num > 0 && jsonData["meta"]["page"]["hasNext"] == true)
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
}


module.exports = contract;