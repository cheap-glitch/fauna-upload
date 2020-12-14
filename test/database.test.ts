import { adminSecret } from './helpers/secret';
import { Database } from './helpers/database';

import { FaunaQueryResult } from '../src/types';
import { uploadData } from '../src/lib/data';
// import { uploadResources } from '../src/lib/resources';

const timestamp = '' + Date.now();

// Setup a new child database for the tests
let db: Database;
beforeAll(async () => {
	db = await Database.create(adminSecret, `fauna-upload-test-${timestamp}`);
});
afterAll(async () => {
	return db.destroy(adminSecret);
});

test("upload new data", async () => { // {{{

	// Setup
	if (!(await db.collectionExists('users'))) {
		await db.createCollection('users');
	}
	if (!(await db.indexExists('users_keys'))) {
		await db.createIndex('users', 'users_keys', { unique: true, terms: [{ field: ['data', 'key'] }] });
	}

	// Action
	const reponse = await uploadData(db.getClient(), [{
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
	await expect(db.documentExists('users_keys', timestamp)).resolves.toBe(true);

	// Action
	const reponse = await uploadData(db.getClient(), [{
		collection: 'users',
		index:      'users_keys',
		key:        'key',
		documents:  [{ key: timestamp, updated: true }],
	}]);

	// Tests
	expect(reponse).toEqual([[FaunaQueryResult.Updated]]);
	await expect(db.documentHasProperty('users_keys', timestamp, 'updated')).resolves.toBe(true);

}); // }}}
