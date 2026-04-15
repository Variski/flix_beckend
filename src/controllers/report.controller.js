const reportService = require('../services/report.service');

const createReport = async (req, res, next) => {
  try {
    const report = await reportService.createReport(req.user.id, req.body);
    res.status(201).json({ success: true, data: report });
  } catch (err) { next(err); }
};

const getReports = async (req, res, next) => {
  try {
    const result = await reportService.getReports(req.query);
    res.json({ success: true, data: result });
  } catch (err) { next(err); }
};

const resolveReport = async (req, res, next) => {
  try {
    const report = await reportService.resolveReport(req.params.id, req.user.id, req.body.status);
    res.json({ success: true, data: report });
  } catch (err) { next(err); }
};

module.exports = { createReport, getReports, resolveReport };
