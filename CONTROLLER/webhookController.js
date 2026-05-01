const webhookService = require('../SERVICE/webhookService');
const { HTTP_STATUS } = require('../CONFIG/constants');

exports.handleNibssWebhook = async (req, res, next) => {
  try {
    const webhookResult = await webhookService.handleNibssWebhook(req.body);
    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Webhook processed',
      data: webhookResult,
    });
  } catch (error) {
    next(error);
  }
};
