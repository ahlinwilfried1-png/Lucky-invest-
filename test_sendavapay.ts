import fetch from "node-fetch";

async function run() {
  const response = await fetch("https://sendavapay.com/api/sdk/v1/create-payment", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer sdk_dt7N8ZAaw0zVc9WwjJWaDtdAJm5OCGNt"
    },
    body: JSON.stringify({
      amount: 2500,
      currency: 'XOF',
      description: `Recharge de compte AgroProfit - Test`,
      customerName: 'Test Admin',
      customerEmail: `admin@agroprofit.online`,
      customerPhone: '+22890123456',
      payerCountry: 'TG',
      webhookUrl: `https://test.agroprofit.online/api/sendavapay/webhook`,
      externalReference: `dep-${Date.now()}`
    })
  });
  console.log("create-payment status:", response.status);
  const data: any = await response.json();
  console.log("create-payment response:", JSON.stringify(data));
  
  if (data.success && data.data) {
    const initRes = await fetch("https://sendavapay.com/api/sdk/v1/initiate-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer sdk_dt7N8ZAaw0zVc9WwjJWaDtdAJm5OCGNt"
      },
      body: JSON.stringify({
        paymentToken: data.data.paymentToken,
        payerName: 'Test Admin',
        payerPhone: '+22890123456',
        payerCountry: 'TG',
        operatorId: 38,
        operator: 'Moov',
        operatorSlug: 'moov-togo'
      })
    });
    console.log("initiate status:", initRes.status);
    const initData: any = await initRes.json();
    console.log("initiate response:", JSON.stringify(initData));
  }
}
run().catch(console.error);
