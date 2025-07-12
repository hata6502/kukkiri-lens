import * as esbuild from "esbuild";

await Promise.all(
  [
    { entryPoints: ["src/index.tsx"], outfile: "public/index.js" },
    {
      entryPoints: ["src/service-worker.ts"],
      outfile: "public/service-worker.js",
    },
  ].map((options) =>
    esbuild.build({
      ...options,
      bundle: true,
      define: {
        "process.env.TIMESTAMP": JSON.stringify(String(Date.now())),
      },
      format: "esm",
      minify: true,
    }),
  ),
);
