import { foo } from "./components/foo.js"; // <- imports are not validated before runtime. so tsc will just compile them as is.

foo("Foo");