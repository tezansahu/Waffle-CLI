const moment = require("moment");
const chalk = require("chalk");
require("isomorphic-fetch");

let account = {}

account.getDetails = async (base_url, address, spinner) => {
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

    // console.log(jsonData["data"]["attributes"]["msgPayload"]);

    // console.log("Transaction Hash:\t", jsonData["data"]["attributes"]["txHash"]);
    // console.log("From:\t\t\t", jsonData["data"]["relationships"]["from"]["data"]["id"]);
    // console.log("To:\t\t\t", jsonData["data"]["relationships"]["to"]["data"]["id"]);
    // console.log("Transaction Type:\t", jsonData["data"]["attributes"]["msgType"], txTypeExplanation[jsonData["data"]["attributes"]["msgType"]])
    // console.log("Included Block:\t\t", jsonData["data"]["relationships"]["includedInBlock"]["data"]["id"])
    // console.log("Timestamp:\t\t", moment.unix(parseInt(jsonData["data"]["attributes"]["blockCreationTime"])).local().toString());
    // console.log("Gas Used:\t\t", jsonData["data"]["attributes"]["txGasUsed"]);
    // console.log("Gas Price:\t\t", jsonData["data"]["attributes"]["txGasPrice"], "Wei");
    // console.log("Transaction Fee:\t", (parseInt(jsonData["data"]["attributes"]["fee"])*Math.pow(10, -18)).toString(), "ETH");
    // if(jsonData["data"]["attributes"]["msgPayload"]["funcDefinition"] != ""){
    //     console.log("Function Called:\t", jsonData["data"]["attributes"]["msgPayload"]["funcDefinition"]);
    // }
    // if(jsonData["data"]["attributes"]["msgPayload"]["raw"] != ""){
    //     console.log("Raw Data Payload:\t", jsonData["data"]["attributes"]["msgPayload"]["raw"]);
    // }
    
}

module.exports = account;