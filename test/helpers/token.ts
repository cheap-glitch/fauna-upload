import dotenv from 'dotenv';

dotenv.config();

if (!process.env.FAUNA_ADMIN_TOKEN) {
	/*
	 * @TODO: update message
	console.error('Token for Fauna test database is missing');
	console.info('To test this module, please create a dummy Fauna database,\n'
	+ 'generate an  access key for it and add  the following line\n'
	+ 'to a .env file in the repo root:\n\n'
	+ 'FAUNA_ADMIN_TOKEN=<key>');
	 */

	process.exit(1);
}

export const adminToken = process.env.FAUNA_ADMIN_TOKEN;
