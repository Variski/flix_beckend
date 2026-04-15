const express = require('express');
const router = express.Router();

router.use('/auth',          require('./auth.routes'));
router.use('/films',         require('./film.routes'));
router.use('/ratings',       require('./rating.routes'));
router.use('/reviews',       require('./review.routes'));
router.use('/discussions',   require('./discussion.routes'));
router.use('/replies',       require('./reply.routes'));
router.use('/likes',         require('./like.routes'));
router.use('/watchlists',    require('./watchlist.routes'));
router.use('/notifications', require('./notification.routes'));
router.use('/reports',       require('./report.routes'));
router.use('/follow',        require('./follow.routes'));
router.use('/users',         require('./user.routes'));

module.exports = router;
