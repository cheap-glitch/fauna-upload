import { Readable } from 'stream';
import { createFaunaClient } from '../src/utils/client';

import { adminSecret } from './helpers/secret';
import { Database } from './helpers/database';
import { typeExists } from './helpers/graphql';

import { uploadSchema } from '../src/lib/schema';

const timestamp = '' + Date.now();

// Create a new admin client for the test database
const client = createFaunaClient(adminSecret);

// Setup a new child database for the tests
let db: Database;
beforeAll(async () => { db = await Database.create(`fauna-upload-test-${timestamp}`, client); });
afterAll(() => db.destroy());

test("upload new GraphQL schema", async () => { // {{{

	// Setup

	// Action

	// Tests

}); // }}}
