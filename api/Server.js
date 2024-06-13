const axios = require("axios");
const express = require("express");
const cors = require('cors');
const crypto = require('crypto');

const app = express();

// Cấu hình CORS
const corsOptions = {
    origin: 'https://airbnb-capstone.vercel.app',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/payment", async (req, res) => {
    const { amount, orderInfo, redirectUrl } = req.body;

    // URL webhook mới từ Webhook.site
    const ipnUrl = 'https://webhook.site/5254fac2-369f-4f25-b13b-0ad3a1f1e5e0';

    // Kiểm tra đầu vào
    if (!amount || !orderInfo || !redirectUrl || !ipnUrl) {
        return res.status(400).json({
            statusCode: 400,
            messageError: "Invalid input",
            errorDetails: {
                amount: !amount ? "Amount is required" : undefined,
                orderInfo: !orderInfo ? "Order information is required" : undefined,
                redirectUrl: !redirectUrl ? "Redirect URL is required" : undefined,
                ipnUrl: !ipnUrl ? "IPN URL is required" : undefined
            }
        });
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

    console.log(expireTime)

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

    console.log('Request Body:', requestBody);

    try {
        const result = await axios(options);
        console.log('Response:', result.data);
        return res.status(200).json(result.data);
    } catch (err) {
        console.error('Error details:', err.response ? err.response.data : err.message);
        return res.status(500).json({
            statusCode: 500,
            messageError: "Lỗi server",
            errorDetails: err.response ? err.response.data : err.message
        });
    }
});

app.listen(3003, () => {
    console.log("Server run at port 3003");
});
