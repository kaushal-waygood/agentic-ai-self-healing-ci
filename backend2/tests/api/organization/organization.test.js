import constants from "../../config/constants.js";
import axios from "../../utils/axiosConfig.js";
import { User } from "../../../src/models/User.model.js";
import connectDB, { disconnectDB } from "../../../src/config/db.js";

describe("Organization Module Tests", () => {
    jest.setTimeout(30000);
    const testAdmin = {
        email: `orgadmin${Date.now()}@test.com`,
        password: "password123",
        fullName: "Org Admin",
        authMethod: 'local',
        isEmailVerified: true
    };
    let memberId;

    beforeAll(async () => {
        await connectDB();
        const user = new User(testAdmin);
        await user.save();

        // Elevate to admin/super-admin
        await User.findByIdAndUpdate(user._id, { role: 'super-admin' });

        const updatedUser = await User.findById(user._id);
        constants.ACCESS_TOKEN = updatedUser.generateAccessToken();
    });

    afterAll(async () => {
        await User.deleteOne({ email: testAdmin.email });
        // Clean up created member if stored in separate collection, 
        // but here we just test logic. Ideally should import OrganizationMember model to clean up.
        await disconnectDB();
    });

    it("should create an organization member", async () => {
        const memberData = {
            email: `member${Date.now()}@test.com`,
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
        // Verify the created member is in the list
        const found = res.data.members.find(m => m._id === memberId);
        expect(found).toBeDefined();
    });

    it("should remove organization member", async () => {
        if (!memberId) return;
        const res = await axios.delete(`/api/v1/organization/members/${memberId}/remove`);
        expect(res.status).toBe(200);
        expect(res.data.message).toContain("Member deleted successfully");
    });
});
