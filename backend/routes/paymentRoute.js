const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { makePayment, getUserPayments, getAllPayments, getReports, mypendingpayment, markSubscriptionPaid  } = require("../controllers/paymentController");

router.post(
  "/pay",
  isAuthenticatedUser,
  makePayment
);


router.get(
  "/admin/payments",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllPayments
);

router.post(
  "/admin/mark-paid",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  markSubscriptionPaid
);



router.get(
  "/my-payments",
  isAuthenticatedUser,
  getUserPayments
);
router.get(
  "/my-pending-payment",
  isAuthenticatedUser,
  mypendingpayment
);

router.get("/admin/reports", isAuthenticatedUser, authorizeRoles("admin"), getReports);


module.exports = router;
