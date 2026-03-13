const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const { pool } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.registerUser = (async (req, res, next) => {

  const { name, email, password, phone } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name,email,password,phone)
     VALUES ($1,$2,$3,$4)
     RETURNING id,name,email,role`,
    [name, email, hashedPassword, phone]
  );

  const user = result.rows[0];

  sendToken(user, 201, res);

});
exports.loginUser = (async (req, res, next) => {

  const { email, password } = req.body;

  //  checking if user exists
  const result = await pool.query(
    "SELECT * FROM users WHERE email=$1",
    [email]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password"
    });
  }

  // compare password
  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    return res.status(401).json({
      success: false,
      message: "Invalid Email or Password"
    });
  }
  sendToken(user, 200, res);

});

exports.logout = (async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
});
exports.updatePassword = (async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;

  const result = await pool.query(
    "SELECT * FROM users WHERE id=$1",
    [req.user.id]
  );
  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatched) {
    return res.status(400).json({
      success: false,
      message: "old password is incorrect"
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match"
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE users SET password=$1 WHERE id=$2",
    [hashedPassword, user.id]
  );

  // Sending JWT token after password update
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "7d" });

  res.status(200).json({
    success: true,
    message: "Password updated successfully",
    token
  });
});
exports.updateProfile = (async (req, res, next) => {
  const { name, email, phone } = req.body;

  const result = await pool.query(
    "UPDATE users SET name=$1, email=$2, phone=$3 WHERE id=$4 RETURNING id,name,email,phone,role,created_at",
    [name, email, phone, req.user.id]
  );

  const updatedUser = result.rows[0];

  if (!updatedUser) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    user: updatedUser
  });
});

exports.getUserDetails = (async (req, res, next) => {
  const result = await pool.query(
    "SELECT id,name,email,phone,role,created_at FROM users WHERE id=$1",
    [req.user.id]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    user
  });
});

exports.getAllUser = (async (req, res, next) => {

  const result = await pool.query(
    "SELECT id,name,email,phone,role,created_at FROM users"
  );

  const users = result.rows;

  if (users.length === 0) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    users
  });
});

exports.getSingleUser = (async (req, res, next) => {
  const result = await pool.query(
    "SELECT id,name,email,phone,role,created_at FROM users WHERE id=$1",
    [req.params.id]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    user
  });
});
exports.updateUserRole = (async (req, res, next) => {

  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({
      success: false,
      message: "Invalid role"
    });
  }

  const result = await pool.query(
    "UPDATE users SET role=$1 WHERE id=$2 RETURNING id,name,email,phone,role,created_at",
    [role, req.params.id]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "User role updated successfully",
    user
  });

});
exports.deleteUser = (async (req, res, next) => {

  const result = await pool.query(
    "DELETE FROM users WHERE id=$1 RETURNING id,name,email,phone,role,created_at",
    [req.params.id]
  );

  const user = result.rows[0];

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
    user
  });

});