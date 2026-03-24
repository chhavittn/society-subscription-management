const { pool } = require("../db");
const bcrypt = require("bcryptjs");
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[0-9]{10}$/;

const allowedBlocks = ["A", "B", "C", "D", "E", "F", "G", "H"];
const allowedFlatTypes = ["1BHK", "2BHK", "3BHK", "4BHK"];

const normalize = (body = {}) => ({
  flat_number: body.flat_number?.trim() || "",
  block: body.block?.trim() || "",
  flat_type: body.flat_type?.trim() || "",
  name: body.name?.trim() || "",
  email: body.email?.trim().toLowerCase() || "",
  phone: body.phone?.trim() || "",
  floor: parseInt(body.floor, 10),
});

const validate = (data) => {
  const { flat_number, block, flat_type, floor, name, email, phone } = data;

  if (!flat_number || !block || !flat_type || isNaN(floor)) {
    return "Please fill all required flat details";
  }

  if (floor < 0) return "Floor must be non-negative";
  if (!/^\d+$/.test(flat_number)) return "Flat number must be digits only";
  if (!allowedBlocks.includes(block)) return "Invalid block";
  if (!allowedFlatTypes.includes(flat_type)) return "Invalid flat type";

  const hasOwner = name || email || phone;

  if (hasOwner && (!name || !email || !phone)) {
    return "Fill all owner details or leave all empty";
  }

  if (email && !emailRegex.test(email)) return "Invalid email";
  if (phone && !phoneRegex.test(phone)) return "Phone must be 10 digits";

  return null;
};

