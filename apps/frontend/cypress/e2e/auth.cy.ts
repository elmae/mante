describe("Autenticación", () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada test
    cy.clearLocalStorage();
    cy.visit("/login");
  });

  it("debería manejar el flujo de login correctamente", () => {
    // Credenciales de prueba
    const testEmail = "dmiles@grupoefrain.com";
    const testPassword = "DMdr@#2008";

    // Mock de respuesta exitosa
    cy.intercept("POST", "/api/v1/auth/login", {
      statusCode: 200,
      body: {
        data: {
          token: "test-token-123",
          user: {
            id: 1,
            email: testEmail,
            name: "Test User",
          },
        },
      },
      delay: 100, // Pequeño delay para simular latencia de red
    }).as("loginSuccess");

    // Llenar formulario
    cy.get('input[type="email"]').type(testEmail);
    cy.get('input[type="password"]').type(testPassword);
    cy.get('button[type="submit"]').click();

    // Esperar y verificar respuesta del API
    cy.wait("@loginSuccess").as("loginResponse");

    // Verificar el método HTTP
    cy.get("@loginResponse")
      .should("have.property", "request")
      .and("have.property", "method", "POST");

    // Verificar el cuerpo de la petición
    cy.get("@loginResponse")
      .should("have.property", "request")
      .and("have.property", "body")
      .and("deep.equal", {
        email: testEmail,
        password: testPassword,
      });

    // Verificar que la URL no contiene la contraseña
    cy.get("@loginResponse")
      .should("have.property", "request")
      .and("have.property", "url")
      .and("not.include", testPassword);

    // Esperar redirección y verificar URL
    cy.url().should("include", "/dashboard");

    // Verificar almacenamiento en localStorage después de la redirección
    cy.getLocalStorageToken().should("eq", "test-token-123");
  });

  it("debería manejar errores de login", () => {
    // Mock de respuesta con error
    cy.intercept("POST", "/api/v1/auth/login", {
      statusCode: 401,
      body: {
        error: {
          message: "Credenciales inválidas",
        },
      },
      delay: 100,
    }).as("loginError");

    // Intentar login con credenciales inválidas
    cy.get('input[type="email"]').type("invalid@example.com");
    cy.get('input[type="password"]').type("wrongpassword");
    cy.get('button[type="submit"]').click();

    // Esperar respuesta del API
    cy.wait("@loginError");

    // Verificar mensaje de error
    cy.contains("Credenciales inválidas").should("be.visible");

    // Verificar que permanecemos en la página de login
    cy.url().should("include", "/login");

    // Verificar que no hay token en localStorage
    cy.getLocalStorageToken().should("be.null");
  });
});
