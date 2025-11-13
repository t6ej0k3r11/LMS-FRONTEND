# Frontend Integration Tests

This directory contains integration tests for the React frontend, focusing on API interactions and user flows.

## Setup

1. Install dependencies:

    ```bash
    npm install
    ```

2. Run tests:

    ```bash
    # Run all tests
    npm test

    # Run integration tests only
    npm run test:integration

    # Run tests in watch mode
    npm run test:watch
    ```

## Test Structure

### Frontend Integration Tests (`src/__tests__/integration/`)

- **`auth-flow.test.js`**: Tests the complete frontend user journey with mocked API calls
  - User registration and login
  - Course enrollment
  - Quiz interaction (fetch, attempt, submit, results)
  - Token management and refresh
  - Error handling

### Test Setup

- **Jest with jsdom**: Browser environment simulation
- **Axios mocking**: Complete API call interception
- **SessionStorage mocking**: Token storage simulation
- **Window object mocking**: Location and other browser APIs

### Key Features Tested

1. **Authentication Flow**:
   - Registration with form validation
   - Login with token storage
   - Automatic token refresh on expiry
   - Logout and token cleanup

2. **API Integration**:
   - Axios interceptor configuration
   - Request/response handling
   - Error scenarios and retries
   - Token attachment to requests

3. **Course Management**:
   - Course enrollment with payment data
   - Access control verification
   - Data persistence across sessions

4. **Quiz System**:
   - Quiz listing and selection
   - Attempt initialization
   - Answer submission
   - Results retrieval and display

### Mock Strategy

**Axios Mocking**:

- All HTTP requests are intercepted using `jest.mock('axios')`
- Responses are mocked to simulate real API behavior
- Error scenarios test resilience

**Browser API Mocking**:

- `sessionStorage`: Token persistence
- `window.location`: Redirects on auth failure
- Global observers: ResizeObserver, IntersectionObserver

### Data Flow Verification

The tests verify that data flows correctly through the frontend layers:

1. **User Actions → API Calls**: Form submissions trigger correct HTTP requests
2. **API Responses → State Updates**: Mock responses update component state
3. **Token Management**: Automatic refresh and error handling
4. **Error Handling**: Network failures and auth errors trigger appropriate UI responses

### Mock Data Structure

```javascript
const mockUser = {
  _id: 'user-123',
  userName: 'teststudent',
  userEmail: 'test@example.com',
  role: 'student',
};

const mockTokens = {
  accessToken: 'mock-access-token-123',
  refreshToken: 'mock-refresh-token-456',
};
```

### Running Tests

```bash
# Run all frontend tests
npm test

# Run specific test file
npm test auth-flow.test.js

# Run with coverage
npm test -- --coverage
```

### Test Scenarios

1. **Happy Path**: Complete successful user journey
2. **Error Handling**: Network failures, invalid tokens, server errors
3. **Token Refresh**: Automatic token renewal on expiry
4. **Authorization**: Access control and permission checks

### Dependencies

**Test Dependencies**:

- `jest`: Test framework
- `jest-environment-jsdom`: Browser environment
- `@babel/core`, `@babel/preset-env`, `@babel/preset-react`: ES6+ and JSX transpilation

**Mocked Dependencies**:

- `axios`: HTTP client
- `sessionStorage`: Browser storage
- `window.location`: Navigation

### Configuration Files

- **`jest.config.js`**: Jest configuration with jsdom environment
- **`babel.config.js`**: Babel configuration for test transpilation
- **`src/__tests__/setup.js`**: Global test setup and mocks

### Troubleshooting

**Common Issues:**

1. **Import errors**: Ensure `@/` alias is configured in Jest
2. **Async/await**: Tests use async/await, ensure proper handling
3. **Mock cleanup**: Mocks are cleared between tests automatically

**Debug Mode:**

```bash
DEBUG=jest:* npm test
```

### Integration with Backend Tests

These frontend tests complement the backend integration tests by:

- Testing the same user flows from the client perspective
- Verifying API contract compliance
- Ensuring proper error handling in the UI layer
- Validating token management across the full stack
