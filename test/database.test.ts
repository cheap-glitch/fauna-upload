import { wait } from '../src/utils';

import { Database } from './helpers/database';
import { adminToken } from './helpers/token';

import { FaunaQueryResult } from '../src/types';
import { createFaunaClient } from '../src/utils/client';
import { uploadData } from '../src/lib/data';
// import { uploadResources } from '../src/lib/resources';

const client    = createFaunaClient(adminToken);
const timestamp = '' + Date.now();

// Setup a new database for the tests
let db: Database;
beforeAll(async () => { db = await Database.create(`fauna-upload-test-${timestamp}`, client); });
afterAll(() => db.destroy());

// Wait a little bit between each test to avoid flooding the database service
beforeEach(() => wait(500));

test("upload new data", async () => { // {{{

	// Setup
	if (!(await db.collectionExists('users'))) {
		await db.createCollection('users');
	}
	if (!(await db.indexExists('users_keys'))) {
		await db.createIndex('users', 'users_keys', { unique: true, terms: [{ field: ['data', 'key'] }] });
	}

	// Action
	const reponse = await uploadData(client, [{
		collection: 'users',
		index:      'users_keys',
		key:        'key',
		documents:  [{ key: timestamp }],
	}]);

	// Tests
	expect(reponse).toEqual([[FaunaQueryResult.Created]]);
	await expect(db.documentExists('users_keys', timestamp)).resolves.toBe(true);

}); // }}}

test("update existing data", async () => { // {{{

	// Setup
	if (!(await db.collectionExists('users'))) {
		await db.createCollection('users');
	}
	if (!(await db.indexExists('users_keys'))) {
		await db.createIndex('users', 'users_keys', { unique: true, terms: [{ field: ['data', 'key'] }] });
	}
	if (!(await db.documentExists('users_keys', timestamp))) {
		await db.createDocument('users', { key: timestamp });
	}

	// Action
	const reponse = await uploadData(client, [{
		collection: 'users',
		index:      'users_keys',
		key:        'key',
		documents:  [{ key: timestamp, updated: true }],
	}]);

	// Tests
	expect(reponse).toEqual([[FaunaQueryResult.Updated]]);
	await expect(db.documentHasProperty('users_keys', timestamp, 'updated')).resolves.toBe(true);

}); // }}}
