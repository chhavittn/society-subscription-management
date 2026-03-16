const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const { pool } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendNotification } = require("../utils/onesignalService");
const axios = require("axios");

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


exports.registerDevice = (async (req, res) => {
  const userId = req.user.id;
  const { player_id } = req.body;
  if (!player_id) return res.status(400).json({ success: false, message: "player_id required" });
  await pool.query(
    `INSERT INTO user_devices (user_id, onesignal_player_id)
     VALUES ($1,$2)
     ON CONFLICT DO NOTHING`,
    [userId, player_id]
  );
  res.json({
    success: true,
    message: "Device registered"
  });
});


exports.sendNotification = (async (req, res, next) => {
  const adminId = req.user.id;
  const { title, message, target_type, user_id, plan_id } = req.body;

  if (!title || !message || !target_type) {
    return next(new ErrorHandler("Title, message and target_type required", 400));
  }
  let playerIds = [];
  // ---------- ALL USERS ----------
  if (target_type === "all") {
    const result = await pool.query(
      `SELECT onesignal_player_id FROM user_devices`
    );
    playerIds = result.rows.map(d => d.onesignal_player_id);
  }

  // ---------- SPECIFIC USER ----------
  else if (target_type === "user") {

    if (!user_id) return next(new ErrorHandler("user_id required", 400));

    const result = await pool.query(
      `SELECT onesignal_player_id FROM user_devices WHERE user_id=$1`,
      [user_id]
    );

    playerIds = result.rows.map(d => d.onesignal_player_id);
  }

  // ---------- PLAN USERS ----------
  else if (target_type === "plan") {
    if (!plan_id) return next(new ErrorHandler("plan_id required", 400));
    const result = await pool.query(`
      SELECT ud.onesignal_player_id
      FROM user_devices ud
      JOIN users u ON u.id = ud.user_id
      JOIN flats f ON f.user_id = u.id
      JOIN monthly_subscriptions ms ON ms.flat_id = f.id
      WHERE ms.plan_id=$1
    `, [plan_id]);

    playerIds = result.rows.map(d => d.onesignal_player_id);
  }

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: 'pre-fix',
      hypothesisId: 'H2',
      location: 'backend/controllers/userController.js:320',
      message: 'Prepared playerIds for sendNotification',
      data: {
        target_type,
        user_id: user_id || null,
        plan_id: plan_id || null,
        playerIdsCount: playerIds.length,
        playerIdsSample: playerIds.slice(0, 5)
      },
      timestamp: Date.now()
    })
  }).catch(() => { });
  // #endregion

  // Filter out invalid / malformed OneSignal player IDs before sending
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  const validPlayerIds = playerIds.filter(id => typeof id === "string" && uuidRegex.test(id));

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: 'post-fix',
      hypothesisId: 'H4',
      location: 'backend/controllers/userController.js:332',
      message: 'Filtered playerIds for valid OneSignal UUIDs before sending',
      data: {
        originalCount: playerIds.length,
        filteredCount: validPlayerIds.length,
        removedCount: playerIds.length - validPlayerIds.length,
        originalSample: playerIds.slice(0, 5),
        filteredSample: validPlayerIds.slice(0, 5)
      },
      timestamp: Date.now()
    })
  }).catch(() => { });
  // #endregion

  // ---------- SEND PUSH ----------
  await sendNotification(validPlayerIds, title, message);

  // ---------- SAVE TO DB ----------
  await pool.query(
    `INSERT INTO notifications
     (sender_admin_id, user_id, plan_id, title, message, target_type)
     VALUES ($1,$2,$3,$4,$5,$6)`,
    [adminId, user_id || null, plan_id || null, title, message, target_type]
  );

  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/7679d4fc-5c62-451d-837b-99db36761b42', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      runId: 'pre-fix',
      hypothesisId: 'H3',
      location: 'backend/controllers/userController.js:338',
      message: 'Notification saved to DB after sending push',
      data: {
        adminId,
        target_type,
        user_id: user_id || null,
        plan_id: plan_id || null
      },
      timestamp: Date.now()
    })
  }).catch(() => { });
  // #endregion

  res.status(200).json({
    success: true,
    message: "Notification sent successfully"
  });

});
exports.getMyNotifications = async (req, res) => {
  const userId = req.user.id;
  const result = await pool.query(
    `SELECT *
     FROM notifications
     WHERE user_id=$1 OR target_type='all'
     ORDER BY created_at DESC`,
    [userId]
  );
  res.json({
    success: true,
    notifications: result.rows
  });

};

exports.markRead = async (req, res) => {
  await pool.query(
    `UPDATE notifications
     SET is_read=TRUE
     WHERE id=$1`,
    [req.params.id]
  );
  res.json({ success: true });
}