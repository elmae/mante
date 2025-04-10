export function Features() {
  const features = [
    {
      icon: "🎫",
      title: "Ticketing Centralizado",
      description:
        "Sistema completo para creación, asignación y seguimiento de tickets",
    },
    {
      icon: "🏧",
      title: "Registro de Equipos",
      description:
        "Base de datos centralizada con historial completo de mantenimientos",
    },
    {
      icon: "⏱️",
      title: "Monitoreo de SLAs",
      description: "Seguimiento de tiempos de respuesta garantizados",
    },
  ];

  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Características Principales
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
            Herramientas especializadas para gestión eficiente de mantenimiento
          </p>
        </div>

        <div className="mt-16">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="relative bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <span className="text-4xl">{feature.icon}</span>
                  <h3 className="mt-4 text-xl font-medium text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-base text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
