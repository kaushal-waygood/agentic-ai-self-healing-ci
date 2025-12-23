// Example: Mocking environment variables or setting up global tokens before all tests
const constants = require('./config/constants');

beforeAll(() => {
    // You could dynamically fetch tokens here if needed or mock API responses
    constants.ACCESS_TOKEN = 'some-valid-token';  // Example of setting a global token
    constants.REFRESH_TOKEN = 'some-refresh-token';
});
