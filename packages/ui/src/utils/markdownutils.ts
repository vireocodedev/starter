export const MdBadge = {
  STABLE: "![STABLE](https://img.shields.io/badge/STABLE-green?style=flat-square)",
  WIP: "![WIP](https://img.shields.io/badge/WIP-yellow?style=flat-square)",
} as const satisfies Record<string, string>;
