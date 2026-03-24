const { pool } = require("../db");

exports.addSubscription = (async (req, res, next) => {
  const { flat_id, plan_id, month, year, amount, status, due_date } = req.body;

  const existing = await pool.query(
    "SELECT * FROM monthly_subscriptions WHERE flat_id=$1 AND month=$2 AND year=$3",
    [flat_id, month, year]
  );
  if (existing.rows.length > 0)
    return res.status(409).json({
      success: false,
      message: "Subscription already exists for this flat/month"
    });

  const result = await pool.query(
    `INSERT INTO monthly_subscriptions (flat_id, plan_id, month, year, amount, status, due_date)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
    [flat_id, plan_id, month, year, amount, status || "pending", due_date]
  );

  const created = result.rows[0];
  if ((created.status || "").toLowerCase() === "paid") {
    const transactionId = "TXN" + Date.now();
    await pool.query(
      `INSERT INTO payments
       (subscription_id, amount, payment_mode, transaction_id, status, payment_date)
       VALUES ($1, $2, 'admin', $3, 'paid', NOW())
       ON CONFLICT (subscription_id) DO UPDATE
       SET status='paid', payment_mode='admin', transaction_id=$3, payment_date=NOW()`,
      [created.id, created.amount, transactionId]
    );
  }

  res.status(201).json({ success: true, subscription: created });
});

exports.getAllSubscriptions = async (req, res) => {
  try {
    const month = (req.params.month || req.query.month || "all").toString().trim(); // format YYYY-MM or "all"

    // If user wants all months
    if (month.toLowerCase() === "all") {
      const year = new Date().getFullYear();

      // Fetch all assigned flats + all subscriptions for the year
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
          COALESCE(ms.due_date, to_date($2 || '-10', 'YYYY-MM-DD')) AS due_date,
          COALESCE(ms.status, 'pending') AS status,
          ms.month,
          COALESCE(ms.year, $1) AS year
        FROM flats f
        JOIN users u ON f.user_id = u.id
        LEFT JOIN monthly_subscriptions ms
          ON ms.flat_id = f.id AND ms.year = $1
        ORDER BY f.block, f.flat_number, ms.month
      `;

      const { rows } = await pool.query(query, [year, `${year}-01`]);

      const result = [];
      const flatsMap = {};

      rows.forEach(r => {
        const key = r.flat_id;
        if (!flatsMap[key]) flatsMap[key] = {};
        if (r.subscription_id) flatsMap[key][r.month] = r;
      });

      Object.keys(flatsMap).forEach(flatId => {
        for (let m = 1; m <= 12; m++) {
          if (flatsMap[flatId][m]) {
            result.push(flatsMap[flatId][m]);
          } else {
            const flatInfo = rows.find(r => r.flat_id == flatId);
            result.push({
              flat_id: flatInfo.flat_id,
              flat_number: flatInfo.flat_number,
              block: flatInfo.block,
              user_id: flatInfo.user_id,
              user_name: flatInfo.user_name,
              user_email: flatInfo.user_email,
              subscription_id: 0,
              plan_id: 1,
              amount: 2200,
              due_date: `${year}-${String(m).padStart(2, "0")}-10`,
              status: "pending",
              month: m,
              year: year
            });
          }
        }
      });

      return res.status(200).json({ success: true, subscriptions: result });
    }

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
        COALESCE(ms.status, 'pending') AS status
      FROM flats f
      JOIN users u ON f.user_id = u.id
      LEFT JOIN monthly_subscriptions ms
        ON ms.flat_id = f.id AND ms.month = $1 AND ms.year = $2
      ORDER BY f.block, f.flat_number
    `;

    const { rows } = await pool.query(query, [
      monthNum,
      year,
      `${year}-${String(monthNum).padStart(2, "0")}`
    ]);

    res.status(200).json({ success: true, subscriptions: rows });

  } catch (err) {
    console.error("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getSubscriptionByMonth = async (req, res) => {
  try {
    const { month } = req.params; 

    const flatRes = await pool.query(
      `SELECT id, plan_id, flat_number, flat_type, block FROM flats WHERE user_id=$1 AND is_active=true`,
      [req.user.id]
    );
    const flat = flatRes.rows[0];
    if (!flat) return res.status(404).json({ success: false, message: "No flat assigned" });

    const userRes = await pool.query(
      `SELECT created_at FROM users WHERE id=$1`,
      [req.user.id]
    );
    const userCreatedAt = userRes.rows[0]?.created_at;
    const onboardingDate = userCreatedAt ? new Date(userCreatedAt) : new Date();

    const planHistoryRes = await pool.query(
      `SELECT id, plan_name, amount, effective_from
       FROM subscription_plans
       WHERE regexp_replace(LOWER(TRIM(plan_name)), '[^a-z0-9]', '', 'g')
             = regexp_replace(LOWER(TRIM($1)), '[^a-z0-9]', '', 'g')
       ORDER BY effective_from ASC`,
      [flat.flat_type]
    );
    const planHistory = planHistoryRes.rows;
    const fallbackPlan = {
      id: flat.plan_id || 1,
      plan_name: flat.flat_type || "Maintenance",
      amount: 2200,
    };
    const now = new Date();

    const resolvePlanForMonth = (y, m) => {
      if (!planHistory.length) return null;
      const target = new Date(y, m - 1, 1);
      const eligible = planHistory.filter((p) => new Date(p.effective_from) <= target);
      if (!eligible.length) return null;
      return eligible[eligible.length - 1];
    };

    const currentPlan = resolvePlanForMonth(now.getFullYear(), now.getMonth() + 1) || fallbackPlan;

    let subscriptions = [];

    if (month && month.toLowerCase() === "all") {
      const startDate = userCreatedAt ? new Date(userCreatedAt) : now;
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth() + 1;
      const endYear = now.getFullYear();
      const endMonth = now.getMonth() + 1;

      const subsRes = await pool.query(
        `SELECT 
          ms.id AS subscription_id,
          ms.plan_id,
          sp.plan_name,
          ms.month,
          ms.year,
          ms.amount,
          COALESCE(p.status, 'pending') AS status,
          p.payment_mode,
          p.transaction_id,
          f.flat_number,
          f.block,
          u.name AS user_name
        FROM monthly_subscriptions ms
        JOIN flats f ON ms.flat_id = f.id
        JOIN users u ON f.user_id = u.id
        LEFT JOIN subscription_plans sp ON sp.id = ms.plan_id
        LEFT JOIN LATERAL (
          SELECT status, payment_mode, transaction_id
          FROM payments
          WHERE subscription_id = ms.id
          ORDER BY payment_date DESC
          LIMIT 1
        ) p ON true
        WHERE ms.flat_id = $1
          AND (
            (ms.year > $2 OR (ms.year = $2 AND ms.month >= $3))
            AND
            (ms.year < $4 OR (ms.year = $4 AND ms.month <= $5))
          )
        ORDER BY ms.year ASC, ms.month ASC`,
        [flat.id, startYear, startMonth, endYear, endMonth]
      );

      const dbSubs = subsRes.rows;
      const subMap = {};
      dbSubs.forEach((s) => {
        subMap[`${s.year}-${s.month}`] = s;
      });

      for (let y = startYear; y <= endYear; y++) {
        const monthStart = y === startYear ? startMonth : 1;
        const monthEnd = y === endYear ? endMonth : 12;

        for (let m = monthStart; m <= monthEnd; m++) {
          const key = `${y}-${m}`;
          const monthPlan = resolvePlanForMonth(y, m);
          if (subMap[key]) {
            const status = (subMap[key].status || "").toLowerCase();
            subscriptions.push({
              ...subMap[key],
              plan_id: subMap[key].plan_id || monthPlan?.id || flat.plan_id || 1,
              plan_name: subMap[key].plan_name || monthPlan?.plan_name || flat.flat_type || "Maintenance",
              amount: status === "paid"
                ? (subMap[key].amount || monthPlan?.amount || fallbackPlan.amount || 2200)
                : (monthPlan?.amount || subMap[key].amount || fallbackPlan.amount || 2200),
            });
          } else {
            subscriptions.push({
              subscription_id: 0,
              plan_id: monthPlan?.id || flat.plan_id || fallbackPlan.id || 1,
              plan_name: monthPlan?.plan_name || flat.flat_type || fallbackPlan.plan_name || "Maintenance",
              month: m,
              year: y,
              amount: monthPlan?.amount || fallbackPlan.amount || 2200,
              status: "pending",
              flat_number: flat.flat_number,
              block: "N/A",
              user_name: req.user.name,
              payment_mode: null,
              transaction_id: null
            });
          }
        }
      }

      return res.status(200).json({ success: true, subscriptions });
    }

    let year, monthNum;
    if (!month) {
      const today = new Date();
      year = today.getFullYear();
      monthNum = today.getMonth() + 1;
    } else {
      const [yearStr, monthStr] = month.split("-");
      year = parseInt(yearStr, 10);
      monthNum = parseInt(monthStr, 10);
      if (!year || !monthNum) return res.status(400).json({ message: "Invalid month format" });

      const requestedDate = new Date(year, monthNum - 1, 1);
      const onboardingMonthStart = new Date(
        onboardingDate.getFullYear(),
        onboardingDate.getMonth(),
        1
      );
      if (requestedDate < onboardingMonthStart) {
        return res.status(200).json({ success: true, subscriptions: [] });
      }
    }

    const requestedPlan = resolvePlanForMonth(year, monthNum);

    let subRes = await pool.query(
      `SELECT ms.*, COALESCE(p.status, 'pending') AS payment_status,
              p.payment_mode, p.transaction_id, p.payment_date
       FROM monthly_subscriptions ms
       LEFT JOIN LATERAL (
         SELECT status, payment_mode, transaction_id, payment_date
         FROM payments
         WHERE subscription_id = ms.id
         ORDER BY payment_date DESC
         LIMIT 1
       ) p ON true
       WHERE ms.flat_id=$1 AND ms.month=$2 AND ms.year=$3`,
      [flat.id, monthNum, year]
    );

    let subscription = subRes.rows[0];
    if (!subscription) {
      const insertRes = await pool.query(
        `INSERT INTO monthly_subscriptions
         (flat_id, plan_id, month, year, amount, status, due_date)
         VALUES ($1, $2, $3, $4, $5, 'pending', $6)
         ON CONFLICT (flat_id, month, year)
         DO UPDATE SET
           plan_id = EXCLUDED.plan_id,
           amount = EXCLUDED.amount,
           due_date = COALESCE(monthly_subscriptions.due_date, EXCLUDED.due_date)
         RETURNING *`,
        [
          flat.id,
          requestedPlan?.id || flat.plan_id || fallbackPlan.id || 1,
          monthNum,
          year,
          requestedPlan?.amount || fallbackPlan.amount || 2200,
          `${year}-${String(monthNum).padStart(2, "0")}-10`
        ]
      );
      subscription = insertRes.rows[0];
      subscription.payment_status = "pending";
    } else if (requestedPlan && (subscription.payment_status || "").toLowerCase() !== "paid") {
      if (
        Number(subscription.amount) !== Number(requestedPlan.amount || fallbackPlan.amount || 2200) ||
        Number(subscription.plan_id) !== Number(requestedPlan.id || flat.plan_id || fallbackPlan.id || 1)
      ) {
        const refreshedRes = await pool.query(
          `UPDATE monthly_subscriptions
           SET plan_id=$1, amount=$2
           WHERE id=$3
           RETURNING *`,
          [
            requestedPlan.id || flat.plan_id || fallbackPlan.id || 1,
            requestedPlan.amount || fallbackPlan.amount || 2200,
            subscription.id
          ]
        );
        subscription = { ...refreshedRes.rows[0], payment_status: subscription.payment_status };
      }
    }

    if (!req.params.month) {
      return res.status(200).json({
        success: true,
        pending: {
          flat_id: flat.id,
          flat_type: flat.flat_type || requestedPlan?.plan_name || currentPlan.plan_name,
          flat_number: flat.flat_number,
          plan_id: requestedPlan?.id || flat.plan_id || currentPlan.id,
          plan_name: requestedPlan?.plan_name || currentPlan.plan_name,
          amount: subscription.payment_status === "paid" ? 0 : subscription.amount,
          status: subscription.payment_status
        }
      });
    }

    subscriptions.push({
      subscription_id: subscription.id,
      month: subscription.month,
      year: subscription.year,
      amount: subscription.amount,
      status: subscription.payment_status,
      flat_type: flat.flat_type || requestedPlan?.plan_name || currentPlan.plan_name || "Maintenance",
      plan_name: requestedPlan?.plan_name || currentPlan.plan_name || flat.flat_type || "Maintenance",
      flat_number: flat.flat_number,
      block: flat.block || "N/A",
      user_name: req.user.name,
      payment_mode: subscription.payment_mode,
      transaction_id: subscription.transaction_id,
      payment_date: subscription.payment_date
    });

    res.status(200).json({ success: true, subscriptions });

  } catch (error) {
    console.error(" ERROR:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSubscriptionsByMonthAdmin = async (req, res) => {
  try {
    const { month } = req.params;
    if (!month) return res.status(400).json({ message: "Month required" });
    if (month.toLowerCase() === "all") {
      return exports.getAllSubscriptions(req, res);
    }

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
    console.log("ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
exports.getUserSubscriptions = async (req, res) => {
  try {

    const result = await pool.query(
      `SELECT 
  ms.id,
  ms.month,
  ms.year,
  ms.amount,

  COALESCE(p.status, 'pending') AS status,
  p.payment_mode,
  p.transaction_id

FROM monthly_subscriptions ms

JOIN flats f ON ms.flat_id = f.id

LEFT JOIN LATERAL (
  SELECT *
  FROM payments
  WHERE subscription_id = ms.id
  ORDER BY id DESC
  LIMIT 1
) p ON true

WHERE f.user_id = $1

ORDER BY ms.year DESC, ms.month DESC;`,
      [req.user.id]
    ); console.log("USER:", req.user);

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
