# API Implementation Documentation

## Overview

This TodoRN app implements a comprehensive API layer that supports both **Mock** and **Real** API modes. The implementation includes all the endpoints specified in the API documentation with proper error handling, type safety, and easy switching between modes.

## Architecture

### 1. Unified API Service (`src/services/ApiService.ts`)
- **Single entry point** for all API calls
- **Automatic switching** between Mock and Real APIs based on configuration
- **Consistent interface** regardless of the underlying implementation
- **Type-safe** responses and requests

### 2. Mock API Service (`src/services/MockApiService.ts`)
- **Local storage-based** implementation
- **Simulated network delays** for realistic testing
- **Error simulation** for testing error scenarios
- **Complete feature parity** with real API

### 3. Real API Service (`src/services/RealApiService.ts`)
- **HTTP-based** implementation using fetch
- **Authentication token** management
- **Request/response interceptors**
- **Error handling** with proper HTTP status codes

## Configuration

### API Mode Configuration

The API mode is controlled by the `MOCK_MODE` flag in `src/constants/app.ts`:

```typescript
export const APP_CONSTANTS = {
  API: {
    BASE_URL: 'https://api.todoapp.com/v1',
    MOCK_MODE: true, // Set to false to use real API
    TIMEOUT: 10000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000,
  },
  // ... other constants
};
```

### Runtime Configuration

You can also change the API mode at runtime using the API configuration utilities:

```typescript
import { devHelpers } from '../utils/apiConfig';

// Switch to real API
await devHelpers.enableRealApi();

// Switch to mock API
await devHelpers.enableMockApi();

// Get current mode
const mode = await devHelpers.getCurrentMode(); // 'MOCK' or 'REAL'
```

## Implemented Endpoints

### Authentication
- ✅ `POST /auth/login` - Send OTP
- ✅ `POST /auth/verify-otp` - Verify OTP and get token
- ✅ `POST /auth/logout` - Logout user

### Tasks
- ✅ `GET /tasks` - Get all tasks with pagination and filters
- ✅ `POST /tasks` - Create new task
- ✅ `GET /tasks/{taskId}` - Get specific task
- ✅ `PUT /tasks/{taskId}` - Update task
- ✅ `DELETE /tasks/{taskId}` - Delete task
- ✅ `PATCH /tasks/{taskId}/complete` - Mark task as completed

### Categories
- ✅ `GET /categories` - Get all categories
- ✅ `POST /categories` - Create new category
- ✅ `PUT /categories/{categoryId}` - Update category
- ✅ `DELETE /categories/{categoryId}` - Delete category

### Bulk Operations
- ✅ `POST /tasks/bulk` - Bulk operations on tasks

### Search
- ✅ `GET /tasks/search` - Search tasks

### Analytics
- ✅ `GET /tasks/analytics` - Get task analytics

### Feedback
- ✅ `POST /feedback` - Submit feedback
- ✅ `GET /feedback` - Get feedback history

## Usage Examples

### Basic API Usage

```typescript
import ApiService from '../services/ApiService';

const api = ApiService.getInstance();

// Initialize (required for mock mode)
await api.initialize();

// Authentication
const otpResponse = await api.sendOtp({ phoneNumber: '+1234567890' });
const loginResponse = await api.verifyOtp({ phoneNumber: '+1234567890', otp: '123456' });

// Tasks
const tasksResponse = await api.getTasks({ page: 1, limit: 20 });
const createResponse = await api.createTask({
  title: 'New Task',
  description: 'Task description',
  priority: 'high',
  categoryId: 'cat_1',
  dueDate: '2024-01-20T23:59:59Z'
});

// Categories
const categoriesResponse = await api.getCategories();
const categoryResponse = await api.createCategory({
  name: 'Work',
  color: '#FF5722'
});
```

### Redux Integration

The API is integrated with Redux through async thunks:

```typescript
import { useDispatch, useSelector } from 'react-redux';
import { sendOtp, verifyOtp, loadTasks } from '../store/slices/authSlice';

// In your component
const dispatch = useDispatch();

// Send OTP
await dispatch(sendOtp('+1234567890'));

// Verify OTP
await dispatch(verifyOtp({ phone: '+1234567890', otp: '123456' }));

// Load tasks
await dispatch(loadTasks());
```

## Switching Between Modes

### Method 1: Configuration File
Edit `src/constants/app.ts`:
```typescript
MOCK_MODE: false, // Change to false for real API
```

