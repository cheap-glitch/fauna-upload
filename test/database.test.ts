// import { Readable } from 'stream';

import { Database } from './helpers/database';
import { adminToken } from './helpers/token';

import { wait } from '../src/utils';
import { createFaunaClient } from '../src/utils/client';
import { uploadData } from '../src/lib/data';
// import { uploadSchema } from '../src/lib/schema';
// import { uploadResources } from '../src/lib/resources';
import { FaunaQueryResult } from '../src/types';

const client = createFaunaClient(adminToken);

// Setup a new database for the tests
let db: Database;
beforeAll(async () => { db = await Database.create(`fauna-upload-test-${Date.now()}`, client); });
afterAll(() => db.destroy());

// Wait a little bit between each test to avoid flooding the database service
beforeEach(() => wait(500));

test.only("upload new data", async () => { // {{{

	const timestamp = Date.now();

	// Setup
	if (!(await db.collectionExists('users'))) {
		await db.createCollection('users');
	}
	if (!(await db.indexExists('users', 'users_keys'))) {
		await db.createIndex('users', 'users_keys');
	}

	// Action
	const reponse = await uploadData(client, [{
		collection: 'users',
		index:      'users_keys',
		key:        'key',
		documents:  [{ key: timestamp }],
	}]);

	// Tests
	expect(reponse).toBe(FaunaQueryResult.Created);
	await expect(db.documentExists('users', 'users_keys', timestamp)).resolves.toBe(true);

}); // }}}
