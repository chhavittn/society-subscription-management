const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { getAllSubscriptions, getSubscriptionById, addSubscription, updateSubscription, deleteSubscription,
    getUserSubscriptions 
} = require("../controllers/monthly_subscriptionsController");


router.route("/admin/subscriptions").get(
    isAuthenticatedUser, authorizeRoles("admin"), getAllSubscriptions
);

router.route("/admin/subscription/:id").get(isAuthenticatedUser, authorizeRoles("admin"), getSubscriptionById);

router.route("/admin/subscription/").post(isAuthenticatedUser, authorizeRoles("admin"), addSubscription);

router.route("/admin/subscription/:id").put( isAuthenticatedUser, authorizeRoles("admin"), updateSubscription);
router.route("/admin/subscription/:id").delete(isAuthenticatedUser, authorizeRoles("admin"), deleteSubscription);

router.route("/my-subscriptions").get (isAuthenticatedUser, getUserSubscriptions);
router.route("/my-subscription/:id").get(
    isAuthenticatedUser, getSubscriptionById
);

module.exports = router;