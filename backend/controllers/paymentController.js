const { pool } = require("../db");

// exports.makePayment = async (req, res) => {
//     try {

//         const userId = req.user.id
//         const { payment_mode, plan_id } = req.body

//         // get user's flat
//         const flat = await pool.query(
//             "SELECT * FROM flats WHERE user_id=$1",
//             [userId]
//         )

//         if (!flat.rows[0]) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Flat not assigned"
//             })
//         }

//         const flatData = flat.rows[0]

//         let planId = flatData.plan_id || plan_id

//         if (!planId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "No subscription plan selected"
//             })
//         }
//         if (!flatData.plan_id && plan_id) {
//             await pool.query(
//                 `UPDATE flats SET plan_id=$1 WHERE id=$2`,
//                 [plan_id, flatData.id]
//             )
//         }


//         const plan = await pool.query(
//             "SELECT * FROM subscription_plans WHERE id=$1",
//             [planId]
//         )

//         const planData = plan.rows[0]

//         const month = new Date().getMonth() + 1
//         const year = new Date().getFullYear()

//         // prevent duplicate payment
//         const existing = await pool.query(
//             `SELECT * FROM monthly_subscriptions
//        WHERE flat_id=$1 AND month=$2 AND year=$3`,
//             [flatData.id, month, year]
//         )

//         if (existing.rows.length > 0) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Payment already done for this month"
//             })
//         }

//         // create subscription
//         const subscription = await pool.query(
//             `INSERT INTO monthly_subscriptions
//       (flat_id,plan_id,month,year,amount,status)
//       VALUES ($1,$2,$3,$4,$5,'paid')
//       RETURNING *`,
//             [flatData.id, planData.id, month, year, planData.amount]
//         )

//         const transactionId = "TXN" + Date.now()

//         const payment = await pool.query(
//             `INSERT INTO payments
//        (subscription_id,amount,payment_mode,transaction_id,status)
//        VALUES ($1,$2,$3,$4,'success')
//        RETURNING *`,
//             [
//                 subscription.rows[0].id,
//                 planData.amount,
//                 payment_mode,
//                 transactionId
//             ]
//         )

//         res.status(200).json({
//             success: true,
//             payment: payment.rows[0],
//             subscription: subscription.rows[0]
//         })

//     } catch (error) {

//         res.status(500).json({
//             success: false,
//             message: error.message
//         })

//     }
// }

exports.makePayment = async (req, res) => {
    try {
  
      let { flat_id, plan_id, month, year, payment_mode } = req.body
  
      // 🔍 STEP 1: Find flat_id if not provided (manual entry case)
      if (!flat_id) {
        const { flatNumber, block, floor, flatType } = req.body
  
        console.log("🔍 Finding flat using:", { flatNumber, block, floor, flatType })
  
        if (!flatNumber || !block || !floor || !flatType) {
          return res.status(400).json({
            success: false,
            message: "Flat details are required (flatNumber, block, floor, flatType)"
          })
        }
  
        const flatResult = await pool.query(
          `SELECT * FROM flats 
           WHERE flat_number=$1 AND block=$2 AND floor=$3 AND flat_type=$4`,
          [flatNumber, block, floor, flatType]
        )
  
        if (!flatResult.rows[0]) {
          return res.status(404).json({
            success: false,
            message: "Flat not found with given details"
          })
        }
  
        flat_id = flatResult.rows[0].id
  
        console.log("✅ Found flat_id:", flat_id)
      }
  
      // 🔍 STEP 2: Validate remaining fields
      if (!plan_id || !month || !year || !payment_mode) {
        return res.status(400).json({
          success: false,
          message: "Plan, month, year and payment mode are required"
        })
      }
  
      // 🔍 STEP 3: Check flat exists (extra safety)
      const flat = await pool.query(
        "SELECT * FROM flats WHERE id=$1",
        [flat_id]
      )
  
      if (!flat.rows[0]) {
        return res.status(404).json({
          success: false,
          message: "Flat not found"
        })
      }
  
      const flatData = flat.rows[0]
  
      // 🔍 STEP 4: Get plan
      const plan = await pool.query(
        "SELECT * FROM subscription_plans WHERE id=$1",
        [plan_id]
      )
  
      if (!plan.rows[0]) {
        return res.status(404).json({
          success: false,
          message: "Subscription plan not found"
        })
      }
  
      const planData = plan.rows[0]
  
      // 🚫 STEP 5: Prevent duplicate payment
      const existing = await pool.query(
        `SELECT * FROM monthly_subscriptions
         WHERE flat_id=$1 AND month=$2 AND year=$3`,
        [flat_id, month, year]
      )
  
      if (existing.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Payment already exists for this flat in this month"
        })
      }
  
      // ✅ STEP 6: Create subscription
      const subscription = await pool.query(
        `INSERT INTO monthly_subscriptions
         (flat_id, plan_id, month, year, amount, status)
         VALUES ($1, $2, $3, $4, $5, 'paid')
         RETURNING *`,
        [flat_id, plan_id, month, year, planData.amount]
      )
  
      // 🔐 STEP 7: Create payment
      const transactionId = "TXN" + Date.now()
  
      const payment = await pool.query(
        `INSERT INTO payments
         (subscription_id, amount, payment_mode, transaction_id, status)
         VALUES ($1, $2, $3, $4, 'success')
         RETURNING *`,
        [
          subscription.rows[0].id,
          planData.amount,
          payment_mode,
          transactionId
        ]
      )
  
      // ✅ FINAL RESPONSE
      res.status(200).json({
        success: true,
        message: "Payment successful",
        payment: payment.rows[0],
        subscription: subscription.rows[0]
      })
  
    } catch (error) {
      console.log("❌ Payment error:", error)
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
  }


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