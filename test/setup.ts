// Wait a little bit between each test to avoid flooding the database service
beforeEach(() => new Promise(resolve => setTimeout(resolve, 500)));
