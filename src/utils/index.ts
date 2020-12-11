// import { errors } from 'faunadb/src/types/errors';

/*
export function prettifyFaunaError(error: errors.FaunaHTTPError): string {
	if (error.requestResult && error.requestResult.requestRaw) {
		error.requestResult.requestRaw = JSON.parse(error.requestResult.requestRaw);
	}
	if (error.requestResult && error.requestResult.responseRaw) {
		error.requestResult.responseRaw = JSON.parse(error.requestResult.responseRaw);
	}

	return JSON.stringify(error, null, 2);
}
*/

export async function wait(delay: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, delay));
}
