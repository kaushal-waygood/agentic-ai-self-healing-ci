import constants from "../../config/constants.js";
import axios from "../../utils/axiosConfig.js";
import User from "../../../src/models/User.model.js";
import connectDB, { disconnectDB } from "../../../src/config/db.js";

describe("Organization Module Tests", () => {
    jest.setTimeout(30000);
    const testAdmin = {
        email: `orgadmin${Date.now()}@test.com`,
        password: "password123",
        fullName: "Org Admin",
        authMethod: 'local',
        isEmailVerified: true,
        role: 'user',
    };
    let memberId;
    let memberEmail;

    beforeAll(async () => {
        await connectDB();
        const user = new User(testAdmin);
        await user.save();

        await User.findByIdAndUpdate(user._id, { role: 'super-admin' });
        const updatedUser = await User.findById(user._id);
        constants.ACCESS_TOKEN = updatedUser.generateAccessToken();
    });

    afterAll(async () => {
        await User.deleteOne({ email: testAdmin.email });
        if (memberEmail) await User.deleteOne({ email: memberEmail });
        await disconnectDB();
    });

    it("should create an organization member", async () => {
        memberEmail = `member${Date.now()}@test.com`;
        const memberData = {
            email: memberEmail,
            role: "hr",
            fullName: "Test Member"
        };
        const res = await axios.post("/api/v1/organization/members/create", memberData);
        expect(res.status).toBe(201);
        expect(res.data.data).toBeDefined();
        memberId = res.data.data._id;
    });

    it("should get all organization members", async () => {
        const res = await axios.get("/api/v1/organization/members/all");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.members)).toBe(true);
    });

    it("should remove organization member", async () => {
        if (!memberId) return;
        const res = await axios.delete(`/api/v1/organization/members/${memberId}/remove`);
        expect(res.status).toBe(200);
    });
});
