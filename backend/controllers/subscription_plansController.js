const { pool } = require("../db");

exports.addPlan = async (req, res, next) => {
  try {
    const { plan_name, amount, effective_from } = req.body;

    const ALLOWED_FLAT_TYPES = ["1BHK", "2BHK", "3BHK", "4BHK"];

    if (!plan_name || !amount || !effective_from) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    if (!ALLOWED_FLAT_TYPES.includes(plan_name)) {
      return res.status(400).json({
        success: false,
        message: "Invalid flat type"
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0"
      });
    }

    const existing = await pool.query(
      `SELECT * FROM subscription_plans 
       WHERE plan_name=$1 AND effective_from=$2`,
      [plan_name, effective_from]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Rate already exists for this date"
      });
    }

    // ✅ Insert new rate (history preserved)
    const result = await pool.query(
      `INSERT INTO subscription_plans 
        (plan_name, amount, duration_months, effective_from)
       VALUES ($1, $2, 1, $3)
       RETURNING *`,
      [plan_name, amount, effective_from]
    );

    res.status(201).json({
      success: true,
      message: "Rate added successfully",
      plan: result.rows[0]
    });

  } catch (error) {
    next(error);
  }
};
exports.getAllPlans = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT ON (plan_name)
          id,
          plan_name,
          plan_name AS flat_type,
          amount,
          duration_months,
          effective_from
       FROM subscription_plans
       ORDER BY plan_name, effective_from DESC, id DESC`
    );

    res.status(200).json({
      success: true,
      plans: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
exports.getPlanByFlatType = async (req, res) => {
  try {
    const { flat_type } = req.params;

    if (!flat_type || typeof flat_type !== "string" || !flat_type.trim()) {
      return res.status(400).json({
        success: false,
        message: "Flat type is required in URL params"
      });
    }

    const result = await pool.query(
      `SELECT * FROM subscription_plans 
       WHERE plan_name=$1 
       ORDER BY effective_from DESC LIMIT 1`,
      [flat_type.trim()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `No plan found for flat type "${flat_type}"`
      });
    }

    res.status(200).json({
      success: true,
      plan: result.rows[0]
    });

  } catch (error) {
    console.error("Error in getPlanByFlatType:", error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updatePlan = async (req, res, next) => {
  try {
    const { amount, effective_from } = req.body;
    const { id } = req.params;

    if (!amount || !effective_from) {
      return res.status(400).json({
        success: false,
        message: "Amount and effective date are required"
      });
    }

    const result = await pool.query(
      `UPDATE subscription_plans
       SET amount=$1, effective_from=$2
       WHERE id=$3
       RETURNING *`,
      [amount, effective_from, id]
    );

    const plan = result.rows[0];

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Rate updated successfully",
      plan
    });

  } catch (error) {
    next(error);
  }
};

exports.deletePlan = async (req, res, next) => {
  const result = await pool.query(
    `DELETE FROM subscription_plans WHERE id=$1 RETURNING *`,
    [req.params.id]
  );

  const plan = result.rows[0];

  if (!plan) {
    return res.status(404).json({
      success: false,
      message: "Plan not found"
    });
  }

  res.status(200).json({
    success: true,
    message: "Plan deleted successfully",
    plan
  });
};