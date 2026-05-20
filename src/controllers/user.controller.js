const userService = require("../services/user.service");

const listUsers = async (req, res, next) => {
  try {
    const result = await userService.listUsers(req.query);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

const getUserProfile = async (req, res, next) => {
  try {
    const user = await userService.getUserProfile(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const user = await userService.updateProfile(req.user.id, req.body);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const banUser = async (req, res, next) => {
  try {
    const user = await userService.banUser(req.params.id, req.body.isBanned);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const setRole = async (req, res, next) => {
  try {
    const user = await userService.setRole(req.params.id, req.body.role);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id);
    res.json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  listUsers,
  getUserProfile,
  updateProfile,
  banUser,
  setRole,
  deleteUser,
};
