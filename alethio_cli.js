const program = require('commander');
require("isomorphic-fetch");

const base_url = "https://main_k5ua5idae7skpuciub5afanpxys3qkep:@api.aleth.io/v1";
// const API_key = "main_k5ua5idae7skpuciub5afanpxys3qkep";

// Define functions necessary for the CLI Tool


// Template for a CLI command
program
    .command("getLatestBlockData")
    .description("")
    // .option("")
    .action(async () => {
        const data = await fetch(base_url+"/blocks/latest");
        console.log(await data.json());
    })


program
    .version('0.1.0')
    .parse(process.argv)