const db = require("../models");
const Model = db.Model;
const { QueryTypes } = require("sequelize");
const WebSocket = require('ws');
const redis = require('redis');
let redisClient = false;


const initiateRedis = async () => {
	redisClient = redis.createClient({ legacyMode: true });
	await redisClient.connect();

	redisClient.on('error', function (err) {
		console.log('Error ' + err);
		redisClient = false;
	});
}

exports.refactoreMe1 = async (req, res) => {
	// function ini sebenarnya adalah hasil survey dri beberapa pertnayaan, yang mana nilai dri jawaban tsb akan di store pada array seperti yang ada di dataset
	// [ Refactored ]
	try {
		const surveys = await db.sequelize.query("SELECT * FROM surveys", { type: QueryTypes.SELECT });

		let totalIndex = [];
		const totalLength = surveys.length

		surveys.forEach(element => {
			const reduced = parseInt(element['values'].reduce((a, b) => a + b, 0) / totalLength);
			totalIndex.push(reduced)
		});

		return res.status(200).send({
			statusCode: 200,
			success: true,
			data: totalIndex,
		});


	} catch (e) {
		console.log(e)
		return res.status(500).send({
			statusCode: 500,
			success: false,
			message: "Internal Server Error",
		});
	}
};

exports.refactoreMe2 = async (req, res) => {
	// [ Refactored ]
	try {
		const { userId, values } = req.body;

		const surveyQuery = `INSERT INTO "surveys" ("userId", "values", "createdAt", "updatedAt") VALUES (:userId, :values, :createdAt, :updatedAt) RETURNING *;`;
		const postgresArrayString = `{${values.join(',')}}`;
		
		const insertSurveyResult = await db.sequelize.query(surveyQuery, {
			replacements: {
				userId,
				values: postgresArrayString,
				createdAt: new Date(),
				updatedAt: new Date()
			},
			type: QueryTypes.INSERT,
		});

		const updateQuery = `UPDATE users SET dosurvey = true WHERE id = :userId;`;

		await db.sequelize.query(updateQuery, {
			replacements: { userId },
			type: db.sequelize.QueryTypes.UPDATE,
		});

		return res.status(201).send({
			statusCode: 201,
			message: 'Survey sent successfully!',
			success: true,
			data: insertSurveyResult[0][0]
		});

	} catch (e) {
		console.log(e)
		return res.status(500).send({
			statusCode: 500,
			success: false,
			message: "Internal Server Error",
		});
	}
}

let lastUpdate = false;
let wss = false;

exports.callmeWebSocket = async (req, res) => {
	// do something
	if (!wss) {
		wss = new WebSocket.Server({ noServer: true });

		// first update
		fetchDataAndStore()

		// retrieve data every 3 minutes
		setInterval(fetchDataAndStore, 3 * 60 * 1000);
	}

	if (!redisClient) {
		await initiateRedis();
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
				db.attacks.create({
					sourceCountry: element.sourceCountry,
					destinationCountry: element.destinationCountry,
					millisecond: element.millisecond,
					type: element.type,
					weight: element.weight,
					attackTime: element.attackTime,
				})
			})

			redisClient.del('attacksTypeSourceCountry', "attacksTypeDestinationCountry", (err, reply) => {
				if (err) {
					console.error(err);
				} else {
					console.log(`Deleted ${reply} key(s).`);
				}
			});


			lastUpdate = Date.now();

			wss.clients.forEach((client) => {
				if (client.readyState === WebSocket.OPEN) {
					client.send(JSON.stringify({ "lastUpdated": lastUpdate }));
				}
			});

		} catch (error) {
			console.error('Error fetching and storing data:', error);
			return res.status(500).send({
				statusCode: 500,
				success: true,
				message: "Internal Server Error",
			});
		}
	}

	return res.status(200).send({
		statusCode: 200,
		success: true,
		message: "Socket running!",
	});
};


exports.getData = async (req, res) => {

	if (!redisClient) {
		await initiateRedis();
	}

	const formattedData = {
		success: true,
		statusCode: 200,
		data: {
			label: [],
			total: [],
		},
	};

	let redisKey, query;

	if (req.body.type == "sourceCountry") {
		redisKey = "attacksTypeSourceCountry";
		query = `SELECT "sourceCountry" as "label", COUNT(DISTINCT "type") as "totalTypes" FROM map_attacks GROUP BY "sourceCountry"`;
	} else if (req.body.type == "destinationCountry") {
		redisKey = "attacksTypeDestinationCountry";
		query = `SELECT "destinationCountry" as "label", COUNT(DISTINCT "type") as "totalTypes" FROM map_attacks GROUP BY "destinationCountry"`;
	}

	try {
		return redisClient.get(redisKey, async (err, cachedData) => {

			if (err) throw err;


			if (cachedData) {
				// Return data in cache
				const parsedCachedData = JSON.parse(cachedData);

				parsedCachedData.forEach(row => {
					formattedData.data.label.push(row.label);
					formattedData.data.total.push(row.totalTypes);
				});


			} else {

				const resultSourceCountry = await await db.sequelize.query(query, { type: QueryTypes.SELECT });

				resultSourceCountry.forEach(row => {
					formattedData.data.label.push(row.label);
					formattedData.data.total.push(row.totalTypes);
				});

				redisClient.setex(redisKey, 3600, JSON.stringify(resultSourceCountry));
			}

			return res.status(200).send(formattedData);
		
		});

	} catch (e) {
		console.log(e)
		return res.status(500).send({
			statusCode: 500,
			success: false,
			message: "Internal Server Error",
		});
	}
};
