const jwt = require("jsonwebtoken");
const { pool } = require("../db");

exports.isAuthenticatedUser = (async (req, res, next) => {

    const { token } = req.cookies;

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Please Login to access this resource"
        });
    }

    try {

        const decodedData = jwt.verify(token, process.env.JWT_SECRET);

        const result = await pool.query(
            "SELECT * FROM users WHERE id = $1",
            [decodedData.id]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        req.user = user;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid Token"
        });
    }

});

exports.authorizeRoles = (...roles) => {

    return (req, res, next) => {

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `Role: ${req.user.role} is not allowed to access this resource`,
            });
        }
        next();
    };

};