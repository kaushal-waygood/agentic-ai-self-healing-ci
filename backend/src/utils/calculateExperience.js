const calculateExperience = (startDate, endDate, currentlyWorking) => {
  const startYear = new Date(startDate).getFullYear();
  const endYear = new Date(endDate).getFullYear();
  const currentYear = new Date().getFullYear();
  let years = endYear - startYear + 1;

  if (currentlyWorking) {
    years += currentYear - endYear;
  }

  return years > 0 ? years : 0;
};

export default calculateExperience;
