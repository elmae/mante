import Link from "next/link";

const socialLinks = [
  { name: "Twitter", href: "https://twitter.com", icon: "X" },
  { name: "LinkedIn", href: "https://linkedin.com", icon: "in" },
  { name: "GitHub", href: "https://github.com", icon: "GH" },
];

const footerLinks = [
  { name: "Inicio", href: "/" },
  { name: "Servicios", href: "/services" },
  { name: "Sobre Nosotros", href: "/about" },
  { name: "Contacto", href: "/contact" },
];

export function Footer() {
  return (
    <footer className="border-t border-gray-100">
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 items-center">
          {/* Logo y Copyright */}
          <div className="text-center sm:text-left">
            <h3 className="font-playfair text-xl font-medium">CMMS</h3>
            <p className="mt-2 text-sm text-gray-500">© 2025 Sistema CMMS</p>
          </div>

          {/* Enlaces de navegación */}
          <nav className="flex flex-wrap justify-center gap-x-8 gap-y-4">
            {footerLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm text-gray-500 hover:text-gray-900 transition-soft"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Redes sociales */}
          <div className="flex justify-center sm:justify-end space-x-6">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 hover-lift"
                aria-label={social.name}
              >
                <span className="font-medium">{social.icon}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Enlaces legales */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-xs text-gray-500">
            <Link
              href="/privacy"
              className="hover:text-gray-900 transition-soft"
            >
              Política de Privacidad
            </Link>
            <Link href="/terms" className="hover:text-gray-900 transition-soft">
              Términos de Servicio
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
