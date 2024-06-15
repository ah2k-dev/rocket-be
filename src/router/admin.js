const express = require("express");
const admin = require("../controllers/adminController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

//put
router.route("/updateProfile").put(admin.updateProfile);
router.route("/updateUser/:id").put(isAuthenticated, isAdmin, admin.updateUser);
router
  .route("/activateDeactivateUser/:id")
  .put(isAuthenticated, isAdmin, admin.activateDeactivateUser);
//post
router.route("/createUser").post(isAuthenticated, isAdmin, admin.createUser);
//get
router.route("/getUsers").get(isAuthenticated, isAdmin, admin.getUsers);
router.route("/getUser/:id").get(isAuthenticated, isAdmin, admin.getUser);
//delete
router
  .route("/deleteUser/:id")
  .delete(isAuthenticated, isAdmin, admin.deleteUser);

module.exports = router;
