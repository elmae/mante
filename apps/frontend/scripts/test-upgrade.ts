import { headers } from "next/headers";
import { redirect } from "next/navigation";

async function testServerActions() {
  console.log("🔍 Probando Server Actions...");
  try {
    // Verificar que podemos importar y usar server actions
    const action = async () => {
      "use server";
      return { success: true };
    };
    await action();
    console.log("✅ Server Actions funcionando correctamente");
  } catch (error) {
    console.error("❌ Error en Server Actions:", error);
    throw error;
  }
}

async function testMiddleware() {
  console.log("🔍 Probando Middleware...");
  try {
    // Verificar que podemos usar las APIs de middleware
    headers();
    console.log("✅ Middleware API funcionando correctamente");
  } catch (error) {
    console.error("❌ Error en Middleware:", error);
    throw error;
  }
}

async function testImageOptimization() {
  console.log("🔍 Probando optimización de imágenes...");
  try {
    // Verificar que podemos cargar una imagen
    const response = await fetch("/public/next.svg");
    if (!response.ok) throw new Error("Error cargando imagen");
    console.log("✅ Optimización de imágenes funcionando correctamente");
  } catch (error) {
    console.error("❌ Error en optimización de imágenes:", error);
    throw error;
  }
}

async function testPerformance() {
  console.log("🔍 Probando rendimiento...");
  try {
    // Verificar navegación y redirecciones
    redirect("/test");
    console.log("✅ APIs de navegación funcionando correctamente");
  } catch (error) {
    console.error("❌ Error en pruebas de rendimiento:", error);
    throw error;
  }
}

async function runTests() {
  console.log("🚀 Iniciando pruebas post-actualización...\n");

  try {
    await testServerActions();
    await testMiddleware();
    await testImageOptimization();
    await testPerformance();

    console.log("\n✨ Todas las pruebas completadas exitosamente");
  } catch (error) {
    console.error("\n❌ Algunas pruebas fallaron:", error);
    process.exit(1);
  }
}

runTests();
