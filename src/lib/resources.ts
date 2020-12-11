import { Client as FaunaClient, query as q } from 'faunadb';
import FaunaResponse from 'faunadb/src/types/RequestResult';

import { FaunaResource, FaunaResourceType, FaunaQueryResult } from '../types';

export async function uploadResources(client: FaunaClient, type: FaunaResourceType, resources: Array<FaunaResource>): Promise<FaunaResponse | undefined> {
	const [INDEX, CREATE] = (() => {
		switch (type) {
			case FaunaResourceType.Role:     return [q.Role,     q.CreateRole    ];
			case FaunaResourceType.Index:    return [q.Index,    q.CreateIndex   ];
			case FaunaResourceType.Function: return [q.Function, q.CreateFunction];
			default: throw TypeError(`Unknown resource type '${type}'`);
		}
	})();

	const query = client.query(q.Foreach(resources, q.Lambda('resource', q.Let(
		{
			name: q.Select(['name'], q.Var('resource')),
		},
		q.If(q.Exists(INDEX(q.Var('name'))),
			q.Do(
				q.Update(INDEX(q.Var('name')), q.Var('resource')),
				FaunaQueryResult.Updated
			),
			q.Do(
				CREATE(q.Var('resource')),
				FaunaQueryResult.Created
			)
		)
	))));

	let reponse: FaunaResponse;
	try {
		reponse = (await query) as FaunaResponse;
	} catch(error) {
		console.error(error);

		return undefined;
	}

	return reponse;
}
