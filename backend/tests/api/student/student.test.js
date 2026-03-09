import constants from '../../config/constants.js';
import axios from '../../utils/axiosConfig.js';
import User from '../../../src/models/User.model.js';
import { Student } from '../../../src/models/student.model.js';
import { StudentSkill } from '../../../src/models/students/studentSkill.model.js';
import connectDB, { disconnectDB } from '../../../src/config/db.js';

describe('Student Tests', () => {
  jest.setTimeout(30000);
  const testUser = {
    email: `student${Date.now()}@test.com`,
    password: 'password123',
    fullName: 'Student Test',
    authMethod: 'local',
    isEmailVerified: true,
    role: 'user',
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
    const user = await User.findOne({ email: testUser.email });
    if (user) {
      await StudentSkill.deleteMany({ student: user._id });
      await Student.deleteOne({ _id: user._id });
    }
    await User.deleteOne({ email: testUser.email });
    await disconnectDB();
  });

  it('should get student details', async () => {
    const res = await axios.get('/api/v1/students/details');
    expect(res.status).toBe(200);
    expect(res.data.student.email).toBe(testUser.email);
  });

  it('should update student profile', async () => {
    const updateData = {
      jobRole: 'Software Engineer',
      phone: '+1234567890',
    };
    const res = await axios.patch(
      '/api/v1/students/profile/update',
      updateData,
    );
    expect(res.status).toBe(200);
    expect(res.data.student.jobRole).toBe(updateData.jobRole);
  });

  // SKILLS
  it('should add a skill', async () => {
    const skillData = {
      skill: 'JavaScript',
      level: 'INTERMEDIATE',
    };
    const res = await axios.post('/api/v1/students/skills', skillData);
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.skill).toBeDefined();
    expect(res.data.skill.skill).toBe(skillData.skill);
    skillId = res.data.skill._id;
  });

  it('should remove a skill', async () => {
    if (!skillId) return;
    const res = await axios.delete(`/api/v1/students/skills/${skillId}`);
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
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
    const res = await axios.post('/api/v1/students/experiences', expData);
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.experience).toBeDefined();
    expect(res.data.experience.company).toBe(expData.company);
    experienceId = res.data.experience._id;
  });

  it('should remove experience', async () => {
    if (!experienceId) return;
    const res = await axios.delete(
      `/api/v1/students/experiences/${experienceId}`,
    );
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
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
    const res = await axios.post('/api/v1/students/educations', eduData);
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.education).toBeDefined();
    expect(res.data.education.degree).toBe(eduData.degree);
    educationId = res.data.education._id;
  });

  it('should remove education', async () => {
    if (!educationId) return;
    const res = await axios.delete(
      `/api/v1/students/educations/${educationId}`,
    );
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });

  // PROJECTS
  it('should add project', async () => {
    const projData = {
      projectName: 'Portfolio Website',
      description: 'My personal site',
      technologies: ['React', 'Node'],
      isWorkingActive: true,
    };
    const res = await axios.post('/api/v1/students/projects', projData);
    expect(res.status).toBe(201);
    expect(res.data.success).toBe(true);
    expect(res.data.project).toBeDefined();
    expect(res.data.project.projectName).toBe(projData.projectName);
    projectId = res.data.project._id;
  });

  it('should remove project', async () => {
    if (!projectId) return;
    const res = await axios.delete(
      `/api/v1/students/projects/${projectId}`,
    );
    expect(res.status).toBe(200);
    expect(res.data.success).toBe(true);
  });
});
