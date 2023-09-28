const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const app = express();

const corsOptions = {
	origin: ["http://localhost:8080"],
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require("./app/models");

// [ DISABLED IN PRODUCTION START ] 
db.usersWithRole.sync({ force: true }).then(async () => {
	// Insert initial rows
	await db.usersWithRole.bulkCreate([
		{
			fullname: "Rizki Ardiansyah",
			email: "rizkiardiansyah@gmail.com",
			roleId: 2
		},
		{
			fullname: "Azuli Firman",
			email: "azulifirman@gmail.com",
			roleId: 1
		}
	]);
	console.log('Database synchronized and initial rows inserted.');
}).catch((err) => {
	console.error('Error synchronizing database:', err);
});

db.role.sync({ force: true }).then(async () => {
	// Insert initial rows
	await db.role.bulkCreate([
		{ name: 'aksesGetData' },
		{ name: 'aksesCallMeWss' }
	]);
	console.log('Database synchronized and initial rows inserted.');
}).catch((err) => {
	console.error('Error synchronizing database:', err);
});

db.sequelize.sync();
// [ DISABLED IN PRODUCTION END ]

// simple route
app.get("/", (req, res) => {
	res.json({ message: "Hello" });
});

// routes
require("./app/routes/exampleRoutes.js")(app);

// set port, listen for requests
const PORT = process.env.PORT || 7878;

const server = app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});

module.exports = { app, server };
