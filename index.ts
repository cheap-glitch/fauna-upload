/*!
 * fauna-upload
 *
 * Upload resources and data to FaunaDB with ease.
 *
 * Copyright (c) 2020-present, cheap glitch
 * This software is distributed under the ISC license
 */

import { getFaunaClient } from './src/utils/client';
import { uploadSchema } from './src/lib/schema';
import { uploadResources } from './src/lib/resources';

console.info(getFaunaClient);
console.info(uploadSchema);
console.info(uploadResources);
