import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import { verifyCanonicalMitLicense } from "./mit-license-evidence.mjs";

const mit = `MIT License

Copyright (c) 2026 Vireo Code

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

test("canonical MIT content is byte-hashed evidence", () => {
  assert.deepEqual(verifyCanonicalMitLicense(mit), {
    licenseContentVerified: true,
    licenseSha256: createHash("sha256").update(mit).digest("hex"),
  });
});

for (const [name, content] of [
  ["empty", ""],
  ["arbitrary", "Vireo public package license"],
  ["only MIT", "MIT"],
]) {
  test(`${name} content is not accepted as MIT evidence`, () => {
    assert.throws(() => verifyCanonicalMitLicense(content), /not canonical MIT/u);
  });
}
