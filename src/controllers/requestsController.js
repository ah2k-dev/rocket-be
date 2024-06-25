const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Sns = require("../models/Requests/sns");
const Ckmbg = require("../models/Requests/ckmbg");
const { path } = require("../app");

const createSnsRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const { type, formDetails } = req.body;
    if (!type || !formDetails) {
      return ErrorHandler(
        "Please provide type and form details",
        400,
        req,
        res
      );
    }
    const sns = new Sns({
      user: req.user._id,
      type,
      formDetails,
    });
    await sns.save();

    return SuccessHandler("Request created successfully", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const createCkmbgRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const { type, formDetails } = req.body;
    if (!type || !formDetails) {
      return ErrorHandler(
        "Please provide type and form details",
        400,
        req,
        res
      );
    }
    const ckmBg = new Ckmbg({
      user: req.user._id,
      type,
      formDetails,
    });
    await ckmBg.save();

    return SuccessHandler("Request created successfully", 201, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCompletedRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const searchFilter = req.query.search
      ? {
          $or: [
            { "user.firstName": { $regex: req.query.search, $options: "i" } },
            { "user.lastName": { $regex: req.query.search, $options: "i" } },
            { "user.email": { $regex: req.query.search, $options: "i" } },
            { "user.phone": { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const typeFilter = req.query.subType ? { type: req.query.subType } : {};

    const type = req.query.type && JSON.parse(req.query.type);

    const roleFilter =
      req.user.role === "admin" || req.user.role === "moderator"
        ? {}
        : { user: req.user._id };

    let requests = [];

    if (type.includes("sns")) {
      const snsReqs = await Sns.aggregate([
        {
          $match: {
            ...typeFilter,
            ...roleFilter,
            isActive: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            ...searchFilter,
          },
        },
      ]);

      requests = requests.concat(snsReqs);
    }

    if (type.includes("ckmbg")) {
      const ckmbgReqs = await Ckmbg.aggregate([
        {
          $match: {
            ...typeFilter,
            ...roleFilter,
            isActive: false,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        { $unwind: "$user" },
        {
          $match: {
            ...searchFilter,
          },
        },
      ]);

      requests = requests.concat(ckmbgReqs);
    }

    return SuccessHandler(requests, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getSnsRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const searchFilter = req.query.search
      ? {
          $or: [
            { "user.firstName": { $regex: req.query.search, $options: "i" } },
            { "user.lastName": { $regex: req.query.search, $options: "i" } },
            { "user.email": { $regex: req.query.search, $options: "i" } },
            { "user.phone": { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const typeFilter = req.query.type ? { type: req.query.type } : {};

    const roleFilter =
      req.user.role === "admin" || req.user.role === "moderator"
        ? {}
        : { user: req.user._id };

    const requests = await Sns.aggregate([
      {
        $match: {
          ...typeFilter,
          ...roleFilter,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          ...searchFilter,
        },
      },
    ]);

    return SuccessHandler(requests, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCkmbgRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const searchFilter = req.query.search
      ? {
          $or: [
            { "user.firstName": { $regex: req.query.search, $options: "i" } },
            { "user.lastName": { $regex: req.query.search, $options: "i" } },
            { "user.email": { $regex: req.query.search, $options: "i" } },
            { "user.phone": { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};

    const typeFilter = req.query.type ? { type: req.query.type } : {};

    const roleFilter =
      req.user.role === "admin" || req.user.role === "moderator"
        ? {}
        : { user: req.user._id };

    console.log(roleFilter, searchFilter, typeFilter);

    const requests = await Ckmbg.aggregate([
      {
        $match: {
          ...typeFilter,
          ...roleFilter,
          isActive: true,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $match: {
          ...searchFilter,
        },
      },
    ]);

    return SuccessHandler(requests, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateStatus = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const { status, type } = req.body;
    if (!status) {
      return ErrorHandler("Please provide status", 400, req, res);
    }
    if (status == "completed" && !req.files?.report) {
      return ErrorHandler("Please provide report", 400, req, res);
    }

    let reportLink = null;
    if (req.files?.report) {
      const reportFile = req.files.report;
      const path = `${reportFile.name}-${Date.now()}`;
      await reportFile.mv(
        path.join(__dirname, "../../uploads", path),
        (err) => {
          if (err) {
            return ErrorHandler("Error uploading file", 500, req, res);
          }
        }
      );
      reportLink = `/uploads/${path}`;
    }

    let request;
    if (type === "sns") {
      request = await Sns.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status,
            report: status === "completed" ? reportLink : null,
          },
        },
        { new: true }
      );
    } else {
      request = await Ckmbg.findByIdAndUpdate(
        req.params.id,
        {
          $set: {
            status,
            report: status === "completed" ? reportLink : null,
          },
        },
        { new: true }
      );
    }

    return SuccessHandler(request, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getSingleRequest = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const snsRequest = await Sns.findById(req.params.id);
    if (snsRequest) {
      return SuccessHandler(snsRequest, 200, res);
    }

    const ckmbgRequest = await Ckmbg.findById(req.params.id);
    if (ckmbgRequest) {
      return SuccessHandler(ckmbgRequest, 200, res);
    }

    return ErrorHandler("Request not found", 404, req, res);
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
  getSingleRequest,
};
