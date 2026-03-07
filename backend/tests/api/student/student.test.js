import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import { User } from '../../../src/models/User.model.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';
import redisClient from '../../../src/config/redis.js';

describe('Student Tests', () => {
  jest.setTimeout(30000);
  const testUser = {
    email: `student${Date.now()}@test.com`,
    password: 'password123',
    fullName: 'Student Test',
    authMethod: 'local',
    isEmailVerified: true,
  };
  let skillId;
  let experienceId;
  let educationId;
  let projectId;

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

  it('should get student details', async () => {
    const res = await axios.get('/api/v1/students/details');
    expect(res.status).toBe(200);
    expect(res.data.studentDetails.email).toBe(testUser.email);
  });

  it('should update student profile', async () => {
    const updateData = {
      jobRole: 'Software Engineer',
    };
    const res = await axios.patch(
      '/api/v1/students/profile/update',
      updateData,
    );
    expect(res.status).toBe(200);
    expect(res.data.updatedStudent.jobRole).toBe(updateData.jobRole);
  });

  it('should grant profile completion credits only once', async () => {
    // fetch the student id from details
    const detailsRes = await axios.get('/api/v1/students/details');
    const studentId = detailsRes.data.studentDetails._id;

    // clear any existing cache so the endpoint recomputes
    await redisClient.del(`student:${studentId}:profileCompletion`);

    const beforeCredits = (await axios.get('/api/v1/students/credits')).data
      .credits;

    // call status first time – should award personal profile credit
    const status1 = await axios.get('/api/v1/students/profile/status');
    expect(status1.status).toBe(200);
    expect(status1.data.categories.coreProfile).toBe(true);

    const after1 = (await axios.get('/api/v1/students/credits')).data.credits;
    expect(after1).toBe(beforeCredits + 10);

    // simulate another recompute (cache cleared by update flow)
    await redisClient.del(`student:${studentId}:profileCompletion`);
    await axios.get('/api/v1/students/profile/status');
    const after2 = (await axios.get('/api/v1/students/credits')).data.credits;
    expect(after2).toBe(after1); // no additional credits

    // also update core profile again and verify credits remain unchanged
    await axios.patch('/api/v1/students/profile/update', {
      jobRole: 'Another Role',
    });
    await redisClient.del(`student:${studentId}:profileCompletion`);
    const after3 = (await axios.get('/api/v1/students/credits')).data.credits;
    expect(after3).toBe(after1);
  });

  // SKILLS
  it('should add a skill', async () => {
    const skillData = {
      skill: 'JavaScript',
      level: 'Intermediate',
    };
    const res = await axios.post('/api/v1/students/skill/add', skillData);
    expect(res.status).toBe(200);
    const skills = res.data.skills;
    const addedSkill = skills.find((s) => s.skill === skillData.skill);
    expect(addedSkill).toBeDefined();
    skillId = addedSkill._id;
  });

  it('should remove a skill', async () => {
    if (!skillId) return;
    const res = await axios.delete(`/api/v1/students/skill/remove/${skillId}`);
    expect(res.status).toBe(200);
    const skills = res.data.skills || [];
    const removedSkill = skills.find((s) => s._id === skillId);
    expect(removedSkill).toBeUndefined();
  });

  // EXPERIENCE
  it('should add experience', async () => {
    const expData = {
      company: 'Tech Corp',
      designation: 'Developer',
      startDate: '2023-01-01',
      currentlyWorking: true,
      location: 'Remote',
    };
    const res = await axios.post('/api/v1/students/experience/add', expData);
    expect(res.status).toBe(200);
    const experiences = res.data.experience;
    const addedExp = experiences.find((e) => e.company === expData.company);
    expect(addedExp).toBeDefined();
    experienceId = addedExp.experienceId; // Using slug ID as per controller
  });

  it('should remove experience', async () => {
    if (!experienceId) return;
    const res = await axios.delete(
      `/api/v1/students/experience/remove/${experienceId}`,
    );
    expect(res.status).toBe(200);
    const experiences = res.data.experience || [];
    const removedExp = experiences.find((e) => e.experienceId === experienceId);
    expect(removedExp).toBeUndefined();
  });

  // EDUCATION
  it('should add education', async () => {
    const eduData = {
      degree: 'Bachelors',
      fieldOfStudy: 'Computer Science',
      startDate: '2019-01-01',
      endDate: '2023-01-01',
      institution: 'University of Tech',
      gpa: 3.8,
    };
    const res = await axios.post('/api/v1/students/education/add', eduData);
    expect(res.status).toBe(200);
    const education = res.data.education;
    const addedEdu = education.find((e) => e.degree === eduData.degree);
    expect(addedEdu).toBeDefined();
    educationId = addedEdu.educationId; // Using slug ID
  });

  it('should remove education', async () => {
    if (!educationId) return;
    const res = await axios.delete(
      `/api/v1/students/education/remove/${educationId}`,
    );
    expect(res.status).toBe(200);
    const education = res.data.education || [];
    const removedEdu = education.find((e) => e.educationId === educationId);
    expect(removedEdu).toBeUndefined();
  });

  // PROJECTS
  it('should add project', async () => {
    const projData = {
      projectName: 'Portfolio Website',
      description: 'My personal site',
      technologies: ['React', 'Node'],
      isWorkingActive: true,
    };
    const res = await axios.post('/api/v1/students/project/add', projData);
    expect(res.status).toBe(200);
    const projects = res.data.projects;
    const addedProj = projects.find(
      (p) => p.projectName === projData.projectName,
    );
    expect(addedProj).toBeDefined();
    projectId = addedProj._id; // Assuming _id is used
  });

  it('should remove project', async () => {
    if (!projectId) return;
    const res = await axios.delete(
      `/api/v1/students/project/remove/${projectId}`,
    );
    expect(res.status).toBe(200);
    const projects = res.data.projects || [];
    const removedProj = projects.find((p) => p._id === projectId);
    if (projects.length > 0) {
      // Check if verification logic needs to be adjusted based on actual return behavior
      expect(removedProj).toBeUndefined();
    }
  });
});
