const { pool } = require("../db");

exports.addPlan = async (req, res, next) => {
  const { plan_name, amount, duration_months, effective_from, description, features } = req.body;

  if (!plan_name || !amount || !duration_months || !effective_from) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  const result = await pool.query(
    `INSERT INTO subscription_plans 
      (plan_name, amount, duration_months, effective_from, description, features)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [plan_name, amount, duration_months, effective_from, description || "", features || ""]
  );

  res.status(201).json({ success: true, plan: result.rows[0] });
};

exports.getPlans=(async (req, res, next) => {
  const result = await pool.query(`SELECT * FROM subscription_plans ORDER BY id`);
  res.status(200).json({ success: true, plans: result.rows });
});

exports.getPlanById=(async (req, res, next) => {
  const result = await pool.query(`SELECT * FROM subscription_plans WHERE id=$1`, [req.params.id]);
  const plan = result.rows[0];
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found"
    });
  }
  
  res.status(200).json({ success: true, plan });
});

exports.updatePlan=(async (req, res, next) => {
  const { plan_name, amount, duration_months, effective_from, description, features } = req.body;
  const result = await pool.query(
    `UPDATE subscription_plans
     SET plan_name=$1, amount=$2, duration_months=$3, effective_from=$4, description=$5, features=$6
     WHERE id=$7 RETURNING *`,
    [plan_name, amount, duration_months, effective_from, description || "", features || "", req.params.id]
  );
  const plan = result.rows[0];
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found"
    });
  } 
  res.status(200).json({ success: true, plan });
});

exports.deletePlan=(async (req, res, next) => {
  const result = await pool.query(`DELETE FROM subscription_plans WHERE id=$1 RETURNING *`, [req.params.id]);
  const plan = result.rows[0];
  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found"
    });
  }
  res.status(200).json({ success: true, message: "Plan deleted successfully", plan });
});
// exports.getUserplans = catchAsyncError(async (req, res, next) => {
//   const userId = req.user.id;

//   const result = await pool.query(`
//     SELECT ms.id AS subscription_id,
//            ms.month,
//            ms.year,
//            ms.amount,
//            ms.status,
//            ms.due_date,
//            f.id AS flat_id,
//            f.flat_number,
//            f.block,
//            sp.id AS plan_id,
//            sp.plan_name,
//            sp.duration_months,
//            sp.amount AS plan_amount,
//            sp.effective_from
//     FROM monthly_subscriptions ms
//     LEFT JOIN flats f ON ms.flat_id = f.id
//     LEFT JOIN subscription_plans sp ON ms.plan_id = sp.id
//     WHERE f.user_id=$1
//     ORDER BY ms.year DESC, ms.month DESC
//   `, [userId]);

//   if (result.rows.length === 0) {
//     return res.status(200).json({
//       success: true,
//       message: "No subscription found for your flat(s)",
//       subscriptions: []
//     });
//   }

//   res.status(200).json({
//     success: true,
//     subscriptions: result.rows
//   });
// });