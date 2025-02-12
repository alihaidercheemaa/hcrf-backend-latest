const request = require("supertest");
const app = require("../app"); // Your express server instance

describe("Payment API", () => {
    test("Should create a Razorpay order", async () => {
        const response = await request(app)
            .post("/api/payment/create-order")
            .send({ amount: 500, type: "membership" });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty("order");
    });

    test("Should fail payment verification for invalid signature", async () => {
        const response = await request(app)
            .post("/api/payment/verify")
            .send({ razorpay_order_id: "fake", razorpay_payment_id: "fake", razorpay_signature: "fake" });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("error", "Payment verification failed");
    });
});
