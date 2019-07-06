#!/usr/bin/env node

const program = require('commander');
const fs = require("fs");
const path = require("path");
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require("inquirer");
const ora = require('ora');
const moment = require("moment");

const contract = require("./modules/contractUtils");
const transaction = require("./modules/transactionUtils");
const account = require("./modules/accountUtils");
const block = require("./modules/blockUtils");
const ensUtils = require("./modules/ensUtils");

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
    .option("-b, --block", "Show details about the block where the contract was created")
    .option("-c, --creationTxn", "Show details about the Contract Creation Transaction")
    .option("-E, --event <event_signature>", "Aggregate events logged with the same <event_signature> (see examples)")
    .option("-f, --transactionsFrom <account>", "Show details of transactions made from <account> to the contract")
    .option("-l, --logs", "Show details about <num> latest Log Entries (Events) associated with the contract")
    .option("-m, --messages", "Show details about <num> latest Contract Messages (Internal Transactions)")
    .option("-n, --number <num>", "Limit the search of transactions, messages, event logs, etc. to <num> latest entries")
    .option("-s, --start <timeStamp>", "Date & Time (local) in RFC2822 format (see examples) marking the beginning of the range to search transactions")
    .option("-e, --end <timeStamp>", "Date & Time (local) in RFC2822 format (see examples) marking the end of the range to search transactions")
    .option('-t, --transactions', "Show details about <num> latest transactions to/from the contract")
    .option("-T, --transactionsTo <account>", "Show details of transactions made to <account> by the contract")
    .on("--help", async () => {
        console.log("\nNote: " + chalk.italic("Without the '-n' flag, the default number of transaction, messages, or events logs displayed is 10"));
        console.log("\nExamples:");
        
        console.log("   $ alethiocli contract 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359 -t ");
        console.log(chalk.gray("   // Displays 10 latest transactions to the contract\n"));
        console.log("   $ alethiocli contract 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359 -e 'Transfer(address,address,value)' -n 50 ");
        console.log(chalk.gray("   // Displays 50 latest events logged by the contract with the given signature\n"))
        console.log("   $ alethiocli contract 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359 -f 0x2461AD11C10Ac35Dd8aDAfD6B0Af3AacFAf1C3f5 -n 15 ");
        console.log(chalk.gray("   // Displays 15 latest transactions to the contract made by given account\n"));
        console.log("   $ alethiocli contract 0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359 -m -s '5 Jul 2019 11:00' -e '5 Jul 2019 13:30'");
        console.log(chalk.gray("   // Displays contract messages (internal transaction) occuring between 11:00 am & 1:30 pm on 5 July 2019 (according to local timezone)\n"));
    })
    .action(async (address, options) => {
        if(options.transactionsFrom != undefined && options.transactionsTo != undefined){
            console.error(chalk.red("Error: Cannot use from & to filters simultaneously!\n"));
            return;
        }

        if((options.start != undefined && options.end == undefined) || (options.start ==undefined && options.end != undefined)){
            console.error(chalk.red("Error: Both start & end timeStamps should be used together"));
            return;
        }

        if(options.start != undefined && options.end != undefined && options.number != undefined){
            console.error(chalk.red("Error: Cannot use number of transactions with start & end timestamps"));
            return;
        }

        await contract.getDetails(base_url, address);

        if(options.transactions){
            if(options.number != undefined){
                if(parseInt(options.number) < 0){
                    console.error(chalk.red("Number of transactions cannot be less than 0"));
                    return;
                }
                await contract.getTransactions(base_url, address, options.number);
            }
            if(options.start != undefined && options.end != undefined){
                let start = moment(new Date(options.start).toUTCString()).valueOf()
                let end = moment(new Date(options.end).toUTCString()).valueOf()
                // console.log(start, end);
                contract.getTransactionsInRange(base_url, address, start, end)
            }
            await contract.getTransactions(base_url, address, 10);
        }
        
        if(options.block){
            await contract.getBlock(base_url, address);
        }
        
        if(options.creationTxn){
            await contract.getCreationTxn(base_url, address);
        }
        
        if(options.transactionsFrom){
            if(!options.transactionsFrom.startsWith("0x") && options.transactionsFrom.length != 42){
                let fromAcc = await ensUtils.getAddress(options.transactionsFrom);
                if(fromAcc == "0x0000000000000000000000000000000000000000"){
                    console.log(chalk.red("Error: ENS name not found!\n"));
                    return;
                }
                await contract.getTransactionsFrom(base_url, address, fromAcc);  
                  
            }
            else{
                await contract.getTransactionsFrom(base_url, address, options.transactionsFrom);
            }
            
        }
        else if(options.transactionsTo){
            if(!options.transactionsTo.startsWith("0x") && options.transactionsTo.length != 42){
                let toAcc = await ensUtils.getAddress(options.transactionsTo);
                if(toAcc == "0x0000000000000000000000000000000000000000"){
                    console.log(chalk.red("Error: ENS name not found!\n"));
                    return;
                }
                await contract.getTransactionsFrom(base_url, address, toAcc);    
            }
            else{
                await contract.getTransactionsTo(base_url, address, options.transactionsTo);
            }
        }

        if(options.messages){
            await contract.getMessages(base_url, address, options.number || 10);
        }

        if(options.logs){
            await contract.getLogEntries(base_url, address, options.number || 10);
        }

        if(options.event != undefined){
            await contract.aggregateEventBySignature(base_url, address, options.event, options.number || 10);
        }


    })

