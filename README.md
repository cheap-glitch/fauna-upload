# 🕊️ fauna-upload

![License](https://badgen.net/github/license/cheap-glitch/fauna-upload?color=green)
![Latest release](https://badgen.net/github/release/cheap-glitch/fauna-upload?color=green)
[![Coverage status](https://coveralls.io/repos/github/cheap-glitch/fauna-upload/badge.svg?branch=main)](https://coveralls.io/github/cheap-glitch/fauna-upload?branch=main)

```javascript
const { Readable }     = require('stream');
const { uploadSchema } = require('fauna-upload');

require('dotenv').config();
uploadSchema(Readable.from('type Query { allUsers: [User!] }'), process.env.FAUNA_SECRET, { override: true });
```

## License
```text
Copyright (c) 2020-present, cheap glitch

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby  granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE  IS PROVIDED "AS IS"  AND THE AUTHOR DISCLAIMS  ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING  ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS.  IN NO  EVENT  SHALL THE  AUTHOR  BE LIABLE  FOR  ANY SPECIAL,  DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR  PROFITS, WHETHER IN AN ACTION OF  CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN  CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.
```