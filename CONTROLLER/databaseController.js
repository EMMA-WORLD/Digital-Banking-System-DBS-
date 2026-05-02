exports.getNibssLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      userId,
      operationType,
      status,
      startDate,
      endDate,
    } = req.query;

    const query = {};

    // 🔍 Filters
    if (userId) query.userId = userId;
    if (operationType) query.operationType = operationType;
    if (status) query.status = status;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const logs = await AuditLog.find(query)
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await AuditLog.countDocuments(query);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};