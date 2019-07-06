const moment = require("moment");
const chalk = require("chalk");
const ora = require('ora');
require("isomorphic-fetch");

const spinner = ora('Fetching data from aleth.io');

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
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    console.log(chalk.bold.cyan(`Account Details`))
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))
    // console.log(jsonData);
    console.log("Address:\t\t", jsonData["data"]["attributes"]["address"]);
    console.log("Balance:\t\t", (parseInt(jsonData["data"]["attributes"]["balance"])*Math.pow(10, -18)).toString(), "ETH");
    console.log("Nonce:\t\t\t", jsonData["data"]["attributes"]["nonce"]);
    console.log(chalk.bold.cyan("---------------------------------------------------------------------------------------------------------------"))    
}

module.exports = account;