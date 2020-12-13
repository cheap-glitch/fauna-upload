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

// Prolong the test timeout
jest.setTimeout(20*1000);

test("upload new GraphQL schema", async () => { // {{{

	// Action
	const result = await uploadSchema(db.getSecret(), Readable.from('type Query { allUsers: [User!] }, type User { name: String! }'), { override: false });

	// Tests
	expect(result).toBeInstanceOf(Response);
	await expect(typeExists(db.getSecret(), 'User')).resolves.toBe(true);

}); // }}}