program
    .command("search <query>")
    .description("Checks whether the queried entity is an external account, contract account, transaction or a block hash")
    .action(async (query) => {
        spinner.start();
        const e = await fetch(base_url+`/accounts/${query}`);
        const c = await fetch(base_url+`/contracts/${query}`);
        const t = await fetch(base_url+`/transactions/${query}`);
        const b = await fetch(base_url+`/blocks/${query}`);
        spinner.stop();
        let es = (await e.status);
        let cs = (await c.status);
        let ts = (await t.status);
        let bs = (await b.status);

        if(es == 200 && cs == 200) {
            console.log(chalk.bold.cyan('Contract Account'));
            console.log(`Use ` + chalk.italic.yellow(`'alethiocli contract ${query} [options]'`) +` to get more details\n`);
        }
        else if (es == 200) {
            console.log(chalk.bold.cyan('External(User) Account'));
            console.log(`Use ` + chalk.italic.yellow(`'alethiocli account ${query} [options]'`) +` to get more details\n`);
        }
        else if (ts == 200) {
            console.log(chalk.bold.cyan('Transaction'));
            console.log(`Use ` + chalk.italic.yellow(`'alethiocli transaction ${query} [options]'`) +` to get more details\n`);
        }
        else if (bs == 200) {
            console.log(chalk.bold.cyan('Block Hash'));
            console.log(`Use ` + chalk.italic.yellow(`'alethiocli block ${query} [options]'`) +` to get more details\n`);
        }
        else{
            console.error(chalk.red("Error: Incorrect query!\n"))
        }
    })
    


program
    .command("transaction <hash>")
    .description("Get general details about the transaction given by the hash")
    // .options()
    .action(async (hash) => {
        transaction.getDetails(base_url, hash);
    })


program
    .command("account <address>")
    .description("Get general details about the account address")
    // .options()
    .action(async (address) => {
        if(!address.startsWith("0x") && address.length != 42){
            let ethAddr = await ensUtils.getAddress(address);
            if(ethAddr == "0x0000000000000000000000000000000000000000"){
                console.log(chalk.red("Error: ENS name not found!\n"));
                return;
            }
            await account.getDetails(base_url, ethAddr); 
        }
        else{
            await account.getDetails(base_url, address);
        }
        
    })


program
    .command("block <identifier>")
    .description("Get general details about the block given by the block hash or block number")
    // .options()
    .action(async (identifier) => {
        block.getDetails(base_url, identifier);
    })

program.on("--help", function(){
    console.log("\n");
    console.log(chalk.italic.cyan("This is a CLI tool for Ethereum Developers, created by Tezan Sahu & Smit Rajput, using Aleth.io\n"));
})


// program.parse(process.argv)
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
        .version("0.0.1")
        .parse(process.argv)
    }
}

run()

