const { execSync } = require("child_process");
const { existsSync } = require("fs");
const path = require("path");

async function testFiles() {
  console.log("🔍 Verificando archivos críticos...");
  try {
    const requiredFiles = [
      "next.config.js",
      "package.json",
      "tsconfig.json",
      "src/app/layout.tsx",
      "src/middleware.ts",
    ];

    for (const file of requiredFiles) {
      const exists = existsSync(path.join(process.cwd(), file));
      if (!exists) {
        throw new Error(`Archivo no encontrado: ${file}`);
      }
    }
    console.log("✅ Archivos críticos verificados");
  } catch (error) {
    console.error("❌ Error verificando archivos:", error);
    throw error;
  }
}

async function testNextInstallation() {
  console.log("🔍 Verificando instalación de Next.js...");
  try {
    execSync("npm list next", { stdio: "inherit" });
    console.log("✅ Next.js instalado correctamente");
  } catch (error) {
    console.error("❌ Error verificando Next.js:", error);
    throw error;
  }
}

async function showTypeErrors() {
  console.log("\n📝 Errores de tipos a resolver:");
  try {
    execSync("npx tsc --noEmit", { stdio: "inherit" });
  } catch (error) {
    console.log(
      "\n⚠️ Se encontraron errores de tipos que deben resolverse antes de la actualización."
    );
    console.log("Sugerencias:");
    console.log("1. Actualizar tipos de dependencias (@types/*)");
    console.log("2. Revisar cambios en la API de Next.js 14.2.28");
    console.log("3. Actualizar tipos en componentes que usan Server Actions");
  }
}

async function runTests() {
  console.log("🚀 Iniciando verificación pre-actualización...\n");

  try {
    await testFiles();
    await testNextInstallation();
    await showTypeErrors();

    console.log("\n📋 Resumen de verificación:");
    console.log("- Archivos críticos: ✅");
    console.log("- Instalación Next.js: ✅");
    console.log("- Tipos TypeScript: Requieren actualización");
  } catch (error) {
    console.error("\n❌ Verificación fallida");
    process.exit(1);
  }
}

runTests();
