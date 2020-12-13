import { Readable } from 'stream';
import { Response } from 'fetch-h2';

import { adminSecret } from './helpers/secret';
import { Database } from './helpers/database';
import { typeExists } from './helpers/graphql';

import { uploadSchema } from '../src/lib/schema';

const timestamp = '' + Date.now();

// Setup a new child database for the tests
let db: Database;
beforeAll(async () => { db = await Database.create(adminSecret, `fauna-upload-test-${timestamp}`); });
afterAll(() => db.destroy(adminSecret));

test("upload a new schema", async () => { // {{{

	// Action
	const result = await uploadSchema(db.getSecret(), Readable.from('type Query { allUsers: [User!] }, type User { name: String! }'), { override: false });

	// Tests
	expect(result).toBeInstanceOf(Response);
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);

	// Cleanup
	if (result instanceof Response) {
		await result.text();
	}

}); // }}}

test("update an existing schema", async () => { // {{{

	// Setup
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);

	// Action
	const result = await uploadSchema(db.getSecret(), Readable.from('type Query { allNewUsers: [NewUser!] }, type NewUser { name: String! }'), { override: false });

	// Tests
	expect(result).toBeInstanceOf(Response);
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);
	await expect(typeExists(db.getSecret(), 'NewUser')).resolves.toBe(true);

	// Cleanup
	if (result instanceof Response) {
		await result.text();
	}

}); // }}}
