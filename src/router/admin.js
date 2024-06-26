const express = require("express");
const admin = require("../controllers/adminController");
const { isAuthenticated, isAdmin } = require("../middleware/auth");

const router = express.Router();

//put
router.route("/updateProfile").put(admin.updateProfile);
router.route("/updateUser/:id").put(admin.updateUser);
router.route("/activateDeactivateUser/:id").put(admin.activateDeactivateUser);
//post
router.route("/createUser").post(admin.createUser);
//get
router.route("/getUsers").get(admin.getUsers);
router.route("/getUser/:id").get(admin.getUser);
router.route("/dashboardStats").get(admin.dashboardStats);
router.route("/dashboardCharts").get(admin.dashboardCharts);
//delete
router.route("/deleteUser/:id").delete(admin.deleteUser);

module.exports = router;
