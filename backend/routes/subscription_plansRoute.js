const express = require("express");

const router = express.Router();
const { addPlan, getPlanByFlatType, updatePlan, deletePlan,
} = require("../controllers/subscription_plansController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");



router.route("/admin/plans").post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    addPlan
);

router.route("/admin/plan/:flat_type").get(
    isAuthenticatedUser,
    getPlanByFlatType
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