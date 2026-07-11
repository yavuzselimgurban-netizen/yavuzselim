import crypto from "crypto";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import Stripe from "stripe";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
const PAYMENT_PROVIDER = process.env.PAYMENT_PROVIDER || "stripe";

const paytrConfig = {
  merchantId: process.env.PAYTR_MERCHANT_ID,
  merchantKey: process.env.PAYTR_MERCHANT_KEY,
  merchantSalt: process.env.PAYTR_MERCHANT_SALT,
  userId: process.env.PAYTR_USER_ID,
  successUrl: process.env.PAYTR_SUCCESS_URL,
  failUrl: process.env.PAYTR_FAIL_URL,
  testMode: process.env.PAYTR_TEST_MODE === "true",
};

const paytrGatewayUrl = paytrConfig.testMode
  ? "https://www.paytr.com/odeme/test/guvenli"
  : "https://www.paytr.com/odeme/guvenli";

const appUrl = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

const paytrSessions = new Map();

function isPaytrConfigured() {
  return (
    paytrConfig.merchantId &&
    paytrConfig.merchantKey &&
    paytrConfig.merchantSalt &&
    paytrConfig.userId &&
    paytrConfig.successUrl &&
    paytrConfig.failUrl
  );
}

function createPaytrToken({
  merchantId,
  userIp,
  merchantOid,
  email,
  paymentAmount,
  merchantOkUrl,
  merchantFailUrl,
  merchantSalt,
  merchantKey,
}) {
  const hashString = `${merchantId}${userIp}${merchantOid}${email}${paymentAmount}${merchantOkUrl}${merchantFailUrl}${merchantSalt}`;
  return crypto.createHmac("sha256", merchantKey).update(hashString).digest().toString("base64");
}

app.use(cors({ origin: FRONTEND_ORIGIN }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "dist")));

const paymentPackages = [
  { id: "paket-100", title: "100 TL Bağış Paketi", amount: 10000 },
  { id: "paket-50", title: "50 TL Bağış Paketi", amount: 5000 },
];

app.post("/api/create-payment", async (req, res) => {
  const { packageId } = req.body;
  const selectedPackage = paymentPackages.find((pkg) => pkg.id === packageId);

  if (!selectedPackage) {
    return res.status(400).json({ error: "Geçersiz paket seçimi." });
  }

  if (PAYMENT_PROVIDER === "stripe" && process.env.STRIPE_SECRET_KEY) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-11-15",
    });

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [
          {
            price_data: {
              currency: "try",
              product_data: {
                name: selectedPackage.title,
                description: "Bağış paketi",
              },
              unit_amount: selectedPackage.amount,
            },
            quantity: 1,
          },
        ],
        success_url: process.env.STRIPE_SUCCESS_URL,
        cancel_url: process.env.STRIPE_CANCEL_URL,
      });

      return res.json({ paymentUrl: session.url });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Stripe ödeme oturumu oluşturulamadı." });
    }
  }

  if (PAYMENT_PROVIDER === "paytr" && isPaytrConfigured()) {
    const merchantOid = `order_${Date.now()}_${selectedPackage.id}`;
    const paymentAmount = selectedPackage.amount;
    const userIp =
      (req.headers["x-forwarded-for"]?.toString().split(",")[0] || req.socket.remoteAddress || "127.0.0.1").replace(/::ffff:/, "");
    const email = req.body.email || "info@motoricinbagis.com";
    const payload = {
      merchant_id: paytrConfig.merchantId,
      user_ip: userIp,
      merchant_oid: merchantOid,
      email,
      payment_amount: paymentAmount,
      currency: "TL",
      user_name: req.body.userName || "MotoricinBagis Destekçisi",
      user_address: req.body.userAddress || "Türkiye",
      user_phone: req.body.userPhone || "05555555555",
      product_name: selectedPackage.title,
      timeout_limit: 30,
      test_mode: paytrConfig.testMode ? 1 : 0,
      no_installment: 0,
      max_installment: 0,
      merchant_ok_url: paytrConfig.successUrl,
      merchant_fail_url: paytrConfig.failUrl,
    };

    payload.paytr_token = createPaytrToken({
      merchantId: payload.merchant_id,
      userIp: payload.user_ip,
      merchantOid: payload.merchant_oid,
      email: payload.email,
      paymentAmount: payload.payment_amount,
      merchantOkUrl: payload.merchant_ok_url,
      merchantFailUrl: payload.merchant_fail_url,
      merchantSalt: paytrConfig.merchantSalt,
      merchantKey: paytrConfig.merchantKey,
    });

    paytrSessions.set(merchantOid, { payload, gatewayUrl: paytrGatewayUrl });

    const protocol = req.protocol;
    const host = req.get("host");
    const paymentUrl = `${protocol}://${host}/paytr-checkout?merchantOid=${encodeURIComponent(merchantOid)}`;

    return res.json({ paymentUrl });
  }

  // Henüz gerçek sağlayıcı yapılandırması yoksa demo yönlendirmesi
  return res.json({
    paymentUrl: `${FRONTEND_ORIGIN}/?mockPayment=true&packageId=${selectedPackage.id}`,
  });
});

app.get("/paytr-checkout", (req, res) => {
  const merchantOid = Array.isArray(req.query.merchantOid) ? req.query.merchantOid[0] : req.query.merchantOid;
  if (!merchantOid) {
    return res.status(400).send("merchantOid parametresi eksik.");
  }

  const session = paytrSessions.get(merchantOid);
  if (!session) {
    return res.status(404).send("PayTR ödeme oturumu bulunamadı.");
  }

  const inputs = Object.entries(session.payload)
    .map(
      ([key, value]) =>
        `<input type="hidden" name="${String(key)}" value="${String(value).replace(/"/g, '&quot;')}" />`
    )
    .join("\n");

  res.send(`<!doctype html>
<html lang="tr">
  <head>
    <meta charset="utf-8" />
    <title>PayTR Ödeme yönlendirmesi</title>
  </head>
  <body>
    <p>PayTR ödeme sayfasına yönlendiriliyorsunuz...</p>
    <form id="paytrForm" method="post" action="${session.gatewayUrl}">
      ${inputs}
    </form>
    <script>document.getElementById('paytrForm').submit();</script>
  </body>
</html>`);
});

app.get("/*", (req, res) => {
  return res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Payment backend listening on http://localhost:${PORT}`);
});
