---
"@graphql-ts/schema": minor
---

Updated definitions of `NullableInputType` and `NullableOutputType` so that `InferValueFromInputType<NullableInputType>` and `InferValueFromOutputType<NullableOutputType>` return `unknown` instead of `any` along with other combinations like the non-nullable variants.
