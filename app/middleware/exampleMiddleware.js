const db = require("../models");
const config = require('../config/auth');
const jwt = require('jsonwebtoken');

const verifyJWT = (req, res, next) => {
	const token = req.header('Authorization');

	if (!token) {

		return res.status(401).send({
			statusCode: 401,
			success: false,
			message: "Unauthorized",
		});

	}

	try {

		const decoded = jwt.verify(token, config.secret);
		req.user = decoded;
		next();
	} catch (error) {
		return res.status(403).send({
			statusCode: 403,
			success: false,
			message: "Invalid token",
		});
	}
};

const checkUserRole = (requiredRole) => {
	return async (req, res, next) => {
		const { email } = req.user;

		if (!email) {
			return res.status(403).json({
				statusCode: 403,
				success: false,
				error: "Forbidden",
			});
		};

		const roleQuery = await db.usersWithRole.findOne({
			where: { email },
			include: { model: db.role, as: 'role' },
			type: db.sequelize.QueryTypes.SELECT,
		});

		if(roleQuery.role.name == requiredRole) {
			return next();
		};
		
		return res.status(403).json({
			statusCode: 403,
			success: false,
			error: "Forbidden",
		});
		
	};
};



const verify = {
	verifyJWT,
	checkUserRole
};

module.exports = verify;
