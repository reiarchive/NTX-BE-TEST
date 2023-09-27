const db = require("../models");
const Model = db.Model;
const { Op } = require("sequelize");
const axios = require('axios');
const WebSocket = require('ws');

exports.refactoreMe1 = async (req, res) => {
	// function ini sebenarnya adalah hasil survey dri beberapa pertnayaan, yang mana nilai dri jawaban tsb akan di store pada array seperti yang ada di dataset
	try {
		const surveys = await db.sequelize.query("SELECT * FROM surveys", { type: QueryTypes.SELECT });

		let totalIndex = [];
		const totalLength = surveys[0].length

		surveys[0].forEach(element => {
			const reduced = element['values'].reduce((a, b) => a + b, 0) / totalLength;
			totalIndex.push(reduced)
		});

		res.status(200).send({
			statusCode: 200,
			success: true,
			data: totalIndex,
		});


	} catch (e) {
		res.status(500).send({
			statusCode: 500,
			success: false,
			message: "Internal Server Error",
		});
	}
};

exports.refactoreMe2 = (req, res) => {
	// function ini untuk menjalakan query sql insert dan mengupdate field "dosurvey" yang ada di table user menjadi true, jika melihat data yang di berikan, salah satu usernnya memiliki dosurvey dengan data false
	db.surveys.create({
		userId: req.body.userId,
		values: req.body.values, // [] kirim array
	}).then((data) => {

		db.users.update({ dosurvey: true }, {
			where: { id: req.body.userId },
		}).then(() => console.log("success")).catch((err) => console.log(err));

		res.status(201).send({
			statusCode: 201,
			message: "Survey sent successfully!",
			success: true,
			data,
		});

	}).catch((err) => {
		console.log(err);
		res.status(500).send({
			statusCode: 500,
			message: "Cannot post survey.",
			success: false,
		});
	});
};

let lastUpdate = false;
let wss = false;

exports.callmeWebSocket = (req, res) => {
	// do something
	if (!wss) {
		wss = new WebSocket.Server({ noServer: true });

		// first update
		fetchDataAndStore()

		// retrieve data every 3 minutes
		setInterval(fetchDataAndStore, 3 * 60 * 1000);
	}

	// Handle WebSocket upgrades
	const server = res.socket.server;

	server.on('upgrade', (request, socket, head) => {
		const buffer = Buffer.from(head);

		wss.handleUpgrade(request, socket, buffer, (ws) => {
			console.log("emit connection");
			wss.emit('connection', ws, request);
		});
	});


	wss.on('connection', (ws) => {
		
		if (!lastUpdate) {
			lastUpdate = Date.now();
		}

		// Send lastUpdated to client
		ws.send(JSON.stringify({ "lastUpdated": lastUpdate }));
	
	});

	// Function to fetch data from API and store it in PostgreSQL
	async function fetchDataAndStore() {
		try {
			const response = await fetch('https://livethreatmap.radware.com/api/map/attacks?limit=10');
			const data = await response.json();

			// Insert data into the PostgreSQL table
			data[0].forEach(element => {
				// console.log(element)
				db.attacks.create({
					sourceCountry: element.sourceCountry,
					destinationCountry: element.destinationCountry,
					millisecond: element.millisecond,
					type: element.type,
					weight: element.weight,
					attackTime: element.attackTime,
				})
			})


			lastUpdate = Date.now();
			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ "lastUpdated": lastUpdate }));
				}
			});

		} catch (error) {
			console.error('Error fetching and storing data:', error);
		}
	}

	return res.status(200).send({
		statusCode: 200,
		message: "Socket running!",
		success: true,
	});
};

exports.getData = (req, res) => {
	// do something
};
