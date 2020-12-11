import { Client as FaunaClient, query as q } from 'faunadb';

import { FaunaResource, FaunaResourceType, FaunaQueryResult } from '../types';

// @FIXME: replace `any` by fauna query response type
export async function uploadResources(client: FaunaClient, type: FaunaResourceType, resources: Array<FaunaResource>): Promise<any | undefined> {
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

	let reponse;
	try {
		reponse = await query;
	} catch(error) {
		console.error(error);

		return undefined;
	}

	return reponse;
}
