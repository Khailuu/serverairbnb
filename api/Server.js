const axios = require("axios");
const express = require("express");
const cors = require('cors');
const crypto = require('crypto');

const app = express();

const corsOptions = {
    origin: 'https://airbnb-capstone.vercel.app',
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use(express.json());

app.post("/payment", async (req, res) => {
    const { amount, orderInfo, redirectUrl, ipnUrl } = req.body;

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

    // Thiết lập thời gian hết hạn (giả định là 15 phút từ thời điểm tạo giao dịch)
    const expireTime = new Date(new Date().getTime() + 15 * 60000).toISOString(); // 15 phút

    const rawSignature = `accessKey=${accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}&expireTime=${expireTime}`;
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
        expireTime: expireTime // Thêm thời gian hết hạn vào yêu cầu
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
        console.log(result);
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
