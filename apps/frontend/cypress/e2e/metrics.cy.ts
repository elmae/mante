/// <reference types="cypress" />
describe("Metrics Page", () => {
  beforeEach(() => {
    // Interceptar las llamadas a la API
    cy.intercept("GET", "/api/v1/metrics/full*", {
      fixture: "metrics/fullMetrics.json",
    }).as("getFullMetrics");

    cy.intercept("GET", "/api/v1/metrics/historical*", {
      fixture: "metrics/historicalMetrics.json",
    }).as("getHistoricalMetrics");

    // Mock del estado de autenticación
    cy.window().then((win: Window) => {
      win.localStorage.setItem("token", "mock-jwt-token");
    });

    // Visitar la página de métricas
    cy.visit("/metrics");
  });

  it("should load and display metrics page correctly", () => {
    // Verificar que la página carga correctamente
    cy.get("h1").should("contain", "Métricas del Sistema");

    // Esperar a que se carguen los datos
    cy.wait(["@getFullMetrics", "@getHistoricalMetrics"]);

    // Verificar secciones principales
    cy.get("h2").should("contain", "Métricas de Tiempo");
    cy.get("h2").should("contain", "Estado de Tickets");
    cy.get("h2").should("contain", "Tendencias Históricas");
  });

  it("should handle period selection", () => {
    // Probar selección de diferentes períodos
    const periods = ["7 días", "30 días", "90 días"];

    periods.forEach((period: string) => {
      cy.contains("button", period).click();
      cy.wait("@getFullMetrics")
        .its("request.url")
        .should("include", "startDate");
      cy.wait("@getHistoricalMetrics");
    });
  });

  it("should display metrics data correctly", () => {
    cy.wait(["@getFullMetrics", "@getHistoricalMetrics"]);

    // Verificar métricas de tiempo
    cy.contains("Tiempo Promedio de Respuesta").parent().should("contain", "h");

    cy.contains("Tiempo Promedio de Resolución")
      .parent()
      .should("contain", "h");

    cy.contains("Tasa de Cumplimiento SLA").parent().should("contain", "%");

    // Verificar métricas de tickets
    cy.contains("Total").parent().find("p").should("not.contain", "N/A");
    cy.contains("Abiertos").parent().find("p").should("not.contain", "N/A");
    cy.contains("En Progreso").parent().find("p").should("not.contain", "N/A");
    cy.contains("Cerrados").parent().find("p").should("not.contain", "N/A");
  });

  it("should render historical chart", () => {
    cy.wait(["@getFullMetrics", "@getHistoricalMetrics"]);

    // Verificar que el gráfico existe
    cy.get(".recharts-responsive-container").should("exist");

    // Verificar leyendas del gráfico
    cy.contains("Tiempo de Respuesta (min)").should("exist");
    cy.contains("Tiempo de Resolución (min)").should("exist");
    cy.contains("Cumplimiento SLA (%)").should("exist");
  });

  it("should handle unauthorized access", () => {
    // Simular usuario no autorizado
    cy.window().then((win: Window) => {
      win.localStorage.removeItem("token");
    });

    cy.visit("/metrics");

    // Debería redirigir a login
    cy.url().should("include", "/login");
  });

  it("should handle loading state", () => {
    // Retrasar las respuestas de la API
    cy.intercept("GET", "/api/v1/metrics/full*", (req: InterceptRequest) => {
      req.reply({
        delay: 1000,
        fixture: "metrics/fullMetrics.json",
      });
    }).as("getSlowFullMetrics");

    cy.visit("/metrics");

    // Verificar estado de carga
    cy.contains("Cargando métricas...").should("be.visible");
    cy.wait("@getSlowFullMetrics");
    cy.contains("Cargando métricas...").should("not.exist");
  });

  it("should handle error states", () => {
    // Simular error en la API
    cy.intercept("GET", "/api/v1/metrics/full*", {
      statusCode: 500,
      body: { error: "Error interno del servidor" },
    }).as("getMetricsError");

    cy.visit("/metrics");

    // Verificar mensaje de error
    cy.contains("Error:").should("be.visible");
  });
});
