const https = require('https');
const crypto = require('crypto');

// @desc    Create Razorpay Order
// @route   POST /api/payments/order
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(amount)) {
      return res.status(400).json({ success: false, message: 'Invalid amount' });
    }

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    // Simulation / Mock mode if credentials are not configured in environment
    if (!keyId || !keySecret || keyId === 'YOUR_RAZORPAY_KEY_ID') {
      const mockOrderId = `order_${crypto.randomBytes(8).toString('hex')}`;
      return res.json({
        success: true,
        data: {
          id: mockOrderId,
          amount: amount * 100,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
          mock: true,
        },
      });
    }

    // Call Razorpay API using native https module
    const data = JSON.stringify({
      amount: Math.round(amount * 100), // paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    });

    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const options = {
      hostname: 'api.razorpay.com',
      path: '/v1/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
        'Authorization': `Basic ${auth}`,
      },
    };

    const request = https.request(options, (response) => {
      let body = '';
      response.on('data', (chunk) => (body += chunk));
      response.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (response.statusCode >= 200 && response.statusCode < 300) {
            res.json({ success: true, data: parsed });
          } else {
            res.status(response.statusCode).json({ success: false, message: parsed.error?.description || 'Razorpay order creation failed' });
          }
        } catch (err) {
          res.status(500).json({ success: false, message: 'Failed to parse Razorpay response' });
        }
      });
    });

    request.on('error', (err) => {
      res.status(500).json({ success: false, message: err.message || 'Razorpay service error' });
    });

    request.write(data);
    request.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
};
