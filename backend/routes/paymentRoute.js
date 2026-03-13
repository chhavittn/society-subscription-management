const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { makePayment, getUserPayments, getSinglePayment, getAllPayments  } = require("../controllers/paymentController");

// User
router.post(
  "/pay/:id",
  isAuthenticatedUser,
  makePayment
);

router.get(
  "/my-payments",
  isAuthenticatedUser,
  getUserPayments
);

router.get(
  "/payment/:id",
  isAuthenticatedUser,
 getSinglePayment
);

// Admin
router.get(
  "/admin/payments",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllPayments
);

module.exports = router;