// This script looks for accounts holding a specific NFT templates and then send them a token.
// Here, the NFT template is that one (https://wax.atomichub.io/explorer/template/cryptomedals/116899and) and the token is AETHER, the native token of Rplanet 
// In order to work, that script needs: a Wax account, its private key and some tokens to airdrop
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

const privateKeys = ["XXXXX"]; // <- put your key here
const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc("https://wax.eosrio.io", {
    fetch
}); //required to read blockchain state
const api = new Api({
    rpc,
    signatureProvider,
    textDecoder: new TextDecoder(),
    textEncoder: new TextEncoder()
}); //required to submit transactions

// Custom module
const {
    precise
} = require('./utils.js');

// get token (here aether) balance
// then enumerate accounts holding a specific NFT template
(async () => {

    http.request({
                hostname: "wax.api.atomicassets.io", // calling AtomicHub API to retrieve information about a specific template
                path: "/atomicassets/v1/accounts?collection_name=cryptomedals&template_id=116899&page=1&limit=100&order=desc"
            },
            res => {
                let data = ""

                res.on("data", d => {
                    data += d
                })
                res.on("end", () => {
                    owners = JSON.parse(data).data; // all accounts owning the NFT specified before

                    for (i in owners) { //looping through holders
                        payout = (precise(owners[i].assets * 6) + " AETHER").toString(); // here, we give 6.0000 aether per account
                        dest = owners[i].account;
                        console.log(payout, dest);

                        // making the token transfer
                        (async () => {

                            await api.transact({
                                actions: [{
                                    account: 'e.rplanet',
                                    name: 'transfer',
                                    authorization: [{
                                        actor: 'yourAccount', //replace the string accordingly with your Wax account
                                        permission: 'active',
                                    }],
                                    data: {
                                        from: 'yourAccount', //replace the string accordingly with your Wax account
                                        to: dest,
                                        quantity: payout,
                                        memo: '** Hourly airdrop for Destroyer cryptomedal (6 ae/h) **' //custom string that will be visible
                                    }
                                }]
                            }, {
                                blocksBehind: 3,
                                expireSeconds: 120,
                            });
                        })();
                    }
                })
            }
        )
        .end()

})();