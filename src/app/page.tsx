import Link from "next/link";
import { WaitlistForm } from "@/components/landing/WaitlistForm";

export default function Home() {
  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <a className="nav-logo" href="#top">
          <div className="nav-shield">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 2L16 5.5V11Q16 16 10 17.5Q4 16 4 11V5.5Z" />
            </svg>
          </div>
          <span className="nav-brand">SegurosPro</span>
        </a>
        <div className="nav-links">
          <a href="#funcionalidades">Funcionalidades</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="nav-actions">
          <Link href="/login" className="btn-ghost">
            Ingresar
          </Link>
          <Link href="/register" className="btn-primary">
            Empezar gratis
          </Link>
        </div>
      </nav>

      <header className="hero" id="top">
        <div className="hero-badge">
          <div className="hero-badge-dot" />
          Hecho para el mercado asegurador argentino
        </div>
        <h1>
          Tu cartera de seguros,
          <br />
          sin el <em>caos del Excel</em>
        </h1>
        <p className="hero-sub">
          Vencimientos automáticos, expedientes digitales y dashboard en tiempo real. Todo lo que necesitás
          para gestionar tu producción como un profesional.
        </p>
        <div className="hero-ctas">
          <Link href="/register" className="btn-primary btn-large">
            Empezar gratis →
          </Link>
        </div>
        <p className="hero-note">
          <span>Sin tarjeta de crédito</span> · <span>Configuración en minutos</span> · <span>Cancelás cuando querés</span>
        </p>
      </header>

      <section className="trust-strip" aria-label="Aseguradoras">
        <p>Trabaja con las principales aseguradoras del mercado</p>
        <div className="trust-logos">
          <span className="trust-logo">ZURICH</span>
          <span className="trust-logo">SANCOR SEGUROS</span>
          <span className="trust-logo">MERCANTIL ANDINA</span>
          <span className="trust-logo">GALICIA SEGUROS</span>
          <span className="trust-logo">LA SEGUNDA</span>
          <span className="trust-logo">FEDERACIÓN PATRONAL</span>
        </div>
      </section>

      <section className="preview-wrap" style={{ paddingTop: 60 }}>
        <div className="preview-frame">
          <div className="preview-bar">
            <div className="p-dot" style={{ background: "#f87171" }} />
            <div className="p-dot" style={{ background: "#fbbf24" }} />
            <div className="p-dot" style={{ background: "#4ade80" }} />
            <div className="p-url">
              <span>app.seguros-pro.com.ar/dashboard</span>
            </div>
          </div>
          <div className="preview-body">
            <div className="p-sidebar">
              <div className="p-nav active">
                <div className="p-nav-ico" style={{ background: "var(--blue)" }} />Dashboard
              </div>
              <div className="p-nav">
                <div className="p-nav-ico" />Clientes
              </div>
              <div className="p-nav">
                <div className="p-nav-ico" />Pólizas
              </div>
              <div className="p-nav">
                <div className="p-nav-ico" />CRM
              </div>
              <div className="p-nav">
                <div className="p-nav-ico" />Vencimientos
              </div>
              <div className="p-nav">
                <div className="p-nav-ico" />Siniestros
              </div>
            </div>
            <div className="p-main">
              <div className="p-title">Resumen ejecutivo</div>
              <div className="p-metrics">
                <div className="p-metric">
                  <div className="p-m-label">Prima mensual</div>
                  <div className="p-m-val">$2.4M</div>
                  <div className="p-m-sub">↑ 12%</div>
                </div>
                <div className="p-metric">
                  <div className="p-m-label">Pólizas activas</div>
                  <div className="p-m-val">148</div>
                  <div className="p-m-sub">↑ 5 nuevas</div>
                </div>
                <div className="p-metric">
                  <div className="p-m-label">Clientes</div>
                  <div className="p-m-val">93</div>
                  <div className="p-m-sub" style={{ color: "var(--text3)" }}>
                    activos
                  </div>
                </div>
                <div className="p-metric">
                  <div className="p-m-label">Vencimientos</div>
                  <div className="p-m-val">11</div>
                  <div className="p-m-sub w">↑ urgentes</div>
                </div>
              </div>
              <div className="p-2col">
                <div className="p-card">
                  <div className="p-card-t">Producción por ramo</div>
                  <div className="p-bar-row">
                    <span className="p-bar-lbl">Automotor</span>
                    <div className="p-bar-wrap">
                      <div className="p-bar-fill" style={{ width: "72%" }} />
                    </div>
                    <span style={{ width: 38, textAlign: "right" }}>$980K</span>
                  </div>
                  <div className="p-bar-row">
                    <span className="p-bar-lbl">Vida</span>
                    <div className="p-bar-wrap">
                      <div className="p-bar-fill" style={{ width: "45%", background: "var(--green-light)" }} />
                    </div>
                    <span style={{ width: 38, textAlign: "right" }}>$620K</span>
                  </div>
                  <div className="p-bar-row">
                    <span className="p-bar-lbl">Hogar</span>
                    <div className="p-bar-wrap">
                      <div className="p-bar-fill" style={{ width: "35%" }} />
                    </div>
                    <span style={{ width: 38, textAlign: "right" }}>$480K</span>
                  </div>
                  <div className="p-bar-row">
                    <span className="p-bar-lbl">ART</span>
                    <div className="p-bar-wrap">
                      <div className="p-bar-fill" style={{ width: "23%", background: "var(--amber-light)" }} />
                    </div>
                    <span style={{ width: 38, textAlign: "right" }}>$320K</span>
                  </div>
                </div>
                <div className="p-card">
                  <div className="p-card-t">Actividad reciente</div>
                  <div className="p-tl">
                    <div className="p-tl-dot g" />
                    <div>
                      <div className="p-tl-text">Póliza renovada — García M.</div>
                      <div className="p-tl-sub">Hace 2 horas · Automotor</div>
                    </div>
                  </div>
                  <div className="p-tl">
                    <div className="p-tl-dot" />
                    <div>
                      <div className="p-tl-text">Nuevo cliente — López A.</div>
                      <div className="p-tl-sub">Hoy 9:30 · Vida</div>
                    </div>
                  </div>
                  <div className="p-tl">
                    <div className="p-tl-dot w" />
                    <div>
                      <div className="p-tl-text">Vencimiento — Martínez R.</div>
                      <div className="p-tl-sub">7 días · Hogar</div>
                    </div>
                  </div>
                  <div className="p-tl">
                    <div className="p-tl-dot r" />
                    <div>
                      <div className="p-tl-text">Siniestro — Rodríguez P.</div>
                      <div className="p-tl-sub">Ayer 15:00 · Automotor</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section transform-bg" id="como-funciona">
        <div className="section-inner">
          <div className="section-label center-text">Cómo funciona</div>
          <h2 className="center">De cero a organizado en 3 pasos</h2>
          <p className="section-sub center">
            No necesitás saber de tecnología. Si podés usar WhatsApp, podés usar SegurosPro.
          </p>
          <div className="steps">
            <div className="step">
              <div className="step-num">1</div>
              <h3>Cargás tus clientes y pólizas</h3>
              <p>
                Importás desde Excel o los cargás uno a uno. En menos de una hora tenés tu cartera completa en
                el sistema.
              </p>
            </div>
            <div className="step">
              <div className="step-num active">2</div>
              <h3>El sistema se encarga de los avisos</h3>
              <p>
                SegurosPro te avisa automáticamente cuando se acerca un vencimiento. Vos solo tenés que llamar al
                cliente.
              </p>
            </div>
            <div className="step">
              <div className="step-num">3</div>
              <h3>Crecés con datos reales</h3>
              <p>
                Sabés exactamente cuánto producís, qué clientes necesitan atención y qué oportunidades tenés
                pendientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="funcionalidades">
        <div className="section-inner">
          <div className="section-label">Beneficios</div>
          <h2 className="section-title-lg">Resuelve los problemas reales de los productores argentinos</h2>

          <div className="benefit-row">
            <div className="benefit-text">
              <div className="tag">Vencimientos</div>
              <h3>Nunca más un cliente que se va porque se le venció la póliza</h3>
              <p>
                SegurosPro te avisa 30, 15 y 7 días antes de cada vencimiento. Ves todo ordenado por urgencia y
                actuás a tiempo.
              </p>
              <ul className="benefit-checks">
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Alertas automáticas por vencimiento
                </li>
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Vista de urgencia con semáforo de colores
                </li>
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Historial de renovaciones por cliente
                </li>
              </ul>
            </div>
            <div className="benefit-visual">
              <div className="bv-header">
                <span>Vencimientos próximos</span>
                <span style={{ color: "var(--red)", fontSize: 11 }}>3 críticos</span>
              </div>
              <div className="bv-content">
                <div className="venc-row urgent">
                  <div className="venc-avatar">GM</div>
                  <div style={{ flex: 1 }}>
                    <div className="venc-name">García, Martín</div>
                    <div className="venc-ramo">Automotor · ZUR-2401</div>
                  </div>
                  <span className="venc-badge r">2 días</span>
                </div>
                <div className="venc-row warning">
                  <div className="venc-avatar">RM</div>
                  <div style={{ flex: 1 }}>
                    <div className="venc-name">Rodríguez, M.</div>
                    <div className="venc-ramo">Hogar · SAN-1892</div>
                  </div>
                  <span className="venc-badge a">7 días</span>
                </div>
                <div className="venc-row">
                  <div className="venc-avatar">LF</div>
                  <div style={{ flex: 1 }}>
                    <div className="venc-name">Fernández, Luis</div>
                    <div className="venc-ramo">Vida · MER-0341</div>
                  </div>
                  <span className="venc-badge g">18 días</span>
                </div>
                <div className="venc-row">
                  <div className="venc-avatar">AL</div>
                  <div style={{ flex: 1 }}>
                    <div className="venc-name">López, Ana</div>
                    <div className="venc-ramo">Automotor · ZUR-2208</div>
                  </div>
                  <span className="venc-badge g">24 días</span>
                </div>
              </div>
            </div>
          </div>

          <div className="benefit-row reverse">
            <div className="benefit-text">
              <div className="tag">Expediente digital</div>
              <h3>Todos los documentos de tus clientes en un solo lugar</h3>
              <p>
                DNIs, fotos del vehículo, pólizas, denuncias y notas. Todo organizado por cliente y accesible
                desde cualquier dispositivo.
              </p>
              <ul className="benefit-checks">
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Subís fotos, PDFs y documentos Word
                </li>
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Categorización automática por tipo
                </li>
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Búsqueda instantánea en toda tu cartera
                </li>
              </ul>
            </div>
            <div className="benefit-visual">
              <div className="bv-header">
                <span>García, Martín — Documentos</span>
                <span style={{ color: "var(--text3)", fontSize: 11 }}>6 archivos</span>
              </div>
              <div className="bv-content">
                <div className="exp-grid">
                  <div className="exp-file">
                    <div className="exp-file-ico pdf">📄</div>
                    <div className="exp-file-name">poliza_auto.pdf</div>
                    <div className="exp-file-cat">Póliza</div>
                  </div>
                  <div className="exp-file">
                    <div className="exp-file-ico img">🖼</div>
                    <div className="exp-file-name">frente_auto.jpg</div>
                    <div className="exp-file-cat">Vehículo</div>
                  </div>
                  <div className="exp-file">
                    <div className="exp-file-ico img">🖼</div>
                    <div className="exp-file-name">dni_frente.jpg</div>
                    <div className="exp-file-cat">DNI</div>
                  </div>
                  <div className="exp-file">
                    <div className="exp-file-ico img">🖼</div>
                    <div className="exp-file-name">dni_dorso.jpg</div>
                    <div className="exp-file-cat">DNI</div>
                  </div>
                  <div className="exp-file">
                    <div className="exp-file-ico pdf">📄</div>
                    <div className="exp-file-name">denuncia_01.pdf</div>
                    <div className="exp-file-cat">Denuncia</div>
                  </div>
                  <div className="exp-file">
                    <div className="exp-file-ico doc">📋</div>
                    <div className="exp-file-name">vida_plan.pdf</div>
                    <div className="exp-file-cat">Póliza</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="benefit-row">
            <div className="benefit-text">
              <div className="tag">CRM integrado</div>
              <h3>Seguí cada cotización hasta el cierre</h3>
              <p>
                Un kanban simple para no perder ninguna oportunidad. Sabés exactamente qué cotizaciones están
                abiertas, cuáles seguir y cuáles se enfriaron.
              </p>
              <ul className="benefit-checks">
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Pipeline visual de cotizaciones
                </li>
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Próxima acción y fecha de seguimiento
                </li>
                <li>
                  <div className="check-ico">
                    <svg viewBox="0 0 12 12" aria-hidden="true">
                      <path d="M2 6l3 3 5-5" />
                    </svg>
                  </div>
                  Convertir lead en cliente con un clic
                </li>
              </ul>
            </div>
            <div className="benefit-visual">
              <div className="bv-header">
                <span>CRM — Pipeline de cotizaciones</span>
              </div>
              <div className="bv-content">
                <div className="crm-cols">
                  <div>
                    <div className="crm-col-h">
                      <span>Contactado</span>
                      <span>3</span>
                    </div>
                    <div className="crm-card">
                      <div className="crm-card-name">Pérez, Diego</div>
                      <div className="crm-card-meta">Automotor · $22K</div>
                    </div>
                    <div className="crm-card">
                      <div className="crm-card-name">Vega, Sofía</div>
                      <div className="crm-card-meta">Vida · $7K</div>
                    </div>
                  </div>
                  <div>
                    <div className="crm-col-h">
                      <span>Cotizado</span>
                      <span>2</span>
                    </div>
                    <div className="crm-card">
                      <div className="crm-card-name">Torres, Silvia</div>
                      <div className="crm-card-meta">Vida · $9K</div>
                    </div>
                    <div className="crm-card">
                      <div className="crm-card-name">Díaz, Facundo</div>
                      <div className="crm-card-meta">Auto · $19K</div>
                    </div>
                  </div>
                  <div>
                    <div className="crm-col-h">
                      <span>Negociación</span>
                      <span>1</span>
                    </div>
                    <div className="crm-card">
                      <div className="crm-card-name">Gómez, Héctor</div>
                      <div className="crm-card-meta">Hogar · $8K</div>
                    </div>
                  </div>
                  <div>
                    <div className="crm-col-h">
                      <span>Cerrado</span>
                      <span>1</span>
                    </div>
                    <div className="crm-card" style={{ borderColor: "rgba(74,222,128,.3)" }}>
                      <div className="crm-card-name">Ruiz, Carmen</div>
                      <div className="crm-card-meta">ART · $15K</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section features-bg compact-section">
        <div className="section-inner">
          <div className="section-label center-text">Todo incluido</div>
          <h2 className="center section-title-md">Cada herramienta que necesitás, sin las que no</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <rect x="2" y="3" width="16" height="14" rx="2" />
                  <path d="M6 1v4M14 1v4M2 9h16" />
                </svg>
              </div>
              <h3>Alertas de vencimiento</h3>
              <p>Avisos automáticos 30, 15 y 7 días antes. Nunca más un vencimiento sin renovar.</p>
            </div>
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M10 2L16 5.5V11Q16 16 10 17.5Q4 16 4 11V5.5Z" />
                </svg>
              </div>
              <h3>Expediente digital</h3>
              <p>Pólizas, fotos, DNIs y denuncias de cada cliente, organizados y accesibles siempre.</p>
            </div>
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <rect x="2" y="2" width="16" height="16" rx="2" />
                  <path d="M6 8h8M6 12h5" />
                </svg>
              </div>
              <h3>Dashboard en tiempo real</h3>
              <p>Tu producción por ramo, pólizas activas y actividad del equipo. Todo en un vistazo.</p>
            </div>
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="8" cy="7" r="4" />
                  <path d="M2 18c0-3.3 2.7-6 6-6" />
                  <circle cx="15" cy="14" r="3" />
                  <path d="M15 12v2l1 1" />
                </svg>
              </div>
              <h3>CRM de cotizaciones</h3>
              <p>Pipeline kanban para seguir cada oportunidad desde el contacto hasta el cierre.</p>
            </div>
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="8" r="5" />
                  <path d="M3 18c0-3.9 3.1-7 7-7s7 3.1 7 7" />
                </svg>
              </div>
              <h3>Multi-usuario con roles</h3>
              <p>Admin, productor y asistente. Cada uno ve y hace lo que le corresponde.</p>
            </div>
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M3 7l7-4 7 4v6l-7 4-7-4V7z" />
                  <path d="M10 11V7" />
                </svg>
              </div>
              <h3>Todos los ramos</h3>
              <p>Automotor, Vida, AP, Hogar, Combinado y ART. Campos específicos para cada tipo.</p>
            </div>
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <path d="M2 10h16M10 2l5 8-5 8-5-8 5-8z" />
                </svg>
              </div>
              <h3>Gestión de siniestros</h3>
              <p>Registrá denuncias, seguí el estado y documentá cada paso del proceso.</p>
            </div>
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <rect x="3" y="3" width="14" height="14" rx="2" />
                  <path d="M3 8h14M8 8v9" />
                </svg>
              </div>
              <h3>Gestión de aseguradoras</h3>
              <p>Catálogo de compañías con datos de contacto y producción por aseguradora.</p>
            </div>
            <div className="feature-item">
              <div className="feature-ico">
                <svg viewBox="0 0 20 20" aria-hidden="true">
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 6v4l3 3" />
                </svg>
              </div>
              <h3>Historial completo</h3>
              <p>Cada llamada, nota, renovación y documento queda registrado en el timeline del cliente.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mid-cta">
        <div className="stars">
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="star">★</span>
          <span className="stars-label">Más de 50 productores ya lo están usando</span>
        </div>
        <h2>¿Listo para dejar el Excel atrás?</h2>
        <p>Empezá gratis hoy. Sin tarjeta de crédito, sin contratos, sin complejidades.</p>
        <Link href="/register" className="btn-primary btn-large">
          Crear mi cuenta gratis →
        </Link>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-label center-text">Qué incluye</div>
          <h2 className="center">Todo lo que necesitás desde el día uno</h2>
          <p className="section-sub center">
            Sin costos ocultos, sin módulos extra. Acceso completo a todas las funcionalidades.
          </p>
          <div className="included-grid">
            <div className="included-item">
              <div className="inc-ico">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="9" r="7" />
                  <path d="M6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4>Clientes y pólizas ilimitados</h4>
                <p>Sin límite de registros. Cargás toda tu cartera sin restricciones.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="inc-ico">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="9" r="7" />
                  <path d="M6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4>Storage de documentos</h4>
                <p>20 GB para subir PDFs, fotos e imágenes de todos tus clientes.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="inc-ico">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="9" r="7" />
                  <path d="M6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4>Hasta 5 usuarios</h4>
                <p>Sumá a tu equipo con roles y permisos diferenciados.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="inc-ico">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="9" r="7" />
                  <path d="M6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4>Todos los ramos</h4>
                <p>Automotor, Vida, AP, Hogar, Combinado y ART desde el primer día.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="inc-ico">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="9" r="7" />
                  <path d="M6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4>Actualizaciones incluidas</h4>
                <p>Todas las mejoras futuras sin costo adicional.</p>
              </div>
            </div>
            <div className="included-item">
              <div className="inc-ico">
                <svg viewBox="0 0 18 18" aria-hidden="true">
                  <circle cx="9" cy="9" r="7" />
                  <path d="M6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <h4>Soporte en español</h4>
                <p>Equipo de soporte local que conoce el mercado asegurador argentino.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section testimonials-section">
        <div className="section-inner">
          <div className="section-label center-text">Testimonios</div>
          <h2 className="center section-title-md">Lo que dicen los productores que ya lo usan</h2>
          <div className="testimonials-grid">
            <div className="testi-card">
              <div className="testi-stars">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="testi-text">
                &quot;Antes usaba tres Excel distintos y igual se me vencían pólizas. Con SegurosPro tengo todo en un
                lugar y los avisos me llegan solos. En el primer mes recuperé tres renovaciones que se me hubieran
                ido.&quot;
              </p>
              <div className="testi-author">
                <div className="testi-avatar">CR</div>
                <div>
                  <div className="testi-name">Carlos R.</div>
                  <div className="testi-role">Productor independiente · Buenos Aires</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="testi-text">
                &quot;La parte de documentos me cambió la vida. Los clientes me mandan las fotos por WhatsApp y las
                cargo directo al sistema. Ya no pierdo tiempo buscando archivos cuando me llama una aseguradora.&quot;
              </p>
              <div className="testi-author">
                <div className="testi-avatar">ML</div>
                <div>
                  <div className="testi-name">María L.</div>
                  <div className="testi-role">Agencia de seguros · Córdoba</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-stars">
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
                <span>★</span>
              </div>
              <p className="testi-text">
                &quot;Tenemos un equipo de 4 personas y el sistema de roles funciona perfecto. Mi asistente carga los
                datos y yo veo el resumen de producción sin entrar en cada póliza. Muy práctico y fácil de usar.&quot;
              </p>
              <div className="testi-author">
                <div className="testi-avatar">JP</div>
                <div>
                  <div className="testi-name">Jorge P.</div>
                  <div className="testi-role">Productora del Sur · Rosario</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section comparison-bg">
        <div className="section-inner">
          <div className="section-label center-text">Comparación</div>
          <h2 className="center">¿Por qué SegurosPro y no otra solución?</h2>
          <p className="section-sub center">
            Comparado con las alternativas más comunes en el mercado argentino.
          </p>
          <div className="comparison-scroll">
            <table className="comp-table">
              <thead>
                <tr>
                  <th>Funcionalidad</th>
                  <th>
                    <div className="comp-head-sp">SegurosPro</div>
                  </th>
                  <th>Excel / Planillas</th>
                  <th>Sistemas genéricos</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Alertas automáticas de vencimiento</td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                  <td>
                    <span className="comp-no">✗</span>
                  </td>
                  <td>
                    <span className="comp-partial">A veces</span>
                  </td>
                </tr>
                <tr>
                  <td>Expediente digital con documentos</td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                  <td>
                    <span className="comp-no">✗</span>
                  </td>
                  <td>
                    <span className="comp-partial">Limitado</span>
                  </td>
                </tr>
                <tr>
                  <td>CRM de cotizaciones integrado</td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                  <td>
                    <span className="comp-no">✗</span>
                  </td>
                  <td>
                    <span className="comp-no">✗</span>
                  </td>
                </tr>
                <tr>
                  <td>Dashboard de producción en tiempo real</td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                  <td>
                    <span className="comp-partial">Manual</span>
                  </td>
                  <td>
                    <span className="comp-partial">Básico</span>
                  </td>
                </tr>
                <tr>
                  <td>Campos específicos por ramo (Automotor, ART, etc.)</td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                  <td>
                    <span className="comp-no">✗</span>
                  </td>
                  <td>
                    <span className="comp-partial">Genérico</span>
                  </td>
                </tr>
                <tr>
                  <td>Multi-usuario con roles</td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                  <td>
                    <span className="comp-no">✗</span>
                  </td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                </tr>
                <tr>
                  <td>Acceso desde cualquier dispositivo</td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                  <td>
                    <span className="comp-partial">Limitado</span>
                  </td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                </tr>
                <tr>
                  <td>Soporte en español y mercado argentino</td>
                  <td>
                    <span className="comp-yes">✓</span>
                  </td>
                  <td>
                    <span className="comp-no">✗</span>
                  </td>
                  <td>
                    <span className="comp-partial">Variable</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section faq-section" id="faq">
        <div className="section-inner">
          <div className="section-label center-text">Preguntas frecuentes</div>
          <h2 className="center section-title-md">Todo lo que querés saber antes de empezar</h2>
          <div className="faq-list">
            <details className="faq-item">
              <summary className="faq-q">¿Cuánto tiempo lleva migrar desde Excel?</summary>
              <p className="faq-a">
                La mayoría de los productores tienen su cartera cargada en menos de un día. Podés importar desde
                Excel o CSV, o cargar los clientes manualmente. Nuestro equipo te ayuda con la migración inicial
                sin costo adicional.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-q">¿Mis datos están seguros? ¿Quién puede verlos?</summary>
              <p className="faq-a">
                Tus datos son exclusivamente tuyos. Usamos encriptación en tránsito y en reposo, y cada
                organización tiene sus datos completamente aislados. Nunca compartimos ni vendemos información de
                nuestros clientes.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-q">¿Funciona para todos los ramos de seguros?</summary>
              <p className="faq-a">
                Sí. SegurosPro soporta Automotor, Vida, Accidentes Personales, Hogar, Combinado Familiar y ART,
                con campos específicos para cada ramo. Si trabajás con un ramo que no está listado, lo podemos
                agregar.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-q">¿Puedo usarlo si trabajo solo, sin equipo?</summary>
              <p className="faq-a">
                Perfectamente. De hecho, la mayoría de nuestros usuarios son productores independientes. El sistema
                se adapta tanto a una persona como a una agencia con varios empleados.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-q">¿Cuál es el costo?</summary>
              <p className="faq-a">
                Estamos en período de acceso anticipado con precios especiales para los primeros usuarios. Dejá tu
                email en el formulario y te enviamos los planes disponibles. Todos incluyen prueba gratuita de 30
                días.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-q">¿Se integra con las aseguradoras?</summary>
              <p className="faq-a">
                Por ahora la carga es manual, pero estamos desarrollando integraciones con las principales
                aseguradoras del mercado argentino. Los usuarios actuales tendrán acceso gratuito a estas
                integraciones cuando estén disponibles.
              </p>
            </details>
            <details className="faq-item">
              <summary className="faq-q">¿Qué pasa si decido cancelar?</summary>
              <p className="faq-a">
                Podés cancelar en cualquier momento sin penalidades. Antes de que se cierre tu cuenta, podés
                exportar todos tus datos en formato Excel o CSV. No hay letra chica.
              </p>
            </details>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <div className="final-cta-inner">
          <h2>
            Empezá a ordenar
            <br />
            tu cartera <em>hoy</em>
          </h2>
          <p>
            Sumate a los productores que ya dejaron el Excel atrás. Primeros 30 días gratis, sin tarjeta de
            crédito.
          </p>
          <WaitlistForm />
          <div className="trust-badges">
            <div className="trust-badge">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 1L10 6h5l-4 3 1.5 5L8 11 3.5 14 5 9 1 6h5z" />
              </svg>
              30 días gratis
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <rect x="3" y="7" width="10" height="7" rx="1.5" />
                <path d="M5 7V5a3 3 0 0 1 6 0v2" />
              </svg>
              Sin tarjeta de crédito
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <path d="M8 2L12 4.5V9Q12 13 8 14Q4 13 4 9V4.5Z" />
              </svg>
              Datos seguros
            </div>
            <div className="trust-badge">
              <svg viewBox="0 0 16 16" aria-hidden="true">
                <circle cx="8" cy="8" r="6" />
                <path d="M8 5v3l2 2" />
              </svg>
              Cancelás cuando querés
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="footer-logo">
          <div className="nav-shield nav-shield-sm">
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 2L16 5.5V11Q16 16 10 17.5Q4 16 4 11V5.5Z" />
            </svg>
          </div>
          SegurosPro
        </div>
        <div className="footer-links">
          <a href="#">Privacidad</a>
          <a href="#">Términos</a>
          <a href="#">Contacto</a>
          <a href="#">Blog</a>
        </div>
        <p className="footer-copy">© 2025 SegurosPro</p>
      </footer>
    </div>
  );
}
