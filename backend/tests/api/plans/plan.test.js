import constants from "../../config/constants.js";
import axios from "../../utils/axiosConfig.js";
import User from "../../../src/models/User.model.js";
import { Plan } from "../../../src/models/Plans.model.js";
import connectDB, { disconnectDB } from "../../../src/config/db.js";

describe("Plan Module Tests", () => {
    jest.setTimeout(30000);
    const testSuperAdmin = {
        email: `superadmin${Date.now()}@test.com`,
        password: "password123",
        fullName: "Super Admin Test",
        authMethod: 'local',
        isEmailVerified: true,
        role: 'user',
    };
    let planId;

    beforeAll(async () => {
        await connectDB();
        const user = new User(testSuperAdmin);
        await user.save();

        await User.findByIdAndUpdate(user._id, { role: 'super-admin' });
        const updatedUser = await User.findById(user._id);
        constants.ACCESS_TOKEN = updatedUser.generateAccessToken();

        await Plan.deleteOne({ planType: "Enterprise" });
    });

    afterAll(async () => {
        await User.deleteOne({ email: testSuperAdmin.email });
        if (planId) await Plan.deleteOne({ _id: planId });
        await Plan.deleteOne({ planType: "Enterprise" });
        await disconnectDB();
    });

    it("should create a new plan (super-admin only)", async () => {
        const planData = {
            planType: "Enterprise",
            displayOrder: 999,
            popular: true,
            billingVariants: [
                {
                    period: "Monthly",
                    price: {
                        effective: { usd: 29, inr: 2900 },
                        actual: { usd: 39, inr: 3900 }
                    },
                    features: [{ name: "Feature 1", value: "Yes" }]
                }
            ]
        };

        const res = await axios.post("/api/v1/plan/create", planData);
        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
        expect(res.data.data).toBeDefined();
        planId = res.data.data._id;
    });

    it("should get all plans", async () => {
        const res = await axios.get("/api/v1/plan/");
        expect(res.status).toBe(200);
    });
});
