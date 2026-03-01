import esbuild from "esbuild";
import process from "process";
import builtins from "builtin-modules";

try {
  // Production build
  await esbuild.build({
    entryPoints: ["src/main.ts"],
    bundle: true,
    external: ["obsidian", "electron", "@codemirror/*", "@lezer/*", ...builtins],
    format: "cjs",
    target: "es2018",
    logLevel: "info",
    sourcemap: false,
    treeShaking: true,
    outfile: "main.js",
  });
  console.log("✅ Production build complete!");
  process.exit(0);
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
}
