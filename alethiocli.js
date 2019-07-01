#!/usr/bin/env node

const program = require('commander');
const fs = require("fs");
const path = require("path");
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer = require("inquirer");
const ora = require('ora');
require("isomorphic-fetch");

const spinner = ora('Fetching data from Aleth.io');
let base_url;

// {"API_KEY":"main_k5ua5idae7skpuciub5afanpxys3q

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
    // .option("")
    .action(async () => {
        spinner.start();
        const data = await fetch(base_url+"/blocks/latest");
        spinner.stop();
        console.log(await data.json());
    })

async function run(){
    clear();
    console.log(
        chalk.yellow(
            figlet.textSync('Aleth.io CLI', { horizontalLayout: 'full' })
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

