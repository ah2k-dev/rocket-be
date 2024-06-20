const express = require("express");
const router = express.Router();
const requests = require("../controllers/requestsController");
const { isUser, isAdmin } = require("../middleware/auth");

router.route("/createSnsRequest").post(isUser, requests.createSnsRequest);
router.route("/createCkmbgRequest").get(isUser, requests.createCkmbgRequest);

router
  .route("/getCompletedRequests")
  .get(isAdmin, requests.getCompletedRequests);
router.route("/getSnsRequests").get(isAdmin, requests.getSnsRequests);
router.route("/getCkmbgRequests").get(isAdmin, requests.getCkmbgRequests);

router.route("/status/:id").put(isAdmin, requests.updateStatus);

module.exports = router;
