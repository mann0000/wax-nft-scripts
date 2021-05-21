// This script claims aether from the Rplanet game
// In order to work, that script needs: a Wax account that stakes NFT to Rplanet
// Author: mann000 <t.me/mann0000>, tips appreciated (dsnqy.wam) 

// Dependencies loading
const { Api, JsonRpc } = require("eosjs");
const { JsSignatureProvider } = require("eosjs/dist/eosjs-jssig");
const fetch = require("node-fetch"); 
const { TextDecoder, TextEncoder } = require("util");
const http = require("http");

const privateKeys = ["XXXXX"]; // <- put your key here
const signatureProvider = new JsSignatureProvider(privateKeys);
const rpc = new JsonRpc("https://wax.eosrio.io", { fetch }); //required to read blockchain state
const api = new Api({
	rpc,
	signatureProvider,
	textDecoder: new TextDecoder(),
	textEncoder: new TextEncoder(),
}); //required to submit transactions


//claimer: the script simply calls the action "claim" of Rplanet smart contract
(async () => {
	console.log("claim");
	await api.transact(
		{
			actions: [
				{
					account: "s.rplanet",
					name: "claim",
					authorization: [
						{
							actor: "yourAccount",//replace the string accordingly with your Wax account
							permission: "active",
						},
					],
					data: {
						to: "yourAccount",//replace the string accordingly with your Wax account
					},
				},
			],
		},
		{
			blocksBehind: 3,
			expireSeconds: 120,
		}
	);
})();
