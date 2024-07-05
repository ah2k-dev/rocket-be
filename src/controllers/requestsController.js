const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const Sns = require("../models/Requests/sns");
const Ckmbg = require("../models/Requests/ckmbg");
const Activity = require("../models/User/activities");
const path = require("path");

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

    SuccessHandler("Request created successfully", 201, res);

    await Activity.create({
      user: req.user._id,
      activity: `Created a new request for ${type}`,
    });
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

    SuccessHandler("Request created successfully", 201, res);
    await Activity.create({
      user: req.user._id,
      activity: `Created a new request for ${type}`,
    });
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getCompletedRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const searchFilter =
      req.query.search && req.query.search !== ""
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

    // const page = parseInt(req.query.page) || 1;
    // const limit = parseInt(req.query.limit) || 10;
    // const skip = (page - 1) * limit;

    console.log(roleFilter, searchFilter, typeFilter);

    let requests = [];

    if (type.includes("sns")) {
      const snsReqs = await Sns.aggregate([
        {
          $match: {
            ...typeFilter,
            ...roleFilter,
            isActive: true,
            status: "completed",
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
        // {
        //   $facet: {
        //     data: [{ $skip: skip }, { $limit: limit }],
        //     total: [{ $count: "total" }],
        //   },
        // },
      ]);

      requests = requests.concat(snsReqs);
    }

    if (type.includes("ckmbg")) {
      const ckmbgReqs = await Ckmbg.aggregate([
        {
          $match: {
            ...typeFilter,
            ...roleFilter,
            isActive: true,
            status: "completed",
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "total" }],
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

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
      {
        $facet: {
          data: [{ $skip: skip }, { $limit: limit }],
          total: [{ $count: "total" }],
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
      const pathD = `${reportFile.name}-${Date.now()}`;
      await reportFile.mv(
        path.join(__dirname, "../../uploads", pathD),
        (err) => {
          if (err) {
            console.error(err);
            return ErrorHandler("Error uploading file", 500, req, res);
          }
        }
      );
      reportLink = `/uploads/${pathD}`;
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

    SuccessHandler(request, 200, res);

    await Activity.create({
      user: req.user._id,
      activity: `${req.user.firstName} updated request status to ${status}`,
    });
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

const getAllRequests = async (req, res) => {
  // #swagger.tags = ['requests']
  try {
    const statusFilter = req.query.status ? { status: req.query.status } : {};

    const snsRequests = await Sns.find({
      ...statusFilter,
      isActive: true,
    });
    const ckmbgRequests = await Ckmbg.find({
      ...statusFilter,
      isActive: true,
    });

    return SuccessHandler({ snsRequests, ckmbgRequests }, 200, res);
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
  getAllRequests,
};
