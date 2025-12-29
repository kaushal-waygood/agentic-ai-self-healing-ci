import constants from "../../config/constants.js";
import axios from "../../utils/axiosConfig.js";
import { User } from "../../../src/models/User.model.js";
import { Notification } from "../../../src/models/notification.model.js";
import connectDB, { disconnectDB } from "../../../src/config/db.js";

describe("Notification Module Tests", () => {
    jest.setTimeout(30000);
    const testUser = {
        email: `notifuser${Date.now()}@test.com`,
        password: "password123",
        fullName: "Notification User",
        authMethod: 'local',
        isEmailVerified: true,
        role: "user" // Correct role for isStudent middleware
    };

    let notifId;

    beforeAll(async () => {
        await connectDB();
        const user = new User(testUser);
        await user.save();

        constants.ACCESS_TOKEN = user.generateAccessToken();
        testUser._id = user._id;

        // Create a test notification
        const notif = await Notification.create({
            userId: user._id,
            title: "Test Notification",
            message: "Welcome",
            type: "info",
            category: "general"
        });
        notifId = notif._id;
    });

    afterAll(async () => {
        await User.deleteOne({ email: testUser.email });
        await Notification.deleteMany({ userId: testUser._id });
        await disconnectDB();
    });

    it("should get user notifications", async () => {
        const res = await axios.get("/api/v1/notifications");
        expect(res.status).toBe(200);
        expect(res.data.data).toBeDefined();
    });

    it("should get unread count", async () => {
        const res = await axios.get("/api/v1/notifications/unread-count");
        expect(res.status).toBe(200);
        expect(res.data.data.unreadCount).toBeGreaterThanOrEqual(1);
    });

    it("should mark notification as read", async () => {
        const res = await axios.patch(`/api/v1/notifications/${notifId}/read`);
        expect(res.status).toBe(200);
        expect(res.data.data.isRead).toBe(true);
    });

    it("should mark all as read", async () => {
        // Create another one
        await Notification.create({
            userId: testUser._id,
            title: "Another one",
            message: "msg"
        });
        const res = await axios.patch("/api/v1/notifications/mark-all-read");
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
    });

    it("should delete notification", async () => {
        const res = await axios.delete(`/api/v1/notifications/${notifId}`);
        expect(res.status).toBe(200);
        expect(res.data.success).toBe(true);
    });
});
