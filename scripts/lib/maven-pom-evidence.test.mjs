import assert from "node:assert/strict";
import test from "node:test";
import { inspectPublicMavenPom } from "./maven-pom-evidence.mjs";

const expected = { group: "com.vireocode", module: "vireo-core", version: "0.3.1" };
const license = `<licenses>
  <license>
    <name>MIT</name>
    <url>https://github.com/vireocodedev/vireo/blob/main/LICENSE</url>
  </license>
</licenses>`;
const pom = ({
  group = expected.group,
  module = expected.module,
  version = expected.version,
  licenses = license,
  extra = "",
} = {}) =>
  `<project xmlns="http://maven.apache.org/POM/4.0.0">
  <modelVersion>4.0.0</modelVersion>
  <name>Vireo Core</name>
  <url>https://github.com/vireocodedev/vireo</url>
  ${extra}
  <groupId>${group}</groupId>
  <artifactId>${module}</artifactId>
  <version>${version}</version>
  ${licenses}
</project>`;

test("public Maven POM inspection accepts only direct expected Maven metadata and ignores nested decoys/comments", () => {
  const withDecoys = pom({
    extra: `<!-- ${pom({ group: "wrong.comment", module: "wrong-comment", version: "9.9.9" })} -->
      <name>MIT</name><url>https://github.com/vireocodedev/vireo/blob/main/LICENSE</url>
      <parent><groupId>wrong.parent</groupId><artifactId>wrong-parent</artifactId><version>1.0.0</version></parent>
      <dependencies><dependency><groupId>wrong.dependency</groupId><artifactId>wrong-dependency</artifactId><version>2.0.0</version></dependency></dependencies>
      <build><plugins><plugin><licenses><license><name>wrong</name><url>https://wrong.invalid</url></license></licenses></plugin></plugins></build>
      <project><groupId>wrong.nested-project</groupId><artifactId>wrong-project</artifactId><version>3.0.0</version></project>`,
  });
  assert.equal(inspectPublicMavenPom({ pom: withDecoys, ...expected }), true);
});

test("public Maven POM inspection permits XML whitespace in direct values", () => {
  assert.equal(
    inspectPublicMavenPom({
      pom: pom({
        group: `\n    ${expected.group}\n  `,
        module: `\n    ${expected.module}\n  `,
        version: `\n    ${expected.version}\n  `,
        licenses: `<licenses>
          <license>
            <name>\n              MIT\n            </name>
            <url>\n              https://github.com/vireocodedev/vireo/blob/main/LICENSE\n            </url>
          </license>
        </licenses>`,
      }),
      ...expected,
    }),
    true,
  );
});

test("public Maven POM inspection fails closed for malformed or non-exact XML", () => {
  const cases = [
    ["non-string", null],
    ["comment-only full fake", `<!-- ${pom()} -->`],
    ["wrong root namespace", pom().replace("http://maven.apache.org/POM/4.0.0", "https://wrong.invalid/POM")],
    ["wrong group", pom({ group: "com.example" })],
    ["wrong artifact", pom({ module: "vireo-auth" })],
    ["wrong version", pom({ version: "0.3.2" })],
    ["duplicate direct group", pom({ extra: `<groupId>${expected.group}</groupId>` })],
    ["duplicate direct artifact", pom({ extra: `<artifactId>${expected.module}</artifactId>` })],
    ["duplicate direct version", pom({ extra: `<version>${expected.version}</version>` })],
    ["duplicate licenses", pom({ licenses: `${license}${license}` })],
    [
      "duplicate license entry",
      pom({
        licenses: license.replace(
          "</license>",
          "</license><license><name>MIT</name><url>https://github.com/vireocodedev/vireo/blob/main/LICENSE</url></license>",
        ),
      }),
    ],
    ["duplicate license name", pom({ licenses: license.replace("</name>", "</name><name>MIT</name>") })],
    [
      "duplicate license URL",
      pom({
        licenses: license.replace("</url>", "</url><url>https://github.com/vireocodedev/vireo/blob/main/LICENSE</url>"),
      }),
    ],
    ["missing direct group", pom().replace(/\s*<groupId>[\s\S]*?<\/groupId>/u, "")],
    ["missing direct artifact", pom().replace(/\s*<artifactId>[\s\S]*?<\/artifactId>/u, "")],
    ["missing direct version", pom().replace(/\s*<version>[\s\S]*?<\/version>/u, "")],
    ["missing direct licenses", pom({ licenses: "" })],
    ["nested-only licenses", pom({ licenses: "", extra: `<build>${license}</build>` })],
    ["missing direct license", pom({ licenses: "<licenses></licenses>" })],
    ["missing license name", pom({ licenses: license.replace(/\s*<name>[\s\S]*?<\/name>/u, "") })],
    ["missing license URL", pom({ licenses: license.replace(/\s*<url>[\s\S]*?<\/url>/u, "") })],
    ["wrong MIT name", pom({ licenses: license.replace(">MIT<", ">MIT License<") })],
    ["wrong license URL", pom({ licenses: license.replace("LICENSE", "LICENCE") })],
    ["relevant attributes", pom({ licenses: license.replace("<name>", '<name lang="en">') })],
    ["relevant child markup", pom({ licenses: license.replace(">MIT<", "><value>MIT</value><") })],
    ["wrong namespace direct group", pom().replace("<groupId>", '<groupId xmlns="https://wrong.invalid">')],
    [
      "wrong namespace license name",
      pom({ licenses: license.replace("<name>", '<name xmlns="https://wrong.invalid">') }),
    ],
    ["named entity", pom({ licenses: license.replace(">MIT<", ">&vireo;<") })],
    ["predefined entity", pom({ licenses: license.replace(">MIT<", ">M&amp;IT<") })],
    ["decimal entity", pom({ licenses: license.replace(">MIT<", ">M&#73;T<") })],
    ["hex entity", pom({ licenses: license.replace(">MIT<", ">M&#x49;T<") })],
    ["coordinate CDATA", pom().replace(`>${expected.group}<`, `><![CDATA[${expected.group}]]><`)],
    ["license CDATA", pom({ licenses: license.replace(">MIT<", "><![CDATA[MIT]]><") })],
    ["external DTD", `<!DOCTYPE project SYSTEM "https://wrong.invalid/pom.dtd">${pom()}`],
    ["internal DTD", `<!DOCTYPE project [<!ENTITY vireo "MIT">]>${pom()}`],
    ["malformed XML", pom().replace("</licenses>", "")],
    ["over size limit", `${pom()}${" ".repeat(1024 * 1024)}`],
  ];
  for (const [name, candidate] of cases)
    assert.equal(inspectPublicMavenPom({ pom: candidate, ...expected }), false, name);
});
