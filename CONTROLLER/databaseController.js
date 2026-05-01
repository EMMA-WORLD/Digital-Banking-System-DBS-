const AuditLog = require('../MODEL/AuditLog');
const { HTTP_STATUS } = require('../CONFIG/constants');

exports.getNibssLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find()
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

