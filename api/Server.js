const axios = require("axios");
const crypto = require("crypto");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ message: "Method Not Allowed" }),
    };
  }

  const { amount, orderInfo, redirectUrl } = JSON.parse(event.body);
  const ipnUrl = 'https://webhook.site/5254fac2-369f-4f25-b13b-0ad3a1f1e5e0';

  if (!amount || !orderInfo || !redirectUrl || !ipnUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        statusCode: 400,
        messageError: "Invalid input",
        errorDetails: {
          amount: !amount ? "Amount is required" : undefined,
          orderInfo: !orderInfo ? "Order information is required" : undefined,
          redirectUrl: !redirectUrl ? "Redirect URL is required" : undefined,
          ipnUrl: !ipnUrl ? "IPN URL is required" : undefined,
        }
      })
    };
  }

  const accessKey = 'F8BBA842ECF85';
  const secretKey = 'K951B6PE1waDMi640xX08PD3vg6EkVlz';
  const partnerCode = 'MOMO';
  const requestType = "payWithMethod";
  const orderId = partnerCode + new Date().getTime();
  const requestId = orderId;
  const extraData = '';
  const orderGroupId = '';
  const autoCapture = true;
  const lang = 'vi';
  const expireTime = new Date(new Date().getTime() + 15 * 60 * 1000).toISOString();

  const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac('sha256', secretKey)
    .update(rawSignature)
    .digest('hex');

  const requestBody = JSON.stringify({
    partnerCode: partnerCode,
    partnerName: "Test",
    storeId: "MomoTestStore",
    requestId: requestId,
    amount: amount,
    orderId: orderId,
    orderInfo: orderInfo,
    redirectUrl: redirectUrl,
    ipnUrl: ipnUrl,
    lang: lang,
    requestType: requestType,
    autoCapture: autoCapture,
    extraData: extraData,
    orderGroupId: orderGroupId,
    signature: signature,
    expireTime: expireTime,
  });

  const options = {
    method: "POST",
    url: "https://test-payment.momo.vn/v2/gateway/api/create",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(requestBody)
    },
    data: requestBody
  };

  try {
    const result = await axios(options);
    return {
      statusCode: 200,
      body: JSON.stringify(result.data)
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        statusCode: 500,
        messageError: "Lỗi server",
        errorDetails: err.response ? err.response.data : err.message
      })
    };
  }
};