### Method 2: Runtime Switch
Use the API settings screen or programmatically:

```typescript
import { devHelpers } from '../utils/apiConfig';

// Switch to real API
await devHelpers.enableRealApi();

// Switch to mock API
await devHelpers.enableMockApi();
```

### Method 3: API Settings Screen
Navigate to the API Settings screen in the app to toggle modes visually.

## Error Handling

### API Errors
All API calls include proper error handling:

```typescript
try {
  const response = await api.createTask(taskData);
  if (response.success) {
    // Handle success
  } else {
    // Handle API error
  }
} catch (error) {
  // Handle network/other errors
}
```

### Error Types
- **Validation Error (422)**: Invalid request data
- **Unauthorized (401)**: Invalid or missing authentication token
- **Not Found (404)**: Resource not found
- **Server Error (500)**: Internal server error

## Type Safety

All API requests and responses are fully typed:

```typescript
// Request types
interface CreateTaskApiRequest {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  categoryId: string;
  dueDate?: string;
}

// Response types
interface TasksListResponse {
  success: boolean;
  data: {
    tasks: TaskResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

## Development Features

### Mock Mode Features
- **Local storage persistence** - Data persists between app sessions
- **Simulated network delays** - Realistic loading states
- **Error simulation** - 5% chance of random errors for testing
- **Default data** - Pre-populated with sample tasks and categories

### Real Mode Features
- **HTTP request handling** - Proper fetch implementation
- **Token management** - Automatic token storage and refresh
- **Request timeout** - Configurable timeout handling
- **Error retry** - Automatic retry on network failures

## Testing

### API Connection Test
Use the built-in connection test:

```typescript
import { devHelpers } from '../utils/apiConfig';

const result = await devHelpers.testApiConnection();
console.log(result);
// { success: true, mode: 'MOCK', status: {...} }
```

### Unit Testing
Mock the API service for unit tests:

```typescript
import ApiService from '../services/ApiService';

// Mock the API service
jest.mock('../services/ApiService');
const mockApi = ApiService.getInstance() as jest.Mocked<ApiService>;
```

## Migration Guide

### From Mock to Real API

1. **Update configuration**:
   ```typescript
   MOCK_MODE: false
   ```

2. **Verify API endpoints**:
   - Ensure your real API matches the documented endpoints
   - Update `BASE_URL` if needed

3. **Test authentication**:
   - Verify OTP flow works with real API
   - Check token storage and refresh

4. **Test all features**:
   - Create, read, update, delete tasks
   - Category management
   - Search and analytics

### From Real to Mock API

1. **Switch to mock mode**:
   ```typescript
   MOCK_MODE: true
   ```

2. **Initialize mock data**:
   ```typescript
   const api = ApiService.getInstance();
   await api.initialize(); // Sets up default data
   ```

## Troubleshooting

### Common Issues

1. **API not responding**:
   - Check network connectivity
   - Verify API base URL
   - Test with connection test utility

2. **Authentication issues**:
   - Clear stored tokens
   - Re-authenticate user
   - Check token expiration

3. **Data not persisting**:
   - Check AsyncStorage permissions
   - Verify mock mode initialization
   - Clear and reinitialize data

### Debug Mode

Enable debug logging:

```typescript
// In your app initialization
if (__DEV__) {
  console.log('API Mode:', await devHelpers.getCurrentMode());
  console.log('API Config:', await getApiConfig());
}
```

## Performance Considerations

### Mock Mode
- **Fast responses** - No network latency
- **Offline capable** - Works without internet
- **Memory efficient** - Uses local storage

### Real Mode
- **Network dependent** - Requires internet connection
- **Caching** - Consider implementing response caching
- **Pagination** - Use pagination for large datasets

## Security

### Mock Mode
- **Local data only** - No external API calls
- **No sensitive data** - Uses dummy data

### Real Mode
- **HTTPS required** - All API calls use HTTPS
- **Token security** - Tokens stored securely
- **Input validation** - All inputs validated before sending

## Future Enhancements

1. **Offline support** - Queue requests when offline
2. **Response caching** - Cache frequently accessed data
3. **Background sync** - Sync data in background
4. **Push notifications** - Real-time updates
5. **File uploads** - Support for task attachments

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review the API documentation
3. Test with the connection test utility
4. Check console logs for detailed error messages 