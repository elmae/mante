export function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Autenticación",
      description:
        "Registro de usuarios técnicos/administradores y login seguro con JWT",
    },
    {
      number: "02",
      title: "Configuración Inicial",
      description:
        "Registro de flota de ATMs y definición de SLAs y zonas geográficas",
    },
    {
      number: "03",
      title: "Operación Diaria",
      description: "Creación y gestión de tickets, asignación a técnicos",
    },
    {
      number: "04",
      title: "Monitoreo",
      description: "Dashboard de métricas y reportes de cumplimiento",
    },
  ];

  return (
    <section id="how-it-works" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            ¿Cómo Funciona?
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Proceso simple y eficiente para gestión de mantenimiento
          </p>
        </div>

        <div className="mt-16">
          <div className="space-y-12">
            {steps.map((step) => (
              <div key={step.number} className="relative">
                <div className="flex items-start">
                  <span className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 text-blue-600 text-xl font-bold">
                    {step.number}
                  </span>
                  <div className="ml-4">
                    <h3 className="text-xl font-medium text-gray-900">
                      {step.title}
                    </h3>
                    <p className="mt-2 text-base text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
