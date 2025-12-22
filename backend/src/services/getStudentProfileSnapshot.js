export async function getStudentProfileSnapshot(studentId) {
  const [student, education, experience, skills, projects] = await Promise.all([
    Student.findById(studentId).lean(),
    StudentEducation.find({ student: studentId }).sort('order').lean(),
    StudentExperience.find({ student: studentId }).sort('order').lean(),
    StudentSkill.find({ student: studentId }).sort('order').lean(),
    StudentProject.find({ student: studentId }).sort('order').lean(),
  ]);

  if (!student) return null;

  return {
    ...student,
    education,
    experience,
    skills,
    projects,
  };
}
