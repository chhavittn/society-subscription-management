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

exports.getAllSubscriptions = (async (req, res, next) => {
  let { page = 1, limit = 10, search = "", status } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  let searchQuery = `%${search}%`;
  let queryParams = [searchQuery, limit, offset];

  let statusFilter = "";
  if (status) {
    statusFilter = `AND ms.status=$4`;
    queryParams.push(status);
  }

  const result = await pool.query(`
    SELECT ms.id, ms.month, ms.year, ms.amount, ms.status, ms.due_date,
           f.id as flat_id, f.flat_number, f.block,
           u.id as user_id, u.name as user_name, u.email as user_email
    FROM monthly_subscriptions ms
    LEFT JOIN flats f ON ms.flat_id=f.id
    LEFT JOIN users u ON f.user_id=u.id
    WHERE f.flat_number ILIKE $1 OR u.name ILIKE $1
    ${statusFilter}
    ORDER BY ms.year DESC, ms.month DESC
    LIMIT $2 OFFSET $3
  `, queryParams);

  res.status(200).json({ success: true, subscriptions: result.rows });
});

// exports.getSubscriptionById = async (req, res, next) => {
//   try {
//     const result = await pool.query(`
//       SELECT 
//         ms.id, ms.month, ms.year, ms.amount, ms.status, ms.due_date,
//         f.id as flat_id, f.flat_number, f.block,
//         u.id as user_id, u.name as user_name, u.email as user_email,
//         p.payment_mode, p.transaction_id, p.payment_date
//       FROM monthly_subscriptions ms
//       LEFT JOIN flats f ON ms.flat_id = f.id
//       LEFT JOIN users u ON f.user_id = u.id
//       LEFT JOIN payments p ON p.subscription_id = ms.id
//       WHERE ms.id = $1
//       ORDER BY p.payment_date DESC
//       LIMIT 1
//     `, [req.params.id])

//     const sub = result.rows[0]

//     if (!sub) {
//       return res.status(404).json({
//         success: false,
//         message: "Subscription not found"
//       })
//     }

//     if (req.user.role !== "admin" && sub.user_id !== req.user.id) {
//       return res.status(403).json({
//         success: false,
//         message: "Access denied"
//       })
//     }

//     res.status(200).json({
//       success: true,
//       subscription: sub
//     })
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }
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
exports.updateSubscription = (async (req, res, next) => {
  const { plan_id, amount, status, due_date } = req.body;
  const result = await pool.query(`
    UPDATE monthly_subscriptions
    SET plan_id=$1, amount=$2, status=$3, due_date=$4
    WHERE id=$5
    RETURNING *
  `, [plan_id, amount, status, due_date, req.params.id]);

  const sub = result.rows[0];
  if (!sub) {
    return res.status(404).json({
      success: false,
      message: "Subscription not found"
    });
  }
  res.status(200).json({ success: true, subscription: sub });
});

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

exports.getUserSubscriptions = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT 
        ms.id,
        ms.month,
        ms.year,
        ms.amount,
        ms.status,
        sp.plan_name,
        f.flat_number,
        p.payment_mode,
        p.transaction_id
       FROM monthly_subscriptions ms
       JOIN flats f ON ms.flat_id = f.id
       JOIN subscription_plans sp ON ms.plan_id = sp.id
       LEFT JOIN payments p ON p.subscription_id = ms.id AND p.status='success'
       WHERE f.user_id=$1
       ORDER BY ms.year DESC, ms.month DESC`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      subscriptions: result.rows
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
exports.getSubscriptionByMonth = async (req, res) => {
  try {
    const { month } = req.params; // expecting YYYY-MM
    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ success: false, message: "Invalid month format. Please select a valid month." });
    }

    let [yearParam, monthParam] = month.split("-");
    monthParam = parseInt(monthParam, 10); // ensures it's number 1-12
    yearParam = parseInt(yearParam, 10);

    if (isNaN(yearParam) || isNaN(monthParam) || monthParam < 1 || monthParam > 12) {
      return res.status(400).json({ success: false, message: "Invalid month format. Please select a valid month." });
    }

    const result = await pool.query(`
      SELECT ms.id, ms.month, ms.year, ms.amount, ms.status, ms.due_date,
             f.id as flat_id, f.flat_number, f.block,
             u.id as user_id, u.name as user_name, u.email as user_email,
             p.payment_mode, p.transaction_id, p.payment_date,
             sp.plan_name
      FROM monthly_subscriptions ms
      JOIN flats f ON ms.flat_id=f.id
      JOIN users u ON f.user_id=u.id
      LEFT JOIN payments p ON ms.id = p.subscription_id AND p.status='success'
      LEFT JOIN subscription_plans sp ON ms.plan_id = sp.id
      WHERE f.user_id=$1 AND ms.month=$2 AND ms.year=$3
      ORDER BY ms.id DESC
      LIMIT 1
    `, [req.user.id, monthParam, yearParam]);

    const sub = result.rows[0];
    if (!sub) {
      return res.status(200).json({
        success: true,
        subscription: null
      });
    }
    const totalAmount = parseFloat(sub.amount);
    const breakdown = [
      { name: sub.plan_name || "Maintenance", amount: totalAmount * 0.7 },
      { name: "Security & Cleaning", amount: totalAmount * 0.15 },
      { name: "Water & Utilities", amount: totalAmount * 0.10 },
      { name: "Sinking Fund", amount: totalAmount * 0.05 },
    ];

    res.status(200).json({ success: true, subscription: { ...sub, breakdown } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};