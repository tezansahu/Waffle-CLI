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

const spinner = ora('Fetching data from aleth.io');
let base_url;

// {"API_KEY":"main_k5ua5idae7skpuciub5afanpxys3q"}

// ---------------------Define functions necessary for the CLI Tool-------------------------------
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


// Template for a CLI command
program
    .command("getLatestBlockData")
    .description("")
    .action(async () => {
        spinner.start();
        const data = await fetch(base_url+"/blocks/latest");
        spinner.stop();
        console.log(await data.json());
    })

program
    .command("getContractDetails <address>")
    .description("Get general details about a contract deployed at the provided address")
    .option('-t, --transactions <num>', "Show details about <num> latest transactions to/from the contract")
    .option("-b, --block", "Show details about the block where the contract was created")
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

