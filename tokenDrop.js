// This script looks for accounts holding a specific NFT templates and then send them a token.
// Here, the NFT template is that one (https://wax.atomichub.io/explorer/template/cryptomedals/116899and) and the token is AETHER, the native token of Rplanet 
// In order to work, that script needs: a Wax account, its private key and some tokens to airdrop
// Author: mann000 <t.me/mann0000>, tips appreciated (dsnqy.wam) 

// Dependencies loading
const request = require("request");
const {
	Api,
	JsonRpc
} = require('eosjs');
const {
	JsSignatureProvider
} = require('eosjs/dist/eosjs-jssig'); // development only
const fetch = require('node-fetch'); //node only
const {
	TextDecoder,
	TextEncoder
} = require('util'); //node only

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
const {
	precise
} = require('./utils.js'); // Custom module loading

// Will contain the payload (i.e, actions you will make) send to the RPC relay
var payload = [];

var url = "https://wax.api.atomicassets.io/atomicassets/v1/accounts?collection_name=cryptomedals&template_id=116899&page=1&limit=100&order=asc"; // For searching all accounts holding the A'ar Quintas Badge from cryptomedals collection

request(
	url, // Make the API call to AtomicHub
	function(error, response, body) {
		var owners = JSON.parse(body).data; // all accounts owning the NFT specified before

		for (owner in owners) { //looping through holders
			console.log(owner, owners[owner].account);
			payload.push({
				account: 'e.rplanet',
				name: 'transfer',
				authorization: [{
					actor: 'yourAccount', //replace the string accordingly with your Wax account
					permission: 'active',
				}],
				data: {
					from: 'yourAccount', //replace the string accordingly with your Wax account
					to: owners[owner].account,
					quantity: (precise(owners[owner].assets * 6) + " AETHER").toString(), // here, we give 6 AETHER per NFT to each holder
					memo: '** Random airdrop for Destroyer cryptomedal (6 ae/h) **' //custom string that will be visible
				}
			});
		}
		// Make the call
		(async () => {

			await api.transact({
				actions: payload
			}, {
				blocksBehind: 3,
				expireSeconds: 120,
			});
		})();
	});