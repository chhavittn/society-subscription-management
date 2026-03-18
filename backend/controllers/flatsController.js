const { pool } = require("../db");
const bcrypt = require("bcryptjs");

exports.addFlat = async (req, res, next) => {
  try {
    const { flat_number, block, floor, flat_type, name, email, phone } = req.body;

    let userId = null;

    // 🔍 Check if flat already exists
    const existingFlat = await pool.query(
      "SELECT * FROM flats WHERE flat_number=$1",
      [flat_number]
    );

    if (existingFlat.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Flat number already exists",
      });
    }

    // 👤 Create or fetch user
    if (name && email) {
      const existingUser = await pool.query(
        "SELECT id FROM users WHERE email=$1",
        [email]
      );

      if (existingUser.rows.length > 0) {
        // ✅ user already exists
        userId = existingUser.rows[0].id;
      } else {
        // ✅ create new user with default password
        const defaultPassword = "123456";
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);

        const newUser = await pool.query(
          `INSERT INTO users (name, email, password, phone)
           VALUES ($1,$2,$3,$4)
           RETURNING id`,
          [name, email, hashedPassword, phone || null]
        );

        userId = newUser.rows[0].id;
      }
    }

    // 🏠 Insert flat with user_id
    const result = await pool.query(
      `INSERT INTO flats (flat_number, block, floor, flat_type, user_id)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING *`,
      [flat_number, block, floor, flat_type, userId]
    );

    res.status(201).json({
      success: true,
      flat: result.rows[0],
    });

  } catch (error) {
    console.log("🔥 ADD FLAT ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
exports.getAllFlats = (async (req, res, next) => {
  // Query params
  let { page = 1, limit = 10, search = "", sortBy = "id", order = "asc" } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  // Validate sort column
  const sortableFields = ["id", "flat_number", "block", "floor", "flat_type", "is_active"];
  if (!sortableFields.includes(sortBy)) sortBy = "id";

  order = order.toLowerCase() === "desc" ? "DESC" : "ASC";

  // Search filter
  const searchQuery = `%${search}%`;

  // Total count for pagination
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

  // Main query
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
    ORDER BY ${sortBy} ${order}
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
});

exports.getSingleFlat = (async (req, res, next) => {
  const result = await pool.query(`
    SELECT f.id, f.flat_number, f.block, f.floor, f.flat_type, f.is_active,
           u.id as user_id, u.name as user_name, u.email as user_email, u.phone as user_phone
    FROM flats f
    LEFT JOIN users u ON f.user_id = u.id
    WHERE f.id=$1
  `, [req.params.id]);

  const flat = result.rows[0];
  if (!flat) {
    return res.status(404).json({
      success: false,
      message: "Flat not found"
    });
  }

  // User cannot access other flats
  if (req.user.role !== "admin" && flat.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "Access denied"
    });
  }

  res.status(200).json({ success: true, flat });
});

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
exports.updateFlat = async (req, res, next) => {
  const { flat_number, block, floor, flat_type, is_active, name, email, phone } = req.body;

  // 🔍 Get existing flat
  const flatRes = await pool.query(
    `SELECT * FROM flats WHERE id=$1`,
    [req.params.id]
  );

  const flat = flatRes.rows[0];

  if (!flat) {
    return res.status(404).json({
      success: false,
      message: "Flat not found",
    });
  }

  let userId = flat.user_id;

  // ✅ If user exists → update
  if (userId) {
    await pool.query(
      `UPDATE users
       SET name=$1, email=$2, phone=$3
       WHERE id=$4`,
      [name, email, phone, userId]
    );
  }
  // ✅ If no user → create new
  else if (name && email) {
    const userRes = await pool.query(
      `INSERT INTO users (name, email, phone)
       VALUES ($1,$2,$3)
       RETURNING id`,
      [name, email, phone]
    );

    userId = userRes.rows[0].id;
  }

  // ✅ Update flat
  const result = await pool.query(
    `UPDATE flats 
     SET flat_number=$1, block=$2, floor=$3, flat_type=$4, user_id=$5, is_active=$6
     WHERE id=$7
     RETURNING *`,
    [flat_number, block, floor, flat_type, userId, is_active, req.params.id]
  );

  res.status(200).json({
    success: true,
    flat: result.rows[0],
  });
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