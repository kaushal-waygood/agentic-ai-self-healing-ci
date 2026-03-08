import constants from "../../config/constants.js";
import axios from "../../utils/axiosConfig.js";
import User from "../../../src/models/User.model.js";
import { Job } from "../../../src/models/jobs.model.js";
import { Organization } from "../../../src/models/Organization.model.js";
import connectDB, { disconnectDB } from "../../../src/config/db.js";

describe("Job Module Tests", () => {
    jest.setTimeout(30000);
    const ts = Date.now();
    const testAdmin = {
        email: `admin${ts}@test.com`,
        password: "password123",
        fullName: "Admin Test",
        authMethod: 'local',
        isEmailVerified: true,
        role: 'user',
    };
    let jobId;
    let orgId;

    beforeAll(async () => {
        await connectDB();
        const user = new User(testAdmin);
        await user.save();

        const org = await Organization.create({
            name: `TestOrg-${ts}`,
            user: user._id,
            type: 'COMPANY',
            apiKey: `test-api-key-${ts}-${Math.random().toString(36).slice(2, 15)}`,
        });
        orgId = org._id;

        await User.findByIdAndUpdate(user._id, {
            role: 'admin',
            organization: org._id,
        });
        const updatedUser = await User.findById(user._id);
        constants.ACCESS_TOKEN = updatedUser.generateAccessToken();
    });

    afterAll(async () => {
        await User.deleteOne({ email: testAdmin.email });
        if (orgId) await Organization.deleteOne({ _id: orgId });
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

        const res = await axios.post("/api/v1/jobs/mannual", jobData);
        expect(res.status).toBe(201);
        expect(res.data.success).toBe(true);
        expect(res.data.job).toBeDefined();
        expect(res.data.job.title).toBe("Senior Backend Engineer");
        jobId = res.data.job._id;
    });

    it("should search jobs", async () => {
        const res = await axios.get("/api/v1/jobs/search?q=Backend");
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.jobs)).toBe(true);
    });
});
