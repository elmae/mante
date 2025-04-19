import { AtmListContainer } from "@/components/atms/AtmListContainer";
import { AtmMetrics } from "@/components/atms/AtmMetrics";

export default function AtmsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Panel de ATMs</h1>
        <a
          href="/dashboard/atms/new"
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Nuevo ATM
        </a>
      </div>

      <div className="space-y-8">
        <section aria-labelledby="metrics-title">
          <h2 id="metrics-title" className="sr-only">
            Métricas de ATMs
          </h2>
          <AtmMetrics />
        </section>

        <section aria-labelledby="atm-list-title">
          <h2
            id="atm-list-title"
            className="text-xl font-semibold text-gray-900 mb-4"
          >
            Lista de ATMs
          </h2>
          <AtmListContainer />
        </section>
      </div>
    </div>
  );
}
