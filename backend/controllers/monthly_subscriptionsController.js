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
  let { page = 1, limit = 10, search = "", status, month, year } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const offset = (page - 1) * limit;

  let searchQuery = `%${search}%`;
  let queryParams = [searchQuery, limit, offset];

  let statusFilter = "";
  if (status) {
    statusFilter = `AND ms.status=$${queryParams.length + 1}`;
    queryParams.push(status);
  }

  let monthYearFilter = "";
  if (month && year) {
    const monthNum = parseInt(month, 10);
    const yearNum = parseInt(year, 10);
    if (!Number.isNaN(monthNum) && !Number.isNaN(yearNum)) {
      monthYearFilter = `AND ms.month=$${queryParams.length + 1} AND ms.year=$${queryParams.length + 2}`;
      queryParams.push(monthNum, yearNum);
    }
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
    ${monthYearFilter}
    ORDER BY ms.year DESC, ms.month DESC
    LIMIT $2 OFFSET $3
  `, queryParams);

  res.status(200).json({ success: true, subscriptions: result.rows });
});

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


exports.getSubscriptionByMonth = async (req, res) => {
  try {
    const { month } = req.params

    if (!month) {
      return res.status(400).json({ message: "Month required" })
    }

    const [yearStr, monthStr] = month.split("-")

    const year = parseInt(yearStr)
    const monthNum = parseInt(monthStr)

    console.log("Filtering → Year:", year, "Month:", monthNum)

    const result = await pool.query(
      `
      SELECT 
        ms.id, ms.month, ms.year, ms.amount, ms.status, ms.due_date,
        f.flat_number, f.block,
        u.name as user_name
      FROM monthly_subscriptions ms
      JOIN flats f ON ms.flat_id = f.id
      JOIN users u ON f.user_id = u.id
      WHERE ms.month = $1 AND ms.year = $2
      ORDER BY ms.id DESC
      `,
      [monthNum, year]
    )

    console.log("Filtered rows:", result.rows)

    res.status(200).json({
      success: true,
      subscriptions: result.rows
    })

  } catch (error) {
    console.log(error)
    res.status(500).json({ message: error.message })
  }
}

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