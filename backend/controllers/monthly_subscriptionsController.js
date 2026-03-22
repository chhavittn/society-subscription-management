const { pool } = require("../db");

exports.addSubscription = (async (req, res, next) => {
  const { flat_id, plan_id, month, year, amount, status, due_date } = req.body;

  //  unique flat+month+year
  const existing = await pool.query(
    "SELECT * FROM monthly_subscriptions WHERE flat_id=$1 AND month=$2 AND year=$3",
    [flat_id, month, year]
  );
  if (existing.rows.length > 0)
    return res.status(404).json({
      success: false,
      message: "Subscription already exists for this flat/month"
    });

  const result = await pool.query(
    `INSERT INTO monthly_subscriptions (flat_id, plan_id, month, year, amount, status, due_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [flat_id, plan_id, month, year, amount, status || "pending", due_date]
  );

  res.status(201).json({ success: true, subscription: result.rows[0] });
});


exports.getAllSubscriptions = async (req, res) => {
  try {
    const { month } = req.params; // format YYYY-MM
    if (!month) return res.status(400).json({ message: "Month required" });

    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    if (!year || !monthNum)
      return res.status(400).json({ message: "Invalid month format" });

    // 🔹 Fetch all assigned flats + subscription info for selected month
    const query = `
      SELECT
        f.id AS flat_id,
        f.flat_number,
        f.block,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        COALESCE(ms.id, 0) AS subscription_id,
        COALESCE(ms.plan_id, 1) AS plan_id,
        COALESCE(ms.amount, 2200) AS amount,
        COALESCE(ms.due_date, to_date($3 || '-10', 'YYYY-MM-DD')) AS due_date,
        COALESCE(ms.status, 'pending') AS status
      FROM flats f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN monthly_subscriptions ms
        ON ms.flat_id = f.id AND ms.month = $1 AND ms.year = $2
      ORDER BY f.block, f.flat_number
    `;

    const { rows } = await pool.query(query, [monthNum, year, `${year}-${String(monthNum).padStart(2, "0")}`]);

    res.status(200).json({ success: true, subscriptions: rows });

  } catch (err) {
    console.error("❌ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.updateSubscription = async (req, res) => {

  const existing = await pool.query(
    "SELECT * FROM monthly_subscriptions WHERE id=$1",
    [req.params.id]
  )

  const sub = existing.rows[0]

  if (!sub) {
    return res.status(404).json({ success: false })
  }

  const updated = await pool.query(`
    UPDATE monthly_subscriptions
    SET 
      plan_id = $1,
      amount = $2,
      status = $3,
      due_date = $4
    WHERE id=$5
    RETURNING *
  `, [
    req.body.plan_id || sub.plan_id,
    req.body.amount || sub.amount,
    req.body.status || sub.status,
    req.body.due_date || sub.due_date,
    req.params.id
  ])

  res.json({ success: true, subscription: updated.rows[0] })
}

exports.deleteSubscription = (async (req, res, next) => {
  const result = await pool.query(`DELETE FROM monthly_subscriptions WHERE id=$1 RETURNING *`, [req.params.id]);
  const sub = result.rows[0];
  if (!sub) {
    return res.status(404).json({
      success: false,
      message: "Subscription not found"
    });
  }
  res.status(200).json({ success: true, message: "Subscription deleted successfully" });
});

// GET /subscriptions/:month -> expects month as "YYYY-MM"
exports.getSubscriptionByMonth = async (req, res) => {
  try {
    const { month } = req.params;

    if (!month) {
      return res.status(400).json({ message: "Month required" });
    }

    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    if (!year || !monthNum) {
      return res.status(400).json({ message: "Invalid month format" });
    }

    const query = `
      SELECT 
        ms.id,
        ms.month,
        ms.year,
        ms.amount,
        ms.due_date,

        sp.plan_name,
        f.flat_number,
        f.block,
        u.name as user_name,

        -- ✅ PAYMENT DATA
        COALESCE(p.status, 'pending') AS status,
        p.payment_mode,
        p.transaction_id,
        p.payment_date

      FROM monthly_subscriptions ms

      JOIN flats f ON ms.flat_id = f.id
      JOIN users u ON f.user_id = u.id
      JOIN subscription_plans sp ON ms.plan_id = sp.id

      -- ✅ SAFE JOIN
      LEFT JOIN LATERAL (
        SELECT status, payment_mode, transaction_id, payment_date
        FROM payments
        WHERE subscription_id = ms.id
        ORDER BY id DESC
        LIMIT 1
      ) p ON true

      WHERE ms.month = $1 
      AND ms.year = $2
      AND f.user_id = $3

      LIMIT 1
    `;

    const result = await pool.query(query, [monthNum, year, req.user.id]);

    res.status(200).json({
      success: true,
      subscriptions: result.rows,
    });

  } catch (error) {
    console.log("❌ ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

// exports.getSubscriptionsByMonthAdmin = async (req, res) => {
//   try {
//     const { month } = req.params;
//     if (!month) return res.status(400).json({ message: "Month required" });

//     const [yearStr, monthStr] = month.split("-");
//     const year = parseInt(yearStr, 10);
//     const monthNum = parseInt(monthStr, 10);

//     if (!year || !monthNum)
//       return res.status(400).json({ message: "Invalid month format" });

//     const query = `
//       SELECT
//         f.id AS flat_id,
//         f.flat_number,
//         f.block,
//         u.id AS user_id,
//         u.name AS user_name,
//         u.email AS user_email,
//         COALESCE(ms.id, 0) AS subscription_id,
//         COALESCE(ms.plan_id, 1) AS plan_id,
//         COALESCE(ms.amount, 2200) AS amount,
//         COALESCE(ms.due_date, to_date($3 || '-10', 'YYYY-MM-DD')) AS due_date,
//         COALESCE(p.status, ms.status, 'pending') AS status,
//         p.payment_mode,
//         p.transaction_id,
//         p.payment_date
//       FROM flats f
//       JOIN users u ON u.id = f.user_id           -- only assigned users
//       LEFT JOIN monthly_subscriptions ms
//         ON ms.flat_id = f.id AND ms.month = $1 AND ms.year = $2
//       LEFT JOIN LATERAL (
//         SELECT status, payment_mode, transaction_id, payment_date
//         FROM payments
//         WHERE subscription_id = ms.id
//         ORDER BY id DESC
//         LIMIT 1
//       ) p ON true
//       ORDER BY f.block, f.flat_number
//     `;

//     const { rows } = await pool.query(query, [monthNum, year, `${year}-${String(monthNum).padStart(2,"0")}`]);

//     res.status(200).json({
//       success: true,
//       subscriptions: rows,
//     });
//   } catch (err) {
//     console.log("❌ ERROR:", err);
//     res.status(500).json({ message: err.message });
//   }
// };

exports.getSubscriptionsByMonthAdmin = async (req, res) => {
  try {
    const { month } = req.params;
    if (!month) return res.status(400).json({ message: "Month required" });

    const [yearStr, monthStr] = month.split("-");
    const year = parseInt(yearStr, 10);
    const monthNum = parseInt(monthStr, 10);

    if (!year || !monthNum)
      return res.status(400).json({ message: "Invalid month format" });

    const query = `
      SELECT
        f.id AS flat_id,
        f.flat_number,
        f.block,
        u.id AS user_id,
        u.name AS user_name,
        u.email AS user_email,
        COALESCE(ms.id, 0) AS subscription_id,
        COALESCE(ms.plan_id, 1) AS plan_id,
        COALESCE(ms.amount, 2200) AS amount,
        COALESCE(ms.due_date, to_date($3 || '-10', 'YYYY-MM-DD')) AS due_date,
        COALESCE(p.status, ms.status, 'pending') AS status,
        p.payment_mode,
        p.transaction_id,
        p.payment_date
      FROM flats f
      JOIN users u ON u.id = f.user_id
      LEFT JOIN monthly_subscriptions ms
        ON ms.flat_id = f.id AND ms.month = $1 AND ms.year = $2
      LEFT JOIN LATERAL (
        SELECT status, payment_mode, transaction_id, payment_date
        FROM payments
        WHERE subscription_id = ms.id
        ORDER BY id DESC
        LIMIT 1
      ) p ON true
       WHERE u.name IS NOT NULL AND u.name <> ''
    AND u.email IS NOT NULL AND u.email <> ''
      ORDER BY f.block, f.flat_number
    `;

    const { rows } = await pool.query(query, [
      monthNum,
      year,
      `${year}-${String(monthNum).padStart(2, "0")}`,
    ]);

    res.status(200).json({
      success: true,
      subscriptions: rows,
    });
  } catch (err) {
    console.log("❌ ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// exports.getUserSubscriptions = async (req, res) => {
//   try {

//     const result = await pool.query(
//       `SELECT 
//   ms.id,
//   ms.month,
//   ms.year,
//   ms.amount,

//   COALESCE(p.status, 'pending') AS status,
//   p.payment_mode,
//   p.transaction_id

// FROM monthly_subscriptions ms

// JOIN flats f ON ms.flat_id = f.id

// -- ✅ THIS IS THE FIX (no crash)
// LEFT JOIN LATERAL (
//   SELECT *
//   FROM payments
//   WHERE subscription_id = ms.id
//   ORDER BY id DESC
//   LIMIT 1
// ) p ON true

// WHERE f.user_id = $1

// ORDER BY ms.year DESC, ms.month DESC;`,
//       [req.user.id]
//     ); console.log("USER:", req.user);

//     res.status(200).json({
//       success: true,
//       subscriptions: result.rows
//     });

//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     });
//   }
// };
exports.getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-based
    const currentYear = today.getFullYear();

    // 🔹 Step 1: Get user's flat
    const flatRes = await pool.query(
      "SELECT id, plan_id FROM flats WHERE user_id=$1 AND is_active=true",
      [userId]
    );
    if (!flatRes.rows[0]) {
      return res.status(404).json({ success: false, message: "No flat assigned" });
    }
    const flat = flatRes.rows[0];
    const planId = flat.plan_id;

    // 🔹 Step 2: Get plan amount
    const planRes = await pool.query("SELECT amount FROM subscription_plans WHERE id=$1", [planId]);
    const planAmount = planRes.rows[0]?.amount || 0;

    // 🔹 Step 3: Get all subscriptions for this flat for the current year
    const subsRes = await pool.query(
      `SELECT 
         ms.id AS subscription_id,
         ms.month,
         ms.year,
         ms.amount,
         COALESCE(p.status, 'pending') AS status,
         p.payment_mode,
         p.transaction_id
       FROM monthly_subscriptions ms
       LEFT JOIN LATERAL (
         SELECT *
         FROM payments
         WHERE subscription_id = ms.id
         ORDER BY payment_date DESC
         LIMIT 1
       ) p ON true
       WHERE ms.flat_id=$1 AND ms.year=$2
       ORDER BY ms.month ASC`,
      [flat.id, currentYear]
    );

    const dbSubs = subsRes.rows;

    // 🔹 Step 4: Map subscriptions by month
    const subMap = {};
    dbSubs.forEach(sub => {
      subMap[sub.month] = sub;
    });

    // 🔹 Step 5: Fill months from Jan to current month
    const subscriptions = [];
    for (let m = 1; m <= currentMonth; m++) {
      if (subMap[m]) {
        subscriptions.push(subMap[m]); // actual DB subscription
      } else {
        subscriptions.push({
          subscription_id: 0,
          month: m,
          year: currentYear,
          amount: planAmount,
          status: "pending",
          payment_mode: null,
          transaction_id: null,
        });
      }
    }

    res.status(200).json({ success: true, subscriptions });

  } catch (error) {
    console.error("❌ getUserSubscriptions error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getSubscriptionById = async (req, res) => {
  const result = await pool.query(`
    SELECT ms.id, ms.month, ms.year, ms.amount, ms.status, ms.due_date,
           f.id as flat_id, f.flat_number, f.block,
           u.id as user_id, u.name as user_name, u.email as user_email,
           p.payment_mode, p.transaction_id, p.payment_date,
           sp.plan_name
    FROM monthly_subscriptions ms
    LEFT JOIN flats f ON ms.flat_id=f.id
    LEFT JOIN users u ON f.user_id=u.id
    LEFT JOIN payments p ON ms.id = p.subscription_id AND p.status='success'
    LEFT JOIN subscription_plans sp ON ms.plan_id = sp.id
    WHERE ms.id=$1
  `, [req.params.id]);

  const sub = result.rows[0];
  if (!sub) {
    return res.status(404).json({ success: false, message: "Subscription not found" });
  }

  if (req.user.role !== "admin" && sub.user_id !== req.user.id) {
    return res.status(403).json({ success: false, message: "Access denied" });
  }

  res.status(200).json({ success: true, subscription: sub });
};