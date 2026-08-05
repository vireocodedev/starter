---
"@vireocodedev/starter-ui": major
---

Move `RgoVideoStreamPlayer` out of the root barrel and onto its own
`@vireocodedev/starter-ui/video` entry point.

**Breaking change**

- `RgoVideoStreamPlayer` and `RgoVideoStreamPlayerProps` are no longer exported
  from `@vireocodedev/starter-ui`. Import them from
  `@vireocodedev/starter-ui/video`. Nothing about the component changed.

**Why**

`ovenplayer` is by a wide margin the heaviest dependency in this package, and
until now every consumer of the root barrel pulled it into the module graph
whether or not it rendered a stream. A bundler cannot reliably drop it either:
the component imports its own stylesheet, and `ovenplayer` itself is not
side-effect free, so removing it requires the consumer to declare the package's
JavaScript side-effect free by hand.

Behind a subpath the cost is structural rather than configuration-dependent — a
consumer that never imports `./video` never resolves `ovenplayer` at all.

`RgoClientTable`, the other component with no consumer today, stays in the root
barrel. It carries no comparable transitive dependency, so moving it would trade
a real import path for no saving.
