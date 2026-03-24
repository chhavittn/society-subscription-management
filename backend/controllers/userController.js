const sendToken = require("../utils/jwtToken");
const crypto = require("crypto");
const { pool } = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendNotification } = require("../utils/onesignalService");
const axios = require("axios");

exports.registerUser = async (req, res, next) => {
  try {
    const { name, email, phone } = req.body;

    const defaultPassword = "123456";
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email=$1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const result = await pool.query(
      `INSERT INTO users (name, email, password, phone)
       VALUES ($1,$2,$3,$4)
       RETURNING id, name, email, role`,
      [name, email, hashedPassword, phone || null]
    );

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: result.rows[0],
      defaultPassword, // optional (for admin reference)
    });

  } catch (error) {
    console.log("🔥 REGISTER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
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

// exports.sendNotification = async (req, res) => {
//   try {
//     const adminId = req.user.id;
//     const { title, message, target_type, flat_type } = req.body;

//     // Validate required fields
//     if (!title || !message || !target_type) {
//       return res.status(400).json({ success: false, message: "Title, message, and target_type are required" });
//     }

//     let playerIds = [];

//     // ---------- ALL USERS ----------
//     if (target_type === "all") {
//       const result = await pool.query(`SELECT onesignal_player_id FROM user_devices`);
//       playerIds = result.rows.map(d => d.onesignal_player_id);
//     }

//     // ---------- FLAT TYPE ----------
//     else if (target_type === "flat") {
//       if (!flat_type) {
//         return res.status(400).json({ success: false, message: "Flat type is required" });
//       }

//       const result = await pool.query(`
//         SELECT ud.onesignal_player_id
//         FROM user_devices ud
//         JOIN users u ON u.id = ud.user_id
//         JOIN flats f ON f.user_id = u.id
//            WHERE LOWER(f.flat_type) = LOWER($1)
//       `, [flat_type]);

//       playerIds = result.rows.map(d => d.onesignal_player_id);
//       console.log("Flat type selected:", flat_type);
//       console.log("Players to notify:", playerIds);
//     }

//     else {
//       return res.status(400).json({ success: false, message: "Invalid target_type" });
//     }

//     // ---------- SEND PUSH ----------
//     if (playerIds.length > 0) {
//       await sendNotification(playerIds, title, message);
//     } else {
//       console.warn(`No devices found for target_type "${target_type}"${flat_type ? ` with flat_type "${flat_type}"` : ""}`);
//     }

//     // ---------- SAVE TO DB ----------
//     await pool.query(
//       `INSERT INTO notifications
//        (sender_admin_id, user_id, plan_id, title, message, target_type)
//        VALUES ($1, $2, $3, $4, $5, $6)`,
//       [adminId, null, null, title, message, target_type]
//     );

//     res.status(200).json({
//       success: true,
//       message: "Notification sent successfully"
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: error.message || "Server Error" });
//   }
// };


// exports.getMyNotifications = async (req, res) => {
//   const userId = req.user.id;
//   const result = await pool.query(
//     `SELECT *
//      FROM notifications
//      WHERE user_id=$1 OR target_type='all'
//      ORDER BY created_at DESC`,
//     [userId]
//   );
//   res.json({
//     success: true,
//     notifications: result.rows
//   });

// };

// exports.markRead = async (req, res) => {
//   await pool.query(
//     `UPDATE notifications
//      SET is_read=TRUE
//      WHERE id=$1`,
//     [req.params.id]
//   );
//   res.json({ success: true });
// }


