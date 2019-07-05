const moment = require("moment");
const chalk = require("chalk");
require("isomorphic-fetch");

let account = {}

account.getDetails = async (base_url, address) => {
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

    // console.log(jsonData);
    console.log("Address:\t\t", jsonData["data"]["attributes"]["address"]);
    console.log("Balance:\t\t", jsonData["data"]["attributes"]["balance"]);
    console.log("Nonce:\t\t\t", jsonData["data"]["attributes"]["nonce"]);
    
}

module.exports = account;