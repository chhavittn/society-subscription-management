const { pool } = require("../db");

// exports.makePayment = async (req, res) => {
//   try {
//     let { flat_id, plan_id, month, year, payment_mode } = req.body;

//     // 🔹 STEP 1: Get flat_id for user
//     if (req.user.role !== "admin") {
//       const flatRes = await pool.query(
//         "SELECT id FROM flats WHERE user_id=$1 AND is_active=true",
//         [req.user.id]
//       );

//       if (!flatRes.rows[0]) {
//         return res.status(404).json({
//           success: false,
//           message: "No flat assigned to this user",
//         });
//       }

//       flat_id = flatRes.rows[0].id;
//     }

//     // 🔹 STEP 2: Validate input
//     if (!flat_id || !plan_id || !month || !year || !payment_mode) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     // 🔹 STEP 3: Get plan
//     const planRes = await pool.query(
//       "SELECT * FROM subscription_plans WHERE id=$1",
//       [plan_id]
//     );

//     if (!planRes.rows[0]) {
//       return res.status(404).json({
//         success: false,
//         message: "Plan not found",
//       });
//     }

//     const plan = planRes.rows[0];

//     // 🔹 STEP 4: Get or create subscription (NO STATUS UPDATE HERE ❌)
//     let subRes = await pool.query(
//       `SELECT * FROM monthly_subscriptions
//        WHERE flat_id=$1 AND month=$2 AND year=$3`,
//       [flat_id, month, year]
//     );

//     let subscription;

//     if (subRes.rows.length === 0) {
//       const newSub = await pool.query(
//         `INSERT INTO monthly_subscriptions
//          (flat_id, plan_id, month, year, amount)
//          VALUES ($1, $2, $3, $4, $5)
//          RETURNING *`,
//         [flat_id, plan_id, month, year, plan.amount]
//       );

//       subscription = newSub.rows[0];
//     } else {
//       subscription = subRes.rows[0];
//     }

//     // 🔹 STEP 5: UPSERT PAYMENT (VERY IMPORTANT 🔥)
//     const existingPayment = await pool.query(
//       `SELECT * FROM payments WHERE subscription_id=$1`,
//       [subscription.id]
//     );

//     const transactionId = "TXN" + Date.now();

//     let payment;

//     if (existingPayment.rows.length > 0) {
//       // ✅ UPDATE existing payment
//       const updated = await pool.query(
//         `UPDATE payments
//          SET status='paid',
//              payment_mode=$1,
//              transaction_id=$2,
//              payment_date=NOW()
//          WHERE subscription_id=$3
//          RETURNING *`,
//         [payment_mode, transactionId, subscription.id]
//       );

//       payment = updated.rows[0];
//     } else {
//       // ✅ INSERT new payment
//       const inserted = await pool.query(
//         `INSERT INTO payments
//          (subscription_id, amount, payment_mode, transaction_id, status)
//          VALUES ($1, $2, $3, $4, 'paid')
//          RETURNING *`,
//         [subscription.id, plan.amount, payment_mode, transactionId]
//       );

//       payment = inserted.rows[0];
//     }

//     // 🔹 FINAL RESPONSE
//     res.status(200).json({
//       success: true,
//       message: "Payment successful",
//       payment,
//       subscription,
//     });

//   } catch (error) {
//     console.error("❌ Payment error:", error);
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };


