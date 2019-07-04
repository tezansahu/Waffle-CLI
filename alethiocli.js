#!/usr/bin/env node

const program = require('commander');
const fs = require("fs");
const path = require("path");
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require("inquirer");
const ora = require('ora');


const contract = require("./modules/contractUtils");
const transaction = require("./modules/transactionUtils");
const account = require("./modules/accountUtils");

const spinner = ora('Fetching data from aleth.io');
let base_url;

// {"API_KEY":"main_k5ua5idae7skpuciub5afanpxys3q"}

// ---------------------Define functions necessary for the CLI Tool-------------------------------

///////////////////////////////////////////////////////////////////////////////////
// Check if API Key of the user exists. If not, store the API Key for future use //
///////////////////////////////////////////////////////////////////////////////////
async function checkAPIkey(){
    return new Promise(async resolve => {
        fs.readFile("./apiKey.json", "utf8", async (err, jsonString) => {
            if(err){
                let api_key = await inquirer.prompt({
                    name: "API_KEY",
                    type: "input",
                    message: "Please set your API Key first: "
                })
                base_url = "https://" + api_key.API_KEY + ":@api.aleth.io/v1";
                fs.writeFile("./apiKey.json", JSON.stringify(api_key), err =>{
                    if(err){
                        console.error(chalk.red("Sorry! Error storing API Key"));
                        resolve(false);
                    }
                    console.log(chalk.bold.cyan("You API Key has been saved!\n"));
                    resolve(true);
                })
            }
            else{
                let api_key_data = JSON.parse(jsonString);
                base_url = "https://" + api_key_data.API_KEY + ":@api.aleth.io/v1";
                resolve(true);
            }
        })
    })
}


////////////////////////////////////////////////////////
// Command to query details about a specific contract //
////////////////////////////////////////////////////////
program
    .command("contract <address>")
    .description("Get general details about a contract deployed at the provided address")
    .option('-t, --transactions <num>', "Show details about <num> latest transactions to/from the contract")
    .option("-b, --block", "Show details about the block where the contract was created")
    .option("-c, --creationTxn", "Show details about the Contract Creation Transaction")
    .option("-f, --transactionsFrom <accFrom>", "Show details of transactions made from <accFrom> to the contract")
    .option("-T, --transactionsTo <accTo>", "Show details of transactions made to <accTo> by the contract")
    .parse(process.argv)
    .action(async (address, options) => {
        if(options.transactionsFrom != undefined && options.transactionsTo != undefined){
            console.error(chalk.red("Cannot use from & to filters simultaneously!"));
            return;
        }

        if(options.transactions != undefined){
            if(parseInt(options.transactions) < 0){
                console.error(chalk.red("Number of transactions cannot be less than 0"));
                return;
            }
            contract.getTransactions(base_url, address, options.transactions, spinner);
        }
        else if(options.block){
            contract.getBlock(base_url, address, spinner);
        }
        else if(options.creationTxn){
            contract.getCreationTxn(base_url, address, spinner);
        }
        else if(options.transactionsFrom != undefined){
            contract.getTransactionsFrom(base_url, address, options.transactionsFrom, spinner);
        }
        else if(options.transactionsTo != undefined){
            contract.getTransactionsTo(base_url, address, options.transactionsTo, spinner);
        }
        else{
            contract.getDetails(base_url, address, spinner);
        }
        
    })

program
    .command("checkHashType <hash>")
    .description("Checks whether the provided hash is an external account, contract account, txn or a block hash")
    .action(async (hash) => {
        spinner.start();
        const e = await fetch(base_url+`/accounts/${hash}`);
        const c = await fetch(base_url+`/contracts/${hash}`);
        const t = await fetch(base_url+`/transactions/${hash}`);
        const b = await fetch(base_url+`/blocks/${hash}`);
        spinner.stop();
        let es = (await e.status);
        let cs = (await c.status);
        let ts = (await t.status);
        let bs = (await b.status);

        if(es == 200 && cs == 200) {
            console.log(chalk.bold.cyan('Contract Account'));
            console.log(`Use ` + chalk.italic.yellow(`'alethiocli contract ${hash} [options]'`) +` to get more details\n`);
        }
        else if (es == 200) {
            console.log(chalk.bold.cyan('External(User) Account'));
            console.log(`Use ` + chalk.italic.yellow(`'alethiocli account ${hash} [options]'`) +` to get more details\n`);
        }
        else if (ts == 200) {
            console.log(chalk.bold.cyan('Transaction'));
            console.log(`Use ` + chalk.italic.yellow(`'alethiocli transaction ${hash} [options]'`) +` to get more details\n`);
        }
        else if (bs == 200) {
            console.log(chalk.bold.cyan('Block Hash'));
            console.log(`Use ` + chalk.italic.yellow(`'alethiocli block ${hash} [options]'`) +` to get more details\n`);
        }
    })
    


program
    .command("transaction <hash>")
    .description("Get general details about the transaction given by the hash")
    // .options()
    .parse(process.argv)
    .action(async (hash) => {
        transaction.getDetails(base_url, hash, spinner);
    })


program
    .command("account <address>")
    .description("Get general details about the account address")
    // .options()
    .parse(process.argv)
    .action(async (address) => {
        account.getDetails(base_url, address, spinner);
    })


/////////////////////////////////////////////////////////////////////////////////////////
// Parse the command (& options) entered by the user and call the appropriate function //
/////////////////////////////////////////////////////////////////////////////////////////
async function run(){
    clear();
    console.log(
        chalk.yellow(
            figlet.textSync('aleth.io CLI', { horizontalLayout: 'full' })
        )
    );
    let api_key_verified = await checkAPIkey();
    if(api_key_verified == true){
        program
        .version('0.1.0')
        .parse(process.argv)
    }
}

run()

