const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/User/user");
const sendMail = require("../utils/sendMail");
const { options } = require("../router");
const Sns = require("../models/Requests/sns");
const Ckmbg = require("../models/Requests/ckmbg");
const Activity = require("../models/User/activities");
const ejs = require("ejs");
const path = require("path");
const { default: mongoose } = require("mongoose");

// settings
const updateProfile = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    if (req.body.email || req.body.password)
      return ErrorHandler(
        "Email and password cannot be updated here",
        400,
        req,
        res
      );
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...req.body,
        },
      },
      { new: true }
    );

    return SuccessHandler(
      {
        user,
        message: "Profile updated successfully",
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

// users
const createUser = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const { firstName, lastName, company, phone, email, role } = req.body;

    const user = await User.create({
      firstName,
      lastName,
      company,
      phone: {
        number: phone,
        type: "cell",
      },
      email,
      password: "newRocketuser12345678",
      role,
      permissions: req.body.permissions || [],
    });

    const token = await user.getJWTToken();

    SuccessHandler(
      {
        user,
        // createPasswordLink: `${req.headers["origin"]}/create-password/user/${token}`, // remove from production
        message: "User created successfully",
      },
      201,
      res
    );

    // send email to user with create password link

    const link = `${req.headers["origin"]}/create-password/${token}`;
    const template = await ejs.renderFile(
      `${__dirname}/../ejs/createPassword.ejs`,
      {
        link: link,
      }
    );
    // const template = await ejs.renderFile(
    //   path.join(__dirname, "../ejs/createPassword.ejs"),
    //   { link },
    //   (err, data) => {
    //     if (err) {
    //       console.error(err);
    //       return;
    //     }
    //   }
    // );
    await sendMail(
      email,
      "Create password",
      // `Click the link to create password: ${req.headers["origin"]}/create-password/${token}`
      template
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getUsers = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const searchFilter =
      req.query.search && req.query.search.length > 0
        ? {
            $or: [
              {
                firstName: {
                  $regex: req.query.search,
                  $options: "i",
                },
              },
              { lastName: { $regex: req.query.search, $options: "i" } },
              { email: { $regex: req.query.search, $options: "i" } },
            ],
          }
        : {};

    const roleFilter =
      req.query.role && req.query.role.length > 0
        ? { role: req.query.role }
        : {};

    const companyFilter = req.user.role === "moderator" ? { company: req.user.company } : {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const users = await User.find({
      ...searchFilter,
      ...roleFilter,
      ...companyFilter,
    })
      .select("-password")
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments({
      ...searchFilter,
      ...roleFilter,
    });

    return SuccessHandler(
      {
        users,
        totalUsers,
        page,
        limit,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const getUser = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const user = await User.findById(req.params.id).select("-password");
    return SuccessHandler(user, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const updateUser = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    if (req.body.email || req.body.password)
      return ErrorHandler(
        "Email and password cannot be updated here",
        400,
        req,
        res
      );

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...req.body,
        },
      },
      { new: true }
    );

    return SuccessHandler(
      {
        user,
        message: "User updated successfully",
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const deleteUser = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    await User.findByIdAndDelete(req.params.id);
    return SuccessHandler("User deleted successfully", 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const activateDeactivateUser = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          isActive: req.body.isActive,
        },
      },
      { new: true }
    );
    return SuccessHandler(
      {
        user,
        message: "User updated successfully",
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const dashboardStats = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    if(req.user.role === "user") return ErrorHandler("Unauthorized", 401, req, res);
    let userFilter = {};
    let requestFilter = {};
    if(req.user.role === "moderator") {
      userFilter = { company: req.user.company };
      const users = await User.find({ company: req.user.company, isActive: true });
      requestFilter = { user: { $in: users.map(user => user._id) } };
    }
    const totalUsers = await User.countDocuments({
      isActive: true,
      role: "user",
      ...userFilter,
    });

    const totalModerators = await User.countDocuments({
      isActive: true,
      role: "moderator",
    });

    const totalSnsRequests = await Sns.countDocuments({
      isActive: true,
      ...requestFilter,
    });

    const totalCkmbgRequests = await Ckmbg.countDocuments({
      isActive: true,
      ...requestFilter,
    });

    return SuccessHandler(
      {
        totalUsers,
        totalModerators,
        totalSnsRequests,
        totalCkmbgRequests,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const dashboardCharts = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const yearFilter = req.query.year
      ? {
          createdAt: {
            $gte: new Date(`${req.query.year}-01-01`),
            $lt: new Date(`${req.query.year}-12-31`),
          },
        }
      : {
          createdAt: {
            $gte: new Date(`${new Date().getFullYear()}-01-01`),
            $lt: new Date(`${new Date().getFullYear()}-12-31`),
          },
        };
    
    let requestFilter = {};
    if(req.user.role === "moderator") {
      const users = await User.find({ company: req.user.company, isActive: true });
      requestFilter = { user: { $in: users.map(user => mongoose.Types.ObjectId(user._id)) } };
    }

    const months = [
      { month: "January", total: 0 },
      { month: "February", total: 0 },
      { month: "March", total: 0 },
      { month: "April", total: 0 },
      { month: "May", total: 0 },
      { month: "June", total: 0 },
      { month: "July", total: 0 },
      { month: "August", total: 0 },
      { month: "September", total: 0 },
      { month: "October", total: 0 },
      { month: "November", total: 0 },
      { month: "December", total: 0 },
    ];

    const snsRequests = await Sns.aggregate([
      {
        $match: {
          ...yearFilter,
          ...requestFilter,
          isActive: true,
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
    ]);

    console.log(snsRequests);

    const ckmbgRequests = await Ckmbg.aggregate([
      {
        $match: {
          ...yearFilter,
          ...requestFilter,
          isActive: true,
        },
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: 1 },
        },
      },
    ]);

    console.log(ckmbgRequests);

    snsRequests.forEach((request) => {
      months[request._id - 1].total = request.total;
    });

    ckmbgRequests.forEach((request) => {
      // sum up the previous total
      months[request._id - 1].total += request.total;
    });

    const availableYearsSns = await Sns.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
    ]);

    const availableYearsCkmbg = await Ckmbg.aggregate([
      {
        $group: {
          _id: { $year: "$createdAt" },
        },
      },
    ]);

    const availableYears = [
      ...new Set([
        ...availableYearsSns.map((year) => year._id),
        ...availableYearsCkmbg.map((year) => year._id),
      ]),
    ];

    return SuccessHandler(
      {
        months,
        availableYears,
      },
      200,
      res
    );
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

const dashboardActivities = async (req, res) => {
  // #swagger.tags = ['admin']
  try {
    const latestActivities = await Activity.find()
      .populate("user")
      .sort({ createdAt: -1 })
      .limit(10);

    return SuccessHandler(latestActivities, 200, res);
  } catch (error) {
    return ErrorHandler(error.message, 500, req, res);
  }
};

module.exports = {
  updateProfile,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateDeactivateUser,
  dashboardStats,
  dashboardCharts,
  dashboardActivities,
};
