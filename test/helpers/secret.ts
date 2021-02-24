import dotenv from 'dotenv';

dotenv.config();

/* istanbul ignore next */
if (!process.env.FAUNA_ROOT_KEY) {
	console.error('Secret for Fauna test database is missing');
	console.info('To test this module, please create a dummy Fauna database,\n'
	           + 'generate an admin key for it and add the following line to\n'
	           + 'a .env file in the repo root:\n\n'
	           + 'FAUNA_ROOT_KEY=<secret>');

	process.exit(1);
}

export const adminSecret = process.env.FAUNA_ROOT_KEY;
