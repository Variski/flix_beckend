const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { username, email, password, displayName } = req.body;
    const result = await authService.register({ username, email, password, displayName });
    res.status(201).json({ status: 'success', data: result, message: 'ok' });
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    res.json({ status: 'success', data: result, message: 'ok' });
  } catch (err) { next(err); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    res.json({ status: 'success', data: user, message: 'ok' });
  } catch (err) { next(err); }
};

module.exports = { register, login, getMe };
