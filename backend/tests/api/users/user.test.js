import constants from "../../config/constants.js";
import axios from "../../utils/axiosConfig.js";
import User from "../../../src/models/User.model.js";
import connectDB, { disconnectDB } from "../../../src/config/db.js";

describe("User API Tests", () => {
    jest.setTimeout(30000);
    const testUser = {
        email: `user${Date.now()}@test.com`,
        password: "password123",
        fullName: "User Test",
        authMethod: 'local',
        isEmailVerified: true,
        role: 'user',
    };

    beforeAll(async () => {
        await connectDB();
        const user = new User(testUser);
        await user.save();
        constants.ACCESS_TOKEN = user.generateAccessToken();
    });

    afterAll(async () => {
        await User.deleteOne({ email: testUser.email });
        await disconnectDB();
    });

  it("should change password", async () => {
    const payload = {
        currentPassword: testUser.password,
        newPassword: "newpassword123",
        confirmNewPassword: "newpassword123"
    };

    const res = await axios.patch(
        "/api/v1/user/me/password/change",
        payload,
        {
            headers: {
                Authorization: `Bearer ${testUser.token}`,
            },
        }
    );

    expect(res.status).toBe(200);
    expect(res.data.message).toContain("Password changed successfully");

    testUser.password = payload.newPassword;
});

    it("should request password reset (forgot password)", async () => {
        const res = await axios.post("/api/v1/user/forgot-password", {
            email: testUser.email
        });
        expect(res.status).toBe(200);
        expect(res.data.message).toContain("password reset link has been sent");
    });
});

