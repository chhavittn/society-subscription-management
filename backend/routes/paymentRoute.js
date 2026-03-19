const express = require("express");
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const { makePayment, getUserPayments, getSinglePayment, getAllPayments, getReports  } = require("../controllers/paymentController");

// User
router.post(
  "/pay",
  isAuthenticatedUser,
  makePayment
);


// Admin
router.get(
  "/admin/payments",
  isAuthenticatedUser,
  authorizeRoles("admin"),
  getAllPayments
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

// routes/adminRoutes.js
router.get("/admin/reports", isAuthenticatedUser, authorizeRoles("admin"), getReports);


module.exports = router;