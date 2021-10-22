---
"@graphql-ts/extend": minor
"@graphql-ts/schema": minor
---

Type parameters named `RootVal` have been renamed to `Source` and properties named `__rootVal` have been renamed to `__source`. This won't require code changes unless you've relied on the `__rootVal` properties(which you shouldn't).