exports.makePayment = async (req, res) => {
  try {
    let { flat_id, plan_id, month, year, payment_mode } = req.body;

    // 🔹 Get user's flat if not admin
    if (req.user.role !== "admin") {
      const flatRes = await pool.query(
        "SELECT id FROM flats WHERE user_id=$1 AND is_active=true",
        [req.user.id]
      );

      if (!flatRes.rows[0]) {
        return res.status(404).json({
          success: false,
          message: "No flat assigned to this user",
        });
      }

      flat_id = flatRes.rows[0].id;
    }

    // 🔹 Validate input
    if (!flat_id || !plan_id || !month || !year || !payment_mode) {
      return res.status(400).json({ success: false, message: "All fields required" });
    }

    // 🔹 Get plan
    const planRes = await pool.query("SELECT * FROM subscription_plans WHERE id=$1", [plan_id]);
    if (!planRes.rows[0])
      return res.status(404).json({ success: false, message: "Plan not found" });

    const plan = planRes.rows[0];

    // 🔹 Get or create subscription
    let subRes = await pool.query(
      `SELECT * FROM monthly_subscriptions WHERE flat_id=$1 AND month=$2 AND year=$3`,
      [flat_id, month, year]
    );

    let subscription;
    if (subRes.rows.length === 0) {
      const newSub = await pool.query(
        `INSERT INTO monthly_subscriptions
         (flat_id, plan_id, month, year, amount, status, due_date)
         VALUES ($1,$2,$3,$4,$5,'paid', $6)
         RETURNING *`,
        [flat_id, plan_id, month, year, plan.amount, `${year}-${month}-10`]
      );
      subscription = newSub.rows[0];
    } else {
      // ✅ Update status to paid
      subscription = subRes.rows[0];
      await pool.query(
        `UPDATE monthly_subscriptions
         SET status='paid'
         WHERE id=$1`,
        [subscription.id]
      );
    }

    // 🔹 Insert or update payment
    const transactionId = "TXN" + Date.now();
    await pool.query(
      `INSERT INTO payments
       (subscription_id, amount, payment_mode, transaction_id, status, payment_date)
       VALUES ($1,$2,$3,$4,'paid', NOW())
       ON CONFLICT (subscription_id) DO UPDATE
       SET status='paid', payment_mode=$3, payment_date=NOW()`,
      [subscription.id, plan.amount, payment_mode, transactionId]
    );

    res.status(200).json({
      success: true,
      message: "Payment successful",
      subscription: { ...subscription, status: "paid" },
      transaction_id: transactionId,
    });
  } catch (error) {
    console.error("❌ Payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.markSubscriptionPaid = async (req, res) => {
  try {
    const { subscription_id, flat_id, month, year, plan_id, amount, due_date } = req.body;
    const transactionId = "TXN" + Date.now();

    let subscription;

    if (subscription_id) {
      // ✅ Update existing subscription
      const subRes = await pool.query(
        `UPDATE monthly_subscriptions
         SET status='paid'
         WHERE id=$1
         RETURNING *`,
        [subscription_id]
      );
      subscription = subRes.rows[0];
      if (!subscription) {
        return res.status(404).json({
          success: false,
          message: "Subscription not found",
        });
      }
    } else {
      if (!flat_id || !month || !year) {
        return res.status(400).json({
          success: false,
          message: "flat_id, month, year are required when subscription_id is missing",
        });
      }

      // 🔹 Create if missing, otherwise mark existing row as paid
      const newSub = await pool.query(
        `INSERT INTO monthly_subscriptions
         (flat_id, plan_id, month, year, amount, status, due_date)
         VALUES ($1, $2, $3, $4, $5, 'paid', $6)
         ON CONFLICT (flat_id, month, year)
         DO UPDATE SET status='paid'
         RETURNING *`,
        [
          flat_id,
          plan_id || 1,
          month,
          year,
          amount || 0,
          due_date || `${year}-${String(month).padStart(2, "0")}-10`,
        ]
      );
      subscription = newSub.rows[0];
    }

    // 🔹 Also insert a payment record for admin action
    await pool.query(
      `INSERT INTO payments
       (subscription_id, amount, payment_mode, transaction_id, status, payment_date)
       VALUES ($1, $2, 'admin', $3, 'paid', NOW())
       ON CONFLICT (subscription_id) DO UPDATE
       SET status='paid', payment_mode='admin', transaction_id=$3, payment_date=NOW()`,
      [subscription.id, subscription.amount, transactionId]
    );

    res.status(200).json({
      success: true,
      message: "Subscription marked as paid",
      subscription,
      transaction_id: transactionId,
    });
  } catch (error) {
    console.error("❌ Admin markPaid error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
exports.getAllPayments = (async (req, res, next) => {

  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const result = await pool.query(`
    SELECT p.id, p.amount, p.payment_mode, p.transaction_id,
           p.payment_date, p.status,
           ms.month, ms.year,
           f.flat_number,
           u.name as user_name
    FROM payments p
    LEFT JOIN monthly_subscriptions ms ON p.subscription_id = ms.id
    LEFT JOIN flats f ON ms.flat_id = f.id
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY p.payment_date DESC
    LIMIT $1 OFFSET $2
  `, [limit, offset]);

  res.status(200).json({
    success: true,
    payments: result.rows
  });

});

exports.getUserPayments = async (req, res, next) => {

  const result = await pool.query(`
    SELECT 
      p.id,
      p.amount,
      p.payment_mode,
      p.transaction_id,
      p.payment_date,
      p.status,

      ms.month,
      ms.year,
      ms.plan_id,

      sp.plan_name,

      f.flat_number

    FROM payments p
    LEFT JOIN monthly_subscriptions ms 
      ON p.subscription_id = ms.id

    LEFT JOIN flats f 
      ON ms.flat_id = f.id

    LEFT JOIN subscription_plans sp
      ON ms.plan_id = sp.id

    WHERE f.user_id = $1
    ORDER BY p.payment_date DESC
  `, [req.user.id]);

  res.status(200).json({
    success: true,
    payments: result.rows
  });
};
exports.getSinglePayment = (async (req, res, next) => {

  const result = await pool.query(`
    SELECT p.*, ms.month, ms.year, f.flat_number, u.id as user_id
    FROM payments p
    LEFT JOIN monthly_subscriptions ms ON p.subscription_id = ms.id
    LEFT JOIN flats f ON ms.flat_id = f.id
    LEFT JOIN users u ON f.user_id = u.id
    WHERE p.id=$1
  `, [req.params.id]);

  const payment = result.rows[0];

  if (!payment) {
    return res.status(404).json({
      success: false,
      message: "Payment not found"
    });
  }

  if (req.user.role !== "admin" && payment.user_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      message: "UAccess denied"
    });
  }

  res.status(200).json({
    success: true,
    payment
  });

});

exports.mypendingpayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();

    // 1️⃣ Get the user's flat
    const flatRes = await pool.query(
      `SELECT f.id, f.flat_type, f.flat_number
       FROM flats f
       WHERE f.user_id = $1 AND f.is_active = true`,
      [userId]
    );

    const flat = flatRes.rows[0];
    if (!flat) {
      return res.status(404).json({ success: false, message: "User has no assigned flat" });
    }

    // 2️⃣ Get the plan for that flat type
    const planRes = await pool.query(
      `SELECT *
       FROM subscription_plans
       WHERE regexp_replace(LOWER(TRIM(plan_name)), '[^a-z0-9]', '', 'g')
             = regexp_replace(LOWER(TRIM($1)), '[^a-z0-9]', '', 'g')
         AND effective_from <= $2::date
       ORDER BY effective_from DESC
       LIMIT 1`,
      [flat.flat_type, `${year}-${String(month).padStart(2, "0")}-01`]
    );
    const plan = planRes.rows[0];
    if (!plan) {
      return res.status(404).json({ success: false, message: "Plan not found for this flat type" });
    }

    // 3️⃣ Check if subscription/payment exists for this month
    let subRes = await pool.query(
      `SELECT ms.*, p.status AS payment_status
       FROM monthly_subscriptions ms
     LEFT JOIN payments p 
      ON p.id = (
        SELECT id FROM payments 
        WHERE subscription_id = ms.id 
        ORDER BY id DESC 
        LIMIT 1
      )
       WHERE ms.flat_id = $1 AND ms.month = $2 AND ms.year = $3`,
      [flat.id, month, year]
    );

    let subscription = subRes.rows[0];

    if (!subscription) {
      // If not exists, create pending subscription for the month
      const insertRes = await pool.query(
        `INSERT INTO monthly_subscriptions
         (flat_id, plan_id, month, year, amount, status)
         VALUES ($1, $2, $3, $4, $5, 'pending')
         RETURNING *`,
        [flat.id, plan.id, month, year, plan.amount]
      );
      subscription = insertRes.rows[0];
    }

    res.status(200).json({
      success: true,
      pending: {
        flat_id: flat.id,
        flat_type: flat.flat_type,
        flat_number: flat.flat_number,
        plan_id: plan.id,
        plan_name: plan.plan_name,
        amount: plan.amount,
        status: subscription.payment_status || "pending"
      }
    });

  } catch (error) {
    console.error("❌ Pending payment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// controllers/reportsController.js
exports.getReports = async (req, res, next) => {
  try {
    // Fetch all payments and flats
    const paymentsResult = await pool.query("SELECT * FROM payments");
    const flatsResult = await pool.query(`
      SELECT f.*, u.name AS user_name, u.email AS user_email
      FROM flats f
      LEFT JOIN users u ON u.id = f.user_id
    `);

    const payments = paymentsResult.rows;
    const flats = flatsResult.rows;

    const today = new Date();

    let totalCollection = 0;
    let pendingAmount = 0;
    let expectedRevenue = 0;
    let overduePayments = [];
    let defaultersSet = new Set();

    const paidFlatsSet = new Set();

    // Loop through payments and calculate correctly
    payments.forEach(p => {
      // Ensure amount is a number
      const amt = parseFloat(p.amount) || 0;
      expectedRevenue += amt;

      // Status may be string or boolean
      const status = (p.status || "").toLowerCase();
      const isPaid = status === "paid" || status === "success" || p.is_paid === true;

      if (isPaid) {
        totalCollection += amt;
        if (p.flat_id) paidFlatsSet.add(p.flat_id);
      } else {
        pendingAmount += amt;

        const paymentDate = new Date(p.payment_date);
        if (paymentDate < today) {
          overduePayments.push(p);
          if (p.flat_id) defaultersSet.add(p.flat_id);
        }
      }
    });

    const collectionEfficiency =
      expectedRevenue > 0 ? Math.round((totalCollection / expectedRevenue) * 100) : 0;

    // Flats metrics
    const totalFlats = flats.length;
    const occupiedFlats = flats.filter(
      (f) => Boolean(f.user_name?.trim()) && Boolean(f.user_email?.trim())
    ).length;
    const vacantFlats = totalFlats - occupiedFlats;

    res.status(200).json({
      success: true,
      stats: {
        totalCollection,
        expectedRevenue,
        collectionEfficiency,
        pendingAmount,
        overduePayments: overduePayments.length,
        defaulters: defaultersSet.size,
        occupiedFlats,
        vacantFlats,
      },
    });
  } catch (error) {
    console.error("Error generating reports:", error);
    res.status(500).json({ success: false, message: "Failed to generate reports" });
  }
};
