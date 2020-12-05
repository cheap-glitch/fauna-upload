/*!
 * fauna-upload
 *
 * Upload resources and data to FaunaDB with ease.
 *
 * Copyright (c) 2020-present, cheap glitch
 * This software is distributed under the ISC license
 */

import { getFaunaClient } from './utils/client';
import { uploadSchema } from './lib/schema';
import { uploadResources } from './lib/resources';

console.info(getFaunaClient);
console.info(uploadSchema);
console.info(uploadResources);
