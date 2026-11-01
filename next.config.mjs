import path from "node:path";
export default { outputFileTracingRoot: path.resolve("."), poweredByHeader: false, eslint: { ignoreDuringBuilds: true } }; // lint runs as its own CI step
