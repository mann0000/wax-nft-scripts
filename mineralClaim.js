// This script claims minerals from all your lands of the Rplanet game
// In order to work, that script needs: a Wax account with Rplanet lands
// Author: mann000 <t.me/mann0000>, tips appreciated (dsnqy.wam) 

// Dependencies loading
const {
	Api,
	JsonRpc
} = require("eosjs");
const {
	JsSignatureProvider
} = require("eosjs/dist/eosjs-jssig");
const fetch = require("node-fetch");
const {
	TextDecoder,
	TextEncoder
} = require("util");
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
	textEncoder: new TextEncoder(),
}); //required to submit transactions

// URL to query to get all your lands. Replace owner with your own account
const url1 = "https://www.nfthive.io/api/search?name=&owner=nfttreasury2&author=rplanet&category=lands&order_by=date";
const url2 = "https://www.nfthive.io/api/search?name=&owner=nfttreasury2&author=rplanet&category=lands2&order_by=date";

var landsID = []; // Assets IDs of your lands will be stocked here

// Perform two chained requests to get IDs of all your lands, then do the claim
request(
	url1, // Fetch lands from the first sale
	function(error, response, body) {
		var lands = JSON.parse(body);
		
		for (land in lands) {
			landsID.push(lands[land].assetId);
		};

		request(
			url2, // Then, fetch lands from the second sale
			function(error, response, body) {
				
				var lands = JSON.parse(body);
				
				for (land in lands) {
					landsID.push(lands[land].assetId);
				}

				console.log(landsID); // all your land IDs

				for (item in landsID) { //loop through all the lands

					//claimer: the script the action "claim" of Rplanet smart contract for each land you own
					(async () => {
						console.log("claim");
						await api.transact({
							actions: [{
								account: "l.rplanet",
								name: "claim",
								authorization: [{
									actor: "nfttreasury2", //replace the string accordingly with your Wax account
									permission: "active",
								}, ],
								data: {
									land_ids: [landsID[item]],
									owner: "nfttreasury2" //replace the string accordingly with your Wax account
								},
							}, ],
						}, {
							blocksBehind: 3,
							expireSeconds: 120,
						});
					})();

				}
			});

	});