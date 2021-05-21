// This script fetches all mining attempts on an Alien Worlds land. Then, a NFT is minted directly to miners chosen randomly
// In order to work, that script needs: a Wax account that is authorized to mint NFT from an NFT collection, its private key and the address of an Alien Worlds landowner
// Author: mann000 <t.me/mann0000>, tips appreciated (dsnqy.wam) 

// Dependencies loading
const {
    Api,
    JsonRpc
} = require('eosjs');
const {
    JsSignatureProvider
} = require('eosjs/dist/eosjs-jssig');
const fetch = require('node-fetch');
const {
    TextDecoder,
    TextEncoder
} = require('util');
const http = require("http");
const https = require("https");
const request = require("request");
const {
    precise
} = require('./utils.js'); //Import from custom module

const privateKeys = ["XXXXX"]; // <- put your key here
const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc('https://wax.eosrio.io', {
    fetch
}); //required to read blockchain state
const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
}); //required to submit transactions

// Getting current date
var d = new Date();
var now = d.toISOString();

var date = new Date();
date.setHours(date.getHours() - 1); // Needed for fetching last hour miners

var pastHour = date.toISOString();

// Replace nfttreasury1 with the account owning your land
const url = "https://api.alienworlds.io/v1/alienworlds/mines?limit=100&landowner=nfttreasury1&from=" + pastHour + "&to=" + now;

console.log(url);

request(
    url,
    function(error, response, body) {
        let miners = JSON.parse(body);
        miners = miners.results;// all miners in the last hour
        for (i in miners) {// Looping through all miner
			
			// Do the draw for that miner
            var chance = Math.floor(Math.random() * 100);
            console.log(miners[i].miner, chance);

            if (chance == 99) { // 1% chance

				// The hard part: the NFT is minted directly to the miner's account
                (async () => {

                    await api.transact({
                        actions: [{
                            account: 'atomicassets',
                            name: 'mintasset',
                            authorization: [{
                                actor: 'nfttreasury1',
                                permission: 'active',
                            }],
                            data: {
                                authorized_minter: "yourAccount", // this account must be added to your collection authorized account
                                collection_name: "cryptomedals",//replace with your collection
                                schema_name: "medal",//same, adapt accordingly
                                template_id: "70648", // Merit Award, see here: https://wax.atomichub.io/explorer/template/cryptomedals/70648
                                new_asset_owner: miners[i].miner,// NFT recipient
                                immutable_data: [],
                                mutable_data: [],
                                tokens_to_back: []
                            }
                        }]
                    }, {
                        blocksBehind: 3,
                        expireSeconds: 120,
                    });
                })();


            }
        }
    });