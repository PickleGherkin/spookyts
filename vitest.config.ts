import { defineConfig } from "vitest/config"

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        fileParallelism: false,
        coverage: {
            include: [
                "src/**.ts"
            ],
            exclude: [
                "src/spookyts.ts"
            ]
        },
        testTimeout: 10000
    }
})