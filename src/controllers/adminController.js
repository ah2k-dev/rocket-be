const SuccessHandler = require("../utils/SuccessHandler");
const ErrorHandler = require("../utils/ErrorHandler");
const User = require("../models/User/user");
const sendMail = require("../utils/sendMail");

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
    const { firstName, lastName, comapny, phone, email, role } = req.body;

    const user = await User.create({
      firstName,
      lastName,
      comapny,
      phone: {
        number: phone,
        type: "cell",
      },
      email,
      password: "newRocketuser12345678",
      role,
    });

    const token = await user.getJwtToken();

    SuccessHandler(
      {
        user,
        createPasswordLink: `${req.headers["origin"]}/create-password/user/${token}`, // remove from production
        message: "User created successfully",
      },
      201,
      res
    );

    // send email to user with create password link
    // await sendMail(
    //   email,
    //   "Create password",
    //   `Click the link to create password: ${req.headers["origin"]}/create-password/user/${token}`
    // );
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
              { firstName: req.query.search },
              { lastName: req.query.search },
              { email: req.query.search },
            ],
          }
        : {};

    const roleFilter =
      req.query.role && req.query.role.length > 0
        ? { role: req.query.role }
        : {};
    const users = await User.find({
      ...searchFilter,
      ...roleFilter,
    }).select("-password");

    return SuccessHandler(users, 200, res);
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

module.exports = {
  updateProfile,
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  activateDeactivateUser,
};
