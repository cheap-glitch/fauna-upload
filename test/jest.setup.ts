import { wait } from '../src/utils';

// Wait a little bit between each test to avoid flooding the database service
beforeEach(() => wait(500));
