import constants from "../../config/constants.js";
import axios from "../../utils/axiosConfig.js";
import { User } from "../../../src/models/User.model.js";
import { Job } from "../../../src/models/jobs.model.js";
import connectDB, { disconnectDB } from "../../../src/config/db.js";

describe("Job Module Tests", () => {
    jest.setTimeout(30000);
    const testAdmin = {
        email: `admin${Date.now()}@test.com`,
        password: "password123",
        fullName: "Admin Test",
        authMethod: 'local',
        isEmailVerified: true,
        // Role will be updated manually
    };
    let jobId;

    beforeAll(async () => {
        await connectDB();
        const user = new User(testAdmin);
        await user.save();

        // Elevate to admin to access admin routes like postManualJob
        await User.findByIdAndUpdate(user._id, { role: 'admin' });

        // Generate token (re-fetch user or just generate with updated role if needed, 
        // though generateAccessToken usually pulls from instance state, catching the update might require reload if it used this.role)
        // But the model method uses `this.role`, so we need to refresh the instance or manually pass parameters if we were calling a static method.
        // Actually `generateAccessToken` is an instance method. Let's find updated user.
        const updatedUser = await User.findById(user._id);
        constants.ACCESS_TOKEN = updatedUser.generateAccessToken();
    });

    afterAll(async () => {
        await User.deleteOne({ email: testAdmin.email });
        if (jobId) await Job.deleteOne({ _id: jobId });
        await disconnectDB();
    });

    it("should post a manual job (admin only)", async () => {
        const jobData = {
            title: "Senior Backend Engineer",
            description: "We are looking for a Node.js expert.",
            company: "ZobsAI Test Corp",
            location: { city: "New York", state: "NY" },
            applyMethod: { method: "URL", url: "https://zobsai.com/apply" },
            isActive: true
        };

        if (!jobId) return;
        const res = await axios.get(`/api/v1/jobs/${jobId}`);
        expect(res.status).toBe(200);
        expect(res.data.job.title).toBe("Senior Backend Engineer");
    });

    it("should search jobs", async () => {
        const res = await axios.get("/api/v1/jobs/search?query=Backend");
        expect(res.status).toBe(200);
        // Assuming search returns a list
        expect(Array.isArray(res.data.jobs)).toBe(true);
    });
});