exports.addFlat = async (req, res) => {
  try {
    const data = normalize(req.body);

    const error = validate(data);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    const { flat_number, block, floor, flat_type, name, email, phone } = data;

    const flatExists = await pool.query(
      "SELECT 1 FROM flats WHERE flat_number=$1",
      [flat_number]
    );

    if (flatExists.rows.length) {
      return res.status(400).json({ success: false, message: "Flat already exists" });
    }

    let userId = null;

    if (name && email) {
      const userRes = await pool.query(
        "SELECT id FROM users WHERE email=$1",
        [email]
      );

      if (userRes.rows.length) {
        userId = userRes.rows[0].id;
      } else {
        const hashed = await bcrypt.hash("123456", 10);

        const newUser = await pool.query(
          `INSERT INTO users (name, email, password, phone)
           VALUES ($1,$2,$3,$4)
           RETURNING id`,
          [name, email, hashed, phone || null]
        );

        userId = newUser.rows[0].id;
      }
    }

    const { rows } = await pool.query(
      `INSERT INTO flats (flat_number, block, floor, flat_type, user_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [flat_number, block, floor, flat_type, userId]
    );

    const newFlat = rows[0];

    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    const plan = await pool.query(
      `SELECT id, amount FROM subscription_plans
       WHERE LOWER(plan_name) = LOWER($1)
       ORDER BY effective_from DESC LIMIT 1`,
      [flat_type]
    );

    const selected = plan.rows[0] || { id: 1, amount: 2200 };

    await pool.query(
      `INSERT INTO monthly_subscriptions
       (flat_id, plan_id, month, year, amount, status, due_date)
       VALUES ($1,$2,$3,$4,$5,'pending',$6)
       ON CONFLICT DO NOTHING`,
      [
        newFlat.id,
        selected.id,
        month,
        year,
        selected.amount,
        `${year}-${String(month).padStart(2, "0")}-10`,
      ]
    );

    res.status(201).json({ success: true, flat: newFlat });

  } catch (err) {
    console.error("ADD FLAT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getAllFlats = async (req, res, next) => {
  let { page = 1, limit = 10, search = "", sortBy = "id", sortOrder = "asc" } = req.query;

  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  const sortableFieldsMap = {
    id: "f.id",
    flat_number: "f.flat_number",
    block: "f.block",
    floor: "f.floor",
    flat_type: "f.flat_type",
    is_active: "f.is_active",
    user_name: "u.name",
  };

  const sortField = sortableFieldsMap[sortBy] || "f.id";

  const order = sortOrder.toLowerCase() === "desc" ? "DESC" : "ASC";

  const searchQuery = `%${search}%`;

  const countResult = await pool.query(`
    SELECT COUNT(*) FROM flats f
    LEFT JOIN users u ON f.user_id = u.id
    WHERE f.flat_number ILIKE $1
       OR f.block ILIKE $1
       OR f.flat_type ILIKE $1
       OR u.name ILIKE $1
       OR u.email ILIKE $1
  `, [searchQuery]);

  const total = parseInt(countResult.rows[0].count);

  const result = await pool.query(`
    SELECT f.id, f.flat_number, f.block, f.floor, f.flat_type, f.is_active,
           u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone
    FROM flats f
    LEFT JOIN users u ON f.user_id = u.id
    WHERE f.flat_number ILIKE $1
       OR f.block ILIKE $1
       OR f.flat_type ILIKE $1
       OR u.name ILIKE $1
       OR u.email ILIKE $1
    ORDER BY ${sortField} ${order} 
    LIMIT $2 OFFSET $3
  `, [searchQuery, limit, offset]);

  res.status(200).json({
    success: true,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    flats: result.rows
  });
};

exports.getUserFlats = (async (req, res, next) => {
  const userId = req.user.id;

  const result = await pool.query(`
    SELECT f.id, f.flat_number, f.block, f.floor, f.flat_type, f.is_active,
           u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone
    FROM flats f
    LEFT JOIN users u ON f.user_id = u.id
    WHERE f.user_id=$1
  `, [userId]);

  const flats = result.rows;

  if (flats.length === 0) {
    return res.status(200).json({
      success: true,
      message: "No flat assigned yet",
      flats: []
    });
  }

  res.status(200).json({
    success: true,
    flats
  });
});
exports.updateFlat = async (req, res) => {
  try {
    const data = normalize(req.body);
    const { flat_number, block, floor, flat_type, name, email, phone } = data;
    const { is_active } = req.body;

    // Validate
    const error = validate(data);
    if (error) {
      return res.status(400).json({ success: false, message: error });
    }

    // Check flat exists
    const { rows } = await pool.query(
      "SELECT * FROM flats WHERE id=$1",
      [req.params.id]
    );

    const flat = rows[0];
    if (!flat) {
      return res.status(404).json({ success: false, message: "Flat not found" });
    }

    // Check duplicate flat number
    const duplicate = await pool.query(
      "SELECT 1 FROM flats WHERE flat_number=$1 AND id<>$2",
      [flat_number, req.params.id]
    );

    if (duplicate.rows.length) {
      return res.status(400).json({ success: false, message: "Flat already exists" });
    }

    let userId = flat.user_id;

    if (userId) {
      if (email) {
        const conflict = await pool.query(
          "SELECT 1 FROM users WHERE email=$1 AND id<>$2",
          [email, userId]
        );

        if (conflict.rows.length) {
          return res.status(400).json({
            success: false,
            message: "Email already in use",
          });
        }
      }

      await pool.query(
        `UPDATE users SET name=$1, email=$2, phone=$3 WHERE id=$4`,
        [name, email, phone, userId]
      );

    } else if (name && email) {
      const userRes = await pool.query(
        "SELECT id FROM users WHERE email=$1",
        [email]
      );

      if (userRes.rows.length) {
        userId = userRes.rows[0].id;
      } else {
        const hashed = await bcrypt.hash("123456", 10);

        const newUser = await pool.query(
          `INSERT INTO users (name, email, password, phone)
           VALUES ($1,$2,$3,$4)
           RETURNING id`,
          [name, email, hashed, phone || null]
        );

        userId = newUser.rows[0].id;
      }
    }
    await pool.query(
      `UPDATE flats
       SET flat_number=$1, block=$2, floor=$3, flat_type=$4, user_id=$5, is_active=$6
       WHERE id=$7`,
      [flat_number, block, floor, flat_type, userId, is_active, req.params.id]
    );

    // Return updated flat
    const updated = await pool.query(
      `SELECT f.*, 
              u.id AS user_id, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
       FROM flats f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.id=$1`,
      [req.params.id]
    );

    res.status(200).json({
      success: true,
      flat: updated.rows[0],
    });

  } catch (err) {
    console.error("UPDATE FLAT ERROR:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.deleteFlat = (async (req, res, next) => {
  const result = await pool.query(
    "DELETE FROM flats WHERE id=$1 RETURNING *",
    [req.params.id]
  );

  const flat = result.rows[0];
  if (!flat) {
    return res.status(404).json({
      success: false,
      message: "Flat not found"
    });
  }

  res.status(200).json({ success: true, message: "Flat deleted successfully", flat });
});
