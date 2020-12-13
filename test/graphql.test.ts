import { Readable } from 'stream';
import { createFaunaClient } from '../src/utils/client';

import { adminToken } from './helpers/token';
import { Database } from './helpers/database';
import { typeExists } from './helpers/graphql';

import { uploadSchema } from '../src/lib/schema';

const timestamp = '' + Date.now();

// Create a new admin client for the test database
const client = createFaunaClient(adminToken);

// Setup a new child database for the tests
let db: Database;
beforeAll(async () => { db = await Database.create(`fauna-upload-test-${timestamp}`, client); });
afterAll(() => db.destroy());

test("upload new GraphQL schema", async () => { // {{{

	// Setup

	// Action

	// Tests

}); // }}}
