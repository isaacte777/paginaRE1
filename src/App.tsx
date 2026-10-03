import { useState } from "react";

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <a href="#" className="text-2xl font-bold text-indigo-600">
            MiSitio
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#inicio" className="text-gray-600 hover:text-indigo-600 transition">Inicio</a>
            <a href="#servicios" className="text-gray-600 hover:text-indigo-600 transition">Servicios</a>
            <a href="#nosotros" className="text-gray-600 hover:text-indigo-600 transition">Nosotros</a>
            <a href="#contacto" className="text-gray-600 hover:text-indigo-600 transition">Contacto</a>
            <a href="#contacto" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-700 transition">
              Empezar
            </a>
          </div>
          <button
            className="md:hidden text-gray-600 text-2xl"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
            <a href="#inicio" className="text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Inicio</a>
            <a href="#servicios" className="text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Servicios</a>
            <a href="#nosotros" className="text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Nosotros</a>
            <a href="#contacto" className="text-gray-600 hover:text-indigo-600" onClick={() => setMenuOpen(false)}>Contacto</a>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="inicio" className="pt-32 pb-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-block bg-indigo-50 text-indigo-600 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            ✨ Bienvenido a nuestra página
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
            Creamos experiencias
            <br />
            <span className="text-indigo-600">digitales increíbles</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-2xl mx-auto mb-10">
            Transformamos tus ideas en soluciones digitales modernas, rápidas y elegantes. 
            Tu próximo proyecto comienza aquí.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#servicios"
              className="bg-indigo-600 text-white px-8 py-3.5 rounded-full font-medium hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200 transition-all"
            >
              Ver Servicios
            </a>
            <a
              href="#contacto"
              className="border border-gray-300 text-gray-700 px-8 py-3.5 rounded-full font-medium hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              Contáctanos
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { number: "500+", label: "Proyectos" },
            { number: "120+", label: "Clientes" },
            { number: "8+", label: "Años" },
            { number: "99%", label: "Satisfacción" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-3xl md:text-4xl font-bold text-indigo-600">{stat.number}</div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section id="servicios" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Nuestros Servicios</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Ofrecemos soluciones completas para llevar tu negocio al siguiente nivel digital.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎨",
                title: "Diseño Web",
                desc: "Interfaces modernas y atractivas que cautivan a tus usuarios desde el primer momento.",
              },
              {
                icon: "⚡",
                title: "Desarrollo",
                desc: "Código limpio y optimizado para aplicaciones rápidas, seguras y escalables.",
              },
              {
                icon: "📱",
                title: "Apps Móviles",
                desc: "Aplicaciones nativas y multiplataforma que conectan con tus usuarios en cualquier lugar.",
              },
              {
                icon: "🚀",
                title: "SEO & Marketing",
                desc: "Estrategias digitales que aumentan tu visibilidad y atraen más clientes.",
              },
              {
                icon: "🛡️",
                title: "Seguridad",
                desc: "Protección avanzada para tus datos y sistemas con las mejores prácticas del sector.",
              },
              {
                icon: "💬",
                title: "Soporte 24/7",
                desc: "Estamos siempre disponibles para resolver tus dudas y mantener todo funcionando.",
              },
            ].map((service, i) => (
              <div
                key={i}
                className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl hover:shadow-indigo-50 hover:border-indigo-100 transition-all group"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition">
                  {service.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="nosotros" className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Sobre Nosotros
            </h2>
            <p className="text-gray-500 text-lg leading-relaxed mb-6">
              Somos un equipo apasionado de diseñadores y desarrolladores con más de 8 años de experiencia 
              creando productos digitales que hacen la diferencia.
            </p>
            <p className="text-gray-500 text-lg leading-relaxed mb-8">
              Creemos en la simplicidad, la calidad y la innovación. Cada proyecto es una oportunidad 
              para superar expectativas y entregar resultados excepcionales.
            </p>
            <div className="flex flex-col gap-4">
              {[
                "Equipo profesional y experimentado",
                "Tecnología de vanguardia",
                "Resultados medibles y garantizados",
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-bold">
                    ✓
                  </span>
                  <span className="text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl p-12 flex items-center justify-center">
            <div className="text-center">
              <div className="text-7xl mb-4">🏢</div>
              <p className="text-indigo-700 font-medium text-lg">Innovación & Creatividad</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Lo que dicen nuestros clientes</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              La satisfacción de nuestros clientes es nuestra mejor carta de presentación.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "María García",
                role: "CEO, TechStart",
                text: "Increíble trabajo. Superaron todas nuestras expectativas y entregaron un producto excepcional.",
              },
              {
                name: "Carlos López",
                role: "Director, InnovaLab",
                text: "Profesionales de primera. El equipo entendió nuestra visión desde el primer día.",
              },
              {
                name: "Ana Martínez",
                role: "Fundadora, DigitalPro",
                text: "El mejor equipo con el que hemos trabajado. Recomendados al 100%.",
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white border border-gray-100 rounded-2xl p-8">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <span key={j} className="text-yellow-400">★</span>
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA / Contact */}
      <section id="contacto" className="py-20 px-6">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-indigo-100 text-lg mb-8 max-w-xl mx-auto">
            Cuéntanos sobre tu proyecto y te ayudaremos a hacerlo realidad. Sin compromisos.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Tu correo electrónico"
              className="flex-1 px-5 py-3.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
            <button
              type="submit"
              className="bg-white text-indigo-600 px-8 py-3.5 rounded-full font-semibold hover:bg-indigo-50 transition"
            >
              Enviar
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-bold text-white mb-4">MiSitio</h3>
              <p className="leading-relaxed">
                Creamos experiencias digitales que transforman negocios y conectan con personas.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Enlaces</h4>
              <ul className="space-y-2">
                <li><a href="#inicio" className="hover:text-white transition">Inicio</a></li>
                <li><a href="#servicios" className="hover:text-white transition">Servicios</a></li>
                <li><a href="#nosotros" className="hover:text-white transition">Nosotros</a></li>
                <li><a href="#contacto" className="hover:text-white transition">Contacto</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Servicios</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition">Diseño Web</a></li>
                <li><a href="#" className="hover:text-white transition">Desarrollo</a></li>
                <li><a href="#" className="hover:text-white transition">Apps Móviles</a></li>
                <li><a href="#" className="hover:text-white transition">Marketing Digital</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li>📧 info@misitio.com</li>
                <li>📞 +34 600 123 456</li>
                <li>📍 Madrid, España</li>
              </ul>
              <div className="flex gap-4 mt-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition">
                  <span className="text-sm">f</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition">
                  <span className="text-sm">𝕏</span>
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition">
                  <span className="text-sm">in</span>
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© 2026 MiSitio. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
