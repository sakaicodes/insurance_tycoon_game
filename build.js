#!/usr/bin/env node
/*
  Fine Print Syndicate build script.
  Bundles every file listed in src/manifest.json into one self-contained HTML file.
  Usage:
    node build.js            build dist/fine-print-syndicate.html
    node build.js --check    build, then check the bundled script parses
*/
const fs = require("fs"), path = require("path");
const root = __dirname, src = path.join(root, "src");
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const manifest = JSON.parse(fs.readFileSync(path.join(src, "manifest.json"), "utf8"));
const read = f => fs.readFileSync(path.join(src, f), "utf8");

const styles = manifest.styles.map(read).join("\n");
const scripts = manifest.scripts.map(f => read(f).trimEnd()).join("\n\n");
const stamp = s => s.replace(/__VERSION__/g, pkg.version).replace(/__BUILD_DATE__/g, new Date().toISOString().slice(0, 10));

let html = read("index.html")
  .replace("<!-- @styles -->", () => styles)
  .replace("<!-- @scripts -->", () => scripts);
html = stamp(html);

fs.mkdirSync(path.join(root, "dist"), {recursive:true});
const out = path.join(root, "dist", "fine-print-syndicate.html");
fs.writeFileSync(out, html);
console.log(`Built v${pkg.version}: ${path.relative(root, out)} (${(html.length/1024).toFixed(0)} KB, ${manifest.scripts.length} scripts, ${manifest.styles.length} stylesheets)`);

if (process.argv.includes("--check")){
  const body = html.split("<script>\n(() => {")[1].split("})();\n</script>")[0];
  try { new Function(body); console.log("Script check: OK"); }
  catch (e){ console.error("Script check FAILED:", e.message); process.exit(1); }
}
