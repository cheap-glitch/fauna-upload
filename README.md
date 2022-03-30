# 🕊️ fauna-upload

[![License](https://shields.io/github/license/cheap-glitch/fauna-upload)](LICENSE)
[![Latest release](https://shields.io/github/v/release/cheap-glitch/fauna-upload?sort=semver&label=latest%20release&color=green)](https://github.com/cheap-glitch/fauna-upload/releases/latest)
[![Coverage status](https://shields.io/coveralls/github/cheap-glitch/fauna-upload)](https://coveralls.io/github/cheap-glitch/fauna-upload)

## Features

 * Easily upload documents, roles, indexes, user functions and GraphQL schemas
 * Update already existing data in place
 * Store your database in plain text: VCS-friendly, straightforward to edit, debug, backup and replicate
 * Enable [previews](https://docs.fauna.com/fauna/current/api/graphql/previews) or
   [override mode](https://docs.fauna.com/fauna/current/api/graphql/endpoints#modes) when uploading a GraphQL schema
 * TypeScript & JSON support

## Installation

```
npm i -g fauna-upload
```

### Setup

1. Create an access key with the "Server" role for your Fauna database

2. Copy the generated secret in a `.env` file at the root of your project
   (the name of the environment variable can be modified with the `--env` option):
   ```text
   FAUNADB_SECRET=<secret>
   ```

3. Test your setup by running `fauna-upload --check`. If it works, you're good to go!

## Usage

```
fauna-upload <OPTION>... [PATH]...
```

or if installed locally:

```
npx fauna-upload <OPTION>... [PATH]...
```

The CLI  takes paths to  various files and/or  folders, process them  and either
creates or  updates the  corresponding objects in  the targeted  database. Three
different kind of files are supported:

 * **GraphQL schemas**: these are simple plain text files adhering to
   [the GraphQL specification](https://graphql.org/learn/schema).

 * **JSON files**: these  define "document bundles",  i.e. arrays  of documents
   that will be uploaded in bulk to the database. A bundle is defined like this:
   ```json
   {
     "collection": "users",
     "index":      "users_by_name",
     "key":        "name",

     "documents": [
       { "name": "user1", "mail": "user1@mail.com" },
       { "name": "user2", "mail": "user2@mail.com" },
       { "name": "user2", "mail": "user2@mail.com" }
     ]
   }
   ```

Here's a basic example:

```
fauna-upload schema.graphql data.json functions.ts
```

You can also directly pass directories to process all the files inside:

```
fauna-upload api/functions ../database/documents
```

You can get the full list of available options with `fauna-upload --help`.

## API

`fauna-upload` can also be consumed as a  regular Node module. All the types are
exposed and accessible by importing them from the package's entry point.

### createFaunaClient(secret: string): FaunaClient

Returns a [client](https://fauna.github.io/faunadb-js/Client.html) to connect to
the Fauna database associated with the secret's key.

Example:

```javascript
const { createFaunaClient } = require('fauna-upload');

require('dotenv').config();
const secret = process.env.FAUNADB_SECRET;
const client = createFaunaClient(secret);
```

### uploadSchema(): Promise<>

### uploadResources(client: FaunaClient, type: string, resources: FaunaResource[]): Promise<UploadResponse>

Uploads an array of Fauna "resources" whose `type` can be `'role'`, `'index'` or
`'function'`.

Returns  either a  `FaunaHTTPError`  or an  nested array  of  strings, each  one
indicating the status of the resource (`'created'` or `'updated'`).

Example:

```javascript
const { query: q } = require('faunadb');
const { uploadResources } = require('fauna-upload');

uploadResources(client, 'function', [{
	name: 'greet',
	body: q.Query(q.Lambda(['name'], q.Concat(['Bonjour ', q.Var('name'), '!']))),
}]);

// [['created']]

uploadResources(client, 'index', [
	{
		name:   'people_sort_by_name_asc',
		source: q.Collection('People'),
		values: [{ field: ['data', 'name'] }, { field: ['ref'] }],
	},
	{
		name:   'people_sort_by_name_desc',
		source: q.Collection('People'),
		values: [{ field: ['data', 'name']}, { field: ['ref'] }],
	},
]);

// [['created', 'created']]

uploadResources(client, 'index', [{
	name:   'people_sort_by_name_desc',
	source: q.Collection('People'),
	values: [{ field: ['data', 'name'], reverse: true }, { field: ['ref'] }],
}]);

// [['updated']]
```

### uploadDocuments(client: FaunaClient, type: string, resources: FaunaResource[]): Promise<UploadResponse>

```javascript
const { Readable } = require('stream');
const { query: q } = require('faunadb');
const { uploadSchema } = require('fauna-upload');

require('dotenv').config();
const secret = process.env.FAUNADB_SECRET;
const client = createFaunaClient(secret);

uploadSchema(Readable.from('type Query { allUsers: [User!] }'), secret, { override: true });

uploadResources(client, 'function', [{
	name: 'greet',
	body: q.Query(q.Lambda(['name'], q.Concat(['Bonjour ', q.Var('name'), '!']))),
}]);
```

## Changelog

See the full changelog [here](https://github.com/cheap-glitch/fauna-upload/releases).

## Contributing

Contributions are welcomed! Please open an issue before submitting substantial changes.

## Acknowledgments

This project started as a rewrite of [fauna-gql-upload](https://github.com/Plazide/fauna-gql-upload) in TypeScript.

## Related

 * [`fauna-gql-upload`](https://github.com/Plazide/fauna-gql-upload) – Simple CLI for uploading a GraphQL schema, resolver functions, and more to a FaunaDB database
 * [`faunadb-graphql-schema-loader`](https://github.com/ptpaterson/faunadb-graphql-schema-loader) – Package for making GraphQL schemas easy to work with using FaunaDB
 * [`fauna-schema-migrate`](https://github.com/fauna-brecht/fauna-schema-migrate) – Set up Fauna resources as code

## License

ISC
