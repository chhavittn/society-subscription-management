const express = require("express");
const { registerUser, loginUser, getUserDetails,
    logout, updatePassword, updateProfile, registerDevice, sendNotification, getMyNotifications, markRead,
    deleteNotification
} = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").get(logout);


router.route("/register-device").post(isAuthenticatedUser, registerDevice);

router.post(
    "/admin/send-notification",
    isAuthenticatedUser,
    authorizeRoles("admin"),
    sendNotification
);

router.get(
    "/my-notifications",
    isAuthenticatedUser,
    getMyNotifications
);
router.put(
    "/notification/:id/read",
    isAuthenticatedUser,
    markRead
);

router.delete(
  "/notification/:id",
  isAuthenticatedUser,
  deleteNotification
);
router.route("/me").get(isAuthenticatedUser, getUserDetails);

router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update").put(isAuthenticatedUser, updateProfile);

module.exports = router;