exports.sendNotification = async (req, res) => {
  try {
    const adminId = req.user.id;
    const { title, message, target_type, flat_type, flat_id } = req.body;

    if (!title || !message || !target_type) {
      return res.status(400).json({ success: false, message: "Title, message, and target_type are required" });
    }

    let playerIds = [];
    let usersToNotify = []; // array of user IDs to save notifications
    let insertTargetType = target_type;

    // ---------- ALL USERS ----------
    if (target_type === "all") {
      const result = await pool.query(`
        SELECT u.id AS user_id, ud.onesignal_player_id
        FROM users u
        LEFT JOIN user_devices ud ON u.id = ud.user_id
      `);
      usersToNotify = [...new Set(result.rows.map(r => r.user_id))];
      playerIds = [...new Set(result.rows.map(r => r.onesignal_player_id).filter(Boolean))];
    }

    // ---------- FLAT TYPE ----------
    else if (target_type === "flat") {
      if (!flat_type) return res.status(400).json({ success: false, message: "Flat type is required" });

      const result = await pool.query(`
        SELECT u.id AS user_id, ud.onesignal_player_id
        FROM users u
        JOIN flats f ON f.user_id = u.id
        LEFT JOIN user_devices ud ON ud.user_id = u.id
        WHERE f.flat_type = $1
      `, [flat_type]);

      // playerIds = result.rows.map(r => r.onesignal_player_id).filter(Boolean);
      // Remove duplicates
      playerIds = [...new Set(result.rows.map(d => d.onesignal_player_id))];
      usersToNotify = result.rows.map(r => r.user_id);
      console.log("Unique player IDs:", playerIds.length);
      usersToNotify = [...new Set(result.rows.map(r => r.user_id))];
    } else if (target_type === "single_flat") {
      if (!flat_id) {
        return res.status(400).json({ success: false, message: "Flat is required" });
      }

      const result = await pool.query(`
        SELECT u.id AS user_id, ud.onesignal_player_id
        FROM flats f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN user_devices ud ON ud.user_id = u.id
        WHERE f.id = $1
      `, [flat_id]);

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No resident found for this flat"
        });
      }

      playerIds = [...new Set(result.rows.map(r => r.onesignal_player_id).filter(Boolean))];
      usersToNotify = [...new Set(result.rows.map(r => r.user_id))];
      insertTargetType = "flat";
    } else {
      return res.status(400).json({ success: false, message: "Invalid target_type" });
    }

    // ---------- SEND PUSH ----------
    if (playerIds.length > 0) {
      await sendNotification(playerIds, title, message);
    }

    // ---------- SAVE NOTIFICATIONS ----------
    if (target_type === "all") {
      await pool.query(
        `INSERT INTO notifications
         (sender_admin_id, user_id, title, message, target_type)
         VALUES ($1, $2, $3, $4, $5)`,
        [adminId, null, title, message, insertTargetType]
      );
    } else {
      const insertPromises = usersToNotify.map(userId =>
        pool.query(
          `INSERT INTO notifications
           (sender_admin_id, user_id, title, message, target_type)
           VALUES ($1, $2, $3, $4, $5)`,
          [adminId, userId, title, message, insertTargetType]
        )
      );
      await Promise.all(insertPromises);
    }

    res.status(200).json({
      success: true,
      message: `Notification sent to ${usersToNotify.length} users`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
exports.getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await pool.query(`
      SELECT n.*
      FROM notifications n
      LEFT JOIN flats f ON f.user_id = n.user_id
      WHERE 
        n.user_id = $1          -- notifications sent directly to this user
        OR n.target_type = 'all' -- notifications sent to everyone
        OR (n.target_type = 'flat' AND f.user_id = $1) -- flat-type notifications for this user
      ORDER BY n.created_at DESC
    `, [userId]);

    res.json({
      success: true,
      notifications: result.rows
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};
exports.markRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notificationId = req.params.id;

    // Update only if the notification belongs to the user, is for their flat, or is for all
    const result = await pool.query(`
      UPDATE notifications n
      SET is_read = TRUE
      FROM flats f
      WHERE n.id = $1
        AND (
          n.user_id = $2
          OR n.target_type = 'all'
          OR (n.target_type = 'flat' AND f.user_id = $2 AND f.id = n.plan_id)
        )
      RETURNING n.*
    `, [notificationId, userId]);

    if (result.rowCount === 0) {
      return res.status(403).json({
        success: false,
        message: "You cannot mark this notification as read"
      });
    }

    res.json({
      success: true,
      notification: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message || "Server Error" });
  }
};


exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Allow delete if notification is visible to this user:
    // direct user notification, global notification, or flat-target notification.
    const result = await pool.query(
      `DELETE FROM notifications n
       WHERE n.id = $1
         AND (
           n.user_id = $2
           OR n.target_type = 'all'
           OR (
             n.target_type = 'flat'
             AND EXISTS (
               SELECT 1
               FROM flats f
               WHERE f.user_id = $2
             )
           )
         )
       RETURNING *`,
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Notification not found or unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted",
    });

  } catch (error) {
    console.error("❌ Delete notification error:", error);
    res.status(500).json({ message: error.message });
  }
};
