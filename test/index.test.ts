import { Readable } from 'stream';
import { secret, wait, isTypeInSchema } from './helpers';

import { uploadSchema } from '../src/lib/schema';

const timestamp = Date.now();

// Wait a little bit between each test to avoid flooding the database service
afterEach(async () => await wait(500));

test("01. override GraphQL schema", async() => { // {{{

	const schema = Readable.from(`type MySuperAwesomeNewType_${timestamp} { field: Boolean }`);
	await expect(uploadSchema(schema, secret, true)).resolves.toBe(true);

	await wait(500);
	await expect(isTypeInSchema(`MySuperAwesomeNewType_${timestamp}`)).resolves.toBe(true);

}, 90*1000 + 500 + 2000); // }}}

test("02. update GraphQL schema", async () => { // {{{

	const schema = Readable.from(`type MySuperAwesomeNewType_${timestamp}_UPDATED { field: Boolean }`);
	await expect(uploadSchema(schema, secret, false)).resolves.toBe(true);

	await wait(500);
	await expect(isTypeInSchema(`MySuperAwesomeNewType_${timestamp}`)).resolves.toBe(true);
	await expect(isTypeInSchema(`MySuperAwesomeNewType_${timestamp}_UPDATED`)).resolves.toBe(true);

}, 500 + 2000); // }}}

// test("03. upload new data", () => { // {{{
// }); // }}}

// test("04. update existing data", () => { // {{{
// }); // }}}

// test("05. upload functions", () => { // {{{
// }); // }}}
