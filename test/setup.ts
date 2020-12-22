import { Database } from './helpers/database';
import { adminSecret } from './helpers/secret';

interface FaunaTestsGlobal extends NodeJS.Global {
	db: Database
	timestamp: string
}
declare const global: FaunaTestsGlobal;

global.timestamp = '' + Date.now();

// Wait a little bit between each test to avoid flooding the database service
beforeEach(() => new Promise(resolve => setTimeout(resolve, 500)));

// Setup a new child database for each test suite
beforeAll(async () => { global.db = await Database.create(adminSecret, `fauna-upload-test-${global.timestamp}`); });
afterAll(() => global.db.destroy(adminSecret));
