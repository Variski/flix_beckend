const followService = require('../services/follow.service');

const follow = async (req, res, next) => {
  try {
    const result = await followService.follow(req.user.id, req.params.userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const unfollow = async (req, res, next) => {
  try {
    const result = await followService.unfollow(req.user.id, req.params.userId);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const getFollowers = async (req, res, next) => {
  try {
    const followers = await followService.getFollowers(req.params.userId);
    res.json({ success: true, data: followers });
  } catch (err) { next(err); }
};

const getFollowing = async (req, res, next) => {
  try {
    const following = await followService.getFollowing(req.params.userId);
    res.json({ success: true, data: following });
  } catch (err) { next(err); }
};

module.exports = { follow, unfollow, getFollowers, getFollowing };
