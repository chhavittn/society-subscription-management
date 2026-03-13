const express = require("express");

const router = express.Router();
const { addPlan, getPlans, getPlanById, updatePlan, deletePlan,
} = require("../controllers/subscription_plansController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/plans").get(
    isAuthenticatedUser,
    getPlans
);

router.route("/admin/plans").post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    addPlan
);

router.route("/admin/plan/:id").get(
    isAuthenticatedUser,
    getPlanById
);
router.route("/admin/plan/:id").put(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updatePlan
);

router.route( "/admin/plan/:id").delete(
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deletePlan
);


module.exports = router;