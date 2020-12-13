import { adminSecret } from './helpers/secret';
import { Database } from './helpers/database';

import { FaunaQueryResult } from '../src/types';
import { createFaunaClient } from '../src/lib/client';
import { uploadData } from '../src/lib/data';
// import { uploadResources } from '../src/lib/resources';

const timestamp = '' + Date.now();

// Create a new admin client for the test database
const client = createFaunaClient(adminSecret);

// Setup a new child database for the tests
let db: Database;
beforeAll(async () => { db = await Database.create(`fauna-upload-test-${timestamp}`, client); });
afterAll(() => db.destroy());

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
