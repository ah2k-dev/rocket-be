const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");

const createSnsRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createCkmbgRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCompletedRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getSnsRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCkmbgRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateStatus = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  createSnsRequest,
  createCkmbgRequest,
  getCompletedRequests,
  getSnsRequests,
  getCkmbgRequests,
  updateStatus,
};
