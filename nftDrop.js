// This script fetches first all mining attempts on an Alien Worlds land. 
// Then, it handles NFT distribution through a two floors system: the script determines if a miner wins a NFT and then choose among a "loot pool" what NFT he gets. After that, the NFT is minted directly to miners chosen randomly
// In that script, a miner has 1% chance to win a cryptomedal among three possible templates, having respectively 70%, 20% and 10% of being won. You can indeed do a bigger and smaller loot pool and adjust chances.
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
const request = require("request");

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
date.setHours(date.getHours() - 1); // Needed for fetching last hour miners, replace 1 with number of hours needed (24 -> one day back)

var pastHour = date.toISOString();

// Replace nfttreasury1 with the account owning your land
const url = "https://api.alienworlds.io/v1/alienworlds/mines?limit=100&landowner=nfttreasury1&from=" + pastHour + "&to=" + now;

// This array must contain templates and schemas of the NFT you want to drop
// In this example, it's cryptomedals from the schema "medal" (Worker's Medal, Merit Award and Operational Service Medal), see the first one here: https://wax.atomichub.io/explorer/template/cryptomedals/70648
var nftRef = [
	["70647", "medal"],
	["70648", "medal"],
	["80654", "medal"]
];
var probabilities = [70, 20, 10]; // probabilities associated to each item. in that example, it's in % but you can adjust (ex: 700, 200, 99, 1 if you want to handle smaller probabilities)

var lootPool = []; // this table will be your loot pool. In this example, it will contain 70 of the first item, 20 of the second, 10 of the last. The miner will get one of them, randomly

for (item in nftRef) { // Populate the loot pool by looping throught templates and adding them
	for (var i = 0; i < probabilities[item]; i++) {
		lootPool.push(nftRef[item]);
	}
};

// Will contain the payload (i.e, actions you will make) send to the RPC relay
var payload = [];

request(
	url,
	function(error, response, body) {
		let miners = JSON.parse(body);
		miners = miners.results; // all miners in the last hour
		for (i in miners) { // Looping through all miner

			// Do the draw for that miner
			var chance = Math.floor(Math.random() * 100);
			console.log(miners[i].miner, chance);

			if (chance == 0) { // 1% chance to pass the first floor, edit the variable chance to change that (ex: 2 -> 50%)

				// Choosing the NFT template the miner will get
				var lootPicked = lootPool[Math.floor(Math.random() * lootPool.length)]; // one item of the lootPool chosen randomly
				console.log(lootPicked);

				// The hard part: the NFT is minted directly to the miner's account. Here, we push all the NFT to mint in the payload
				payload.push({
					account: 'atomicassets',
					name: 'mintasset',
					authorization: [{
						actor: "yourAccount", // this account must be added to your collection authorized account
						permission: 'active',
					}],
					data: {
						authorized_minter: "yourAccount", // replace accordingly
						collection_name: "cryptomedals", //replace with your collection
						schema_name: lootPicked[1], //schema specified on nftRef
						template_id: lootPicked[0], // template specified on nftRef
						new_asset_owner: miners[i].miner, // NFT recipient
						immutable_data: [],
						mutable_data: [],
						tokens_to_back: []
					}
				});

			};
			
		};
		if (payload.length > 0) { // If a miner has won a NFT, we make the call here to mint it
			console.log(payload);
			// Make the call
			(async () => {

				await api.transact({
					actions: payload
				}, {
					blocksBehind: 3,
					expireSeconds: 120,
				});
			})();
		};

	});