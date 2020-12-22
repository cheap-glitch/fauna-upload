import { values, Expr as FaunaExpression } from 'faunadb';

type FaunaQuery      = values.Query;
type FaunaReference  = values.Ref;
type FaunaActionName = 'create' | 'delete' | 'read' | 'write' | 'history_read' | 'history_write' | 'unrestricted_read' | 'call';

export enum FaunaResourceType {
	Role     = 'role',
	Index    = 'index',
	Function = 'function',
}

export type FaunaResource = FaunaRole | FaunaIndex | FaunaFunction;

export interface FaunaRole {
	name:         string
	privileges:   Array<FaunaPrivilege>
	memberships?: Array<FaunaMembership>
	data?:        Record<string, unknown>
}

interface FaunaPrivilege {
	resource:     FaunaReference
	actions:      Record<FaunaActionName, boolean | FaunaExpression>
}

interface FaunaMembership {
	resource:     FaunaReference
	predicate?:   FaunaQuery
}

export interface FaunaIndex {
	name:         string
	source:       FaunaReference | Array<FaunaSourceObject>
	terms?:       Array<FaunaTermObject>
	values?:      Array<FaunaValueObject>
	unique?:      boolean
	serialized?:  boolean
	permissions?: Record<string, unknown>
	data?:        Record<string, unknown>
}

interface FaunaSourceObject {
	collection:   FaunaReference | '_'
	fields:       Record<string, FaunaQuery>
}

interface FaunaTermObject {
	field:        Array<string>
	binding:      string
}

interface FaunaValueObject {
	field:        Array<string>
	binding:      string
	reverse?:     boolean
}

export interface FaunaFunction {
	name:         string
	body:         FaunaExpression
	role?:        string | FaunaReference
	data?:        Record<string, unknown>
}

export interface FaunaDataCollection {
	collection:   string
	index:        string
	key:          string
	documents:    Array<Record<string, unknown>>
}

export type FaunaUploadResults = Array<Array<FaunaQueryResult>>;

export enum FaunaQueryResult {
	Created = 'created',
	Updated = 'updated',
}
