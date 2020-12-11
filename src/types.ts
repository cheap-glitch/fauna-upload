export interface FaunaResource {
	name: string
}

export enum FaunaResourceType {
	Data,
	Role,
	Index,
	Function,
}

export interface FaunaDataCollection {
	collection: string
	index:      string
	key:        string
	documents:  Array<Record<string, any>>
}

export enum FaunaQueryResult {
	Created = 'created',
	Updated = 'updated',
}
