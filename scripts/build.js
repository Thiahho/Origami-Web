const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
let esbuild = null;

try {
  // eslint-disable-next-line import/no-extraneous-dependencies
  esbuild = require("esbuild");
} catch (err) {
  console.warn("⚠️ esbuild no está disponible. Se usará el bundler básico.");
}

const projectRoot = path.resolve(__dirname, "..");
const entryFile = path.join(projectRoot, "js", "index.js");
const distDir = path.join(projectRoot, "dist");
const assetsDir = path.join(distDir, "assets");

const htmlTargets = [
  path.join(projectRoot, "Home.html"),
  path.join(projectRoot, "Tienda.html"),
  path.join(projectRoot, "DetalleProducto.html"),
  path.join(projectRoot, "Nosotros", "nosotros.html"),
];

const isWatch = process.argv.includes("--watch");
const fallbackEntries = [
  "config.js",
  "navbar-auth.js",
  "navbar-loader.js",
  "footer-loader.js",
  "store-integration.js",
  "home-products.js",
  "tienda-filters.js",
  "detalleproducto.js",
  "cart.js",
  "navbar.js",
  "publi-loader.js",
  "emailjs-config.js",
];

function cleanDist() {
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(assetsDir, { recursive: true });
}

function getBundleFileName(metafile) {
  const jsOutput = Object.keys(metafile.outputs).find((file) =>
    file.endsWith(".js")
  );

  if (!jsOutput) {
    throw new Error("No se pudo encontrar el bundle generado");
  }

  return path.basename(jsOutput);
}

function writeManifest(bundleFileName) {
  const manifest = {
    bundle: `/dist/assets/${bundleFileName}`,
  };
  fs.writeFileSync(
    path.join(distDir, "manifest.json"),
    JSON.stringify(manifest, null, 2)
  );
}

function stripOldScripts(html, bundleTag) {
  const scriptRegex =
    /<script[^>]*\s+src="(?:\.?\.\/|\/)?js\/[^">]+"[^>]*><\/script>\s*/gi;
  let updated = html.replace(scriptRegex, "");
  updated = updated.replace(/\n{3,}/g, "\n\n");

  if (!updated.includes(bundleTag)) {
    if (updated.includes("</body>")) {
      updated = updated.replace("</body>", `  ${bundleTag}\n</body>`);
    } else {
      updated += `\n${bundleTag}\n`;
    }
  }

  return updated;
}

function updateHtmlReferences(bundleFileName) {
  const bundleTag = `<script src="/dist/assets/${bundleFileName}" defer></script>`;

  htmlTargets.forEach((htmlPath) => {
    if (!fs.existsSync(htmlPath)) return;
    const html = fs.readFileSync(htmlPath, "utf8");
    const nextHtml = stripOldScripts(html, bundleTag);
    fs.writeFileSync(htmlPath, nextHtml);
  });
}

async function buildOnce(extraOptions = {}) {
  if (!esbuild) {
    bundleWithFallback();
    return;
  }

  const buildOptions = {
    entryPoints: [entryFile],
    bundle: true,
    minify: true,
    sourcemap: false,
    target: ["es2017"],
    format: "iife",
    outdir: assetsDir,
    entryNames: "bundle-[hash]",
    metafile: true,
    logLevel: "info",
    ...extraOptions,
  };

  const result = await esbuild.build(buildOptions);
  const bundleFileName = getBundleFileName(result.metafile);
  updateHtmlReferences(bundleFileName);
  writeManifest(bundleFileName);
  console.log(`✅ Bundle generado: ${bundleFileName}`);
}

async function run() {
  cleanDist();

  if (isWatch) {
    if (!esbuild) {
      bundleWithFallback();
      console.warn("👀 Modo watch no disponible sin esbuild.");
    } else {
      await buildOnce({
        watch: {
          onRebuild(error, result) {
            if (error) {
              console.error("⚠️ Rebuild falló", error);
              return;
            }
            if (result?.metafile) {
              const bundleFileName = getBundleFileName(result.metafile);
              updateHtmlReferences(bundleFileName);
              writeManifest(bundleFileName);
              console.log(`♻️ Rebuild: ${bundleFileName}`);
            }
          },
        },
      });
      console.log("👀 Esperando cambios...");
    }
  } else {
    await buildOnce();
  }
}

function bundleWithFallback() {
  const contents = fallbackEntries
    .map((file) =>
      fs.readFileSync(path.join(projectRoot, "js", file), "utf8")
    )
    .join("\n;");

  const minified = contents
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{2,}/g, "\n");

  const hash = crypto.createHash("md5").update(minified).digest("hex").slice(0, 8);
  const bundleFileName = `bundle-${hash}.js`;
  fs.writeFileSync(path.join(assetsDir, bundleFileName), minified);
  updateHtmlReferences(bundleFileName);
  writeManifest(bundleFileName);
  console.log(`✅ Bundle generado (fallback): ${bundleFileName}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
