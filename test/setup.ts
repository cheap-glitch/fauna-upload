import { Database } from './helpers/database';

interface FaunaTestsGlobal extends NodeJS.Global {
	db: Database
	timestamp: string
}
declare const global: FaunaTestsGlobal;

global.timestamp = String(Date.now());

// Setup a new child database for each test suite
beforeAll(async () => {
	try {
		global.db = await Database.create('root', `fauna-upload-test-${global.timestamp}`);
	} catch (error) {
		console.error(error);
	}
});
afterAll(async () => {
	try {
		await global.db.destroy('root');
	} catch (error) {
		console.error(error);
	}
});
