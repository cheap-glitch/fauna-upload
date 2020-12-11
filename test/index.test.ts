import { Readable } from 'stream';
import { secret, /*client,*/ wait, isTypeInSchema } from './helpers';

// import { FaunaQueryResult } from '../src/types';
import { uploadSchema } from '../src/lib/schema';
// import { uploadData } from '../src/lib/data';
// import { uploadResources } from '../src/lib/resources';

const timestamp = Date.now();

// Wait a little bit between each test to avoid flooding the database service
beforeEach(() => wait(500));

test("01. override GraphQL schema", async() => { // {{{

	const schema = Readable.from(`type TestType${timestamp} { field: Boolean }`);
	await expect(uploadSchema(schema, secret, true)).resolves.toBe(true);

	await wait(500);
	await expect(isTypeInSchema(`TestType${timestamp}`)).resolves.toBe(true);
	await expect(isTypeInSchema(/^User/)).resolves.toBe(false);

}, 3000 + 90*1000 + 500); // }}}

test("02. update GraphQL schema", async () => { // {{{

	const schema = Readable.from(`type User${timestamp} { key: String! @unique(index: "user_keys") }`);
	await expect(uploadSchema(schema, secret, false)).resolves.toBe(true);

	await wait(500);
	await expect(isTypeInSchema(`User${timestamp}`)).resolves.toBe(true);
	await expect(isTypeInSchema(/^TestType/)).resolves.toBe(true);

}, 3000 + 500); // }}}

/*
test("03. upload new data", async () => { // {{{

	await expect(uploadData(client, [{
		collection: `User${timestamp}`,
		index:      'user_keys',
		key:        'key',
		documents:  [{ key: '' + timestamp }],
	}])).resolves.toBe(FaunaQueryResult.Created);

	// await wait(500);
	// await expect(getDocument(client, 'my_data', 'my_index', `document_${timestamp}`)).resolves.toBeTruthy;

}, 3000); // }}}
*/
