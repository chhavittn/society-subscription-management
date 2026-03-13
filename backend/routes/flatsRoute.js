const express = require("express");

const router = express.Router();
const { addFlat, getAllFlats, getSingleFlat, updateFlat, deleteFlat, getUserFlats
} = require("../controllers/flatsController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");

router.route("/my-flats").get(
    isAuthenticatedUser,
    getUserFlats
);

router.route("/admin/flat").post(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    addFlat
);
router.route("/flats").get(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getAllFlats
);

router.route("/flat/:id").get(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    getSingleFlat
);

router.route("/admin/flat/:id").put(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    updateFlat
);

router.route( "/admin/flat/:id").delete(
  isAuthenticatedUser,
  authorizeRoles("admin"),
  deleteFlat
);

module.exports = router;