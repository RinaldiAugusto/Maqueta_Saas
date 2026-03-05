"use client";

import { useEffect, useRef, useState } from "react";
import PortalLoginTabs from "@/components/PortalLoginTabs";

type Props = {
  error?: string;
  mensaje?: string;
  loginAction: (fd: FormData) => Promise<void>;
  registrarAction: (fd: FormData) => Promise<void>;
};

const SERVICIOS = [
  {
    icon: "🔧",
    title: "Service General",
    desc: "Revisión completa del vehículo. Aceite, filtros, correas y más. Tu auto en óptimas condiciones.",
  },
  {
    icon: "🛞",
    title: "Alineación y Balanceo",
    desc: "Mejorá el manejo y extendé la vida de tus neumáticos con nuestra tecnología de última generación.",
  },
  {
    icon: "❄️",
    title: "Aire Acondicionado",
    desc: "Carga de gas, limpieza de filtros y revisión completa del sistema de climatización.",
  },
  {
    icon: "🔩",
    title: "Frenos",
    desc: "Pastillas, discos y líquido de frenos. Tu seguridad es lo primero.",
  },
  {
    icon: "⚡",
    title: "Diagnóstico Electrónico",
    desc: "Scanner computarizado para detectar fallas en tiempo real con precisión absoluta.",
  },
  {
    icon: "🔋",
    title: "Sistema Eléctrico",
    desc: "Batería, alternador, arranque y toda la electrónica de tu vehículo.",
  },
];

const PASOS = [
  {
    num: "01",
    title: "Pedí tu turno",
    desc: "Entrá al portal, elegí el servicio y seleccioná el día y horario que mejor te quede.",
    color: "#4f8ef7",
  },
  {
    num: "02",
    title: "Llevá tu auto",
    desc: "Llegá al taller en el horario acordado. Nuestro equipo te va a estar esperando.",
    color: "#c084fc",
  },
  {
    num: "03",
    title: "Seguí el progreso",
    desc: "Desde el portal podés ver en qué etapa está tu vehículo en tiempo real.",
    color: "#fbbf24",
  },
  {
    num: "04",
    title: "Retirá y pagá",
    desc: "Te avisamos cuando está listo. Podés pagar en el taller o desde el portal.",
    color: "#34d399",
  },
];

const RAZONES = [
  {
    icon: "📱",
    title: "Todo desde el celular",
    desc: "Turnos, seguimiento y pagos desde tu portal personal. Sin llamadas, sin esperas.",
  },
  {
    icon: "⏱️",
    title: "Tiempos reales",
    desc: "Sabés exactamente cuándo va a estar listo tu auto. Sin sorpresas.",
  },
  {
    icon: "🛡️",
    title: "Garantía en todos los trabajos",
    desc: "Cada servicio tiene garantía. Si algo falla, lo solucionamos sin costo adicional.",
  },
  {
    icon: "👨‍🔧",
    title: "Técnicos certificados",
    desc: "Más de 15 años de experiencia. Formados y actualizados en las últimas tecnologías.",
  },
];

function useScrollY() {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handler = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return scrollY;
}

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setInView(true);
      },
      { threshold },
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

export default function PortalLoginLanding({
  error,
  mensaje,
  loginAction,
  registrarAction,
}: Props) {
  const scrollY = useScrollY();
  const heroH = typeof window !== "undefined" ? window.innerHeight : 800;

  // Login box: desaparece hacia arriba-derecha mientras se scrollea
  const progress = Math.min(scrollY / (heroH * 0.55), 1);
  const boxOpacity = 1 - progress;
  const boxTY = -progress * 80;
  const boxTX = progress * 40;
  const boxBlur = progress * 12;
  const boxScale = 1 - progress * 0.08;

  // Parallax fondo hero
  const bgY = scrollY * 0.35;

  const s1 = useInView(),
    s2 = useInView(),
    s3 = useInView(),
    s4 = useInView();

  return (
    <div
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: "#0d1117",
        color: "#fff",
        overflowX: "hidden",
      }}
    >
      {/* ════════════════ HERO ════════════════ */}
      <section
        style={{ position: "relative", height: "100vh", overflow: "hidden" }}
      >
        {/* Fondo con parallax */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `url('https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1800&q=80')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            transform: `translateY(${bgY}px)`,
            willChange: "transform",
          }}
        />

        {/* Overlay gradiente */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(135deg, rgba(10,14,26,0.92) 0%, rgba(10,14,26,0.6) 50%, rgba(10,14,26,0.75) 100%)",
          }}
        />

        {/* Ruido de textura sutil */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0.03,
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Contenido hero */}
        <div
          style={{
            position: "relative",
            zIndex: 10,
            height: "100%",
            display: "flex",
            alignItems: "center",
            padding: "0 5vw",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 420px",
              gap: "60px",
              alignItems: "center",
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            {/* Texto izquierda */}
            <div>
              {/* Logo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "40px",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: "900",
                    color: "#fff",
                    boxShadow: "0 4px 20px rgba(79,142,247,0.4)",
                  }}
                >
                  ▦
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "16px",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    Auto Services
                  </div>
                  <div
                    style={{
                      fontSize: "9px",
                      color: "rgba(255,255,255,0.3)",
                      letterSpacing: "2px",
                      textTransform: "uppercase",
                    }}
                  >
                    Portal del Cliente
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: "inline-block",
                  padding: "5px 14px",
                  borderRadius: "999px",
                  marginBottom: "20px",
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.25)",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#4f8ef7",
                  letterSpacing: "1px",
                  textTransform: "uppercase",
                }}
              >
                ✦ Tu taller de confianza
              </div>

              <h1
                style={{
                  fontSize: "clamp(36px, 5vw, 64px)",
                  fontWeight: 900,
                  lineHeight: 1.05,
                  letterSpacing: "-2px",
                  marginBottom: "20px",
                }}
              >
                Tu auto en las
                <br />
                <span
                  style={{
                    background: "linear-gradient(90deg, #4f8ef7, #34d399)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  mejores manos
                </span>
              </h1>

              <p
                style={{
                  fontSize: "15px",
                  color: "rgba(255,255,255,0.5)",
                  lineHeight: 1.7,
                  maxWidth: "460px",
                  marginBottom: "36px",
                }}
              >
                Gestioná tus turnos, seguí el estado de tu vehículo y pagá
                online desde un solo lugar. Simple, rápido y transparente.
              </p>

              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                {["Service General", "Frenos", "Alineación", "Diagnóstico"].map(
                  (s) => (
                    <span
                      key={s}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        fontWeight: 600,
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.5)",
                      }}
                    >
                      {s}
                    </span>
                  ),
                )}
              </div>

              {/* Scroll hint */}
              <div
                style={{
                  marginTop: "48px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  color: "rgba(255,255,255,0.2)",
                  fontSize: "11px",
                }}
              >
                <div
                  style={{
                    width: "24px",
                    height: "38px",
                    borderRadius: "12px",
                    border: "1px solid rgba(255,255,255,0.15)",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    padding: "5px",
                  }}
                >
                  <div
                    style={{
                      width: "3px",
                      height: "8px",
                      borderRadius: "999px",
                      background: "rgba(255,255,255,0.3)",
                      animation: "scrollDot 1.8s ease infinite",
                    }}
                  />
                </div>
                Scrolleá para conocernos
              </div>
            </div>

            {/* Box login — desaparece con scroll */}
            <div
              style={{
                opacity: boxOpacity,
                transform: `translateY(${boxTY}px) translateX(${boxTX}px) scale(${boxScale})`,
                filter: `blur(${boxBlur}px)`,
                transition: "none",
                willChange: "transform, opacity, filter",
                pointerEvents: progress > 0.5 ? "none" : "auto",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.04)",
                  backdropFilter: "blur(24px)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "20px",
                  padding: "32px",
                  boxShadow:
                    "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                }}
              >
                <PortalLoginTabs
                  error={error}
                  mensaje={mensaje}
                  loginAction={loginAction}
                  registrarAction={registrarAction}
                />
              </div>
              <p
                style={{
                  textAlign: "center",
                  fontSize: "11px",
                  color: "rgba(255,255,255,0.2)",
                  marginTop: "14px",
                }}
              >
                ¿Sos del taller?{" "}
                <a
                  href="/login"
                  style={{
                    color: "rgba(79,142,247,0.7)",
                    textDecoration: "none",
                  }}
                >
                  Panel admin →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ SERVICIOS ════════════════ */}
      <section
        ref={s1.ref}
        style={{
          padding: "100px 5vw",
          background: "#0d1117",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: "50%",
            transform: "translateX(-50%)",
            width: "600px",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(79,142,247,0.3), transparent)",
          }}
        />
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "64px",
              opacity: s1.inView ? 1 : 0,
              transform: s1.inView ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s ease",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#4f8ef7",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              ✦ Lo que hacemos
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 900,
                letterSpacing: "-1.5px",
                marginBottom: "14px",
              }}
            >
              Nuestros Servicios
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "15px",
                maxWidth: "500px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              Todo lo que tu vehículo necesita, en un solo lugar. Trabajamos con
              las marcas y modelos más exigentes.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "20px",
            }}
          >
            {SERVICIOS.map((s, i) => (
              <div
                key={s.title}
                style={{
                  padding: "28px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                  opacity: s1.inView ? 1 : 0,
                  transform: s1.inView ? "translateY(0)" : "translateY(40px)",
                  transition: `all 0.6s ease ${i * 0.08}s`,
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "rgba(79,142,247,0.05)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(79,142,247,0.2)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.background =
                    "rgba(255,255,255,0.02)";
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLDivElement).style.transform =
                    "translateY(0)";
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "14px" }}>
                  {s.icon}
                </div>
                <h3
                  style={{
                    fontWeight: 800,
                    fontSize: "16px",
                    marginBottom: "8px",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {s.title}
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.4)",
                    fontSize: "13px",
                    lineHeight: 1.7,
                  }}
                >
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Imagen */}
          <div
            style={{
              marginTop: "60px",
              borderRadius: "20px",
              overflow: "hidden",
              position: "relative",
              height: "340px",
              opacity: s1.inView ? 1 : 0,
              transition: "all 0.8s ease 0.4s",
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1400&q=80"
              alt="Taller mecánico"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(to right, rgba(13,17,23,0.8) 0%, transparent 50%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: "40px",
                top: "50%",
                transform: "translateY(-50%)",
              }}
            >
              <p
                style={{
                  fontSize: "11px",
                  color: "#4f8ef7",
                  fontWeight: 700,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}
              >
                Equipamiento de última generación
              </p>
              <h3
                style={{
                  fontSize: "28px",
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                  maxWidth: "320px",
                  lineHeight: 1.2,
                }}
              >
                Tecnología al servicio de tu auto
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CÓMO FUNCIONA ════════════════ */}
      <section
        ref={s2.ref}
        style={{
          padding: "100px 5vw",
          background: "#090c14",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "-200px",
            transform: "translateY(-50%)",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(79,142,247,0.06) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
          <div
            style={{
              textAlign: "center",
              marginBottom: "64px",
              opacity: s2.inView ? 1 : 0,
              transform: s2.inView ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.7s ease",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#c084fc",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              ✦ Sin complicaciones
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 900,
                letterSpacing: "-1.5px",
                marginBottom: "14px",
              }}
            >
              Cómo Funciona
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "15px",
                maxWidth: "480px",
                margin: "0 auto",
                lineHeight: 1.7,
              }}
            >
              En cuatro simples pasos tu auto queda en manos de nuestros
              especialistas.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px",
              position: "relative",
            }}
          >
            {PASOS.map((p, i) => (
              <div
                key={p.num}
                style={{
                  opacity: s2.inView ? 1 : 0,
                  transform: s2.inView ? "translateY(0)" : "translateY(50px)",
                  transition: `all 0.65s ease ${i * 0.12}s`,
                }}
              >
                <div
                  style={{
                    padding: "28px",
                    borderRadius: "16px",
                    border: `1px solid ${p.color}18`,
                    background: `${p.color}06`,
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      fontSize: "42px",
                      fontWeight: 900,
                      letterSpacing: "-2px",
                      marginBottom: "16px",
                      background: `linear-gradient(135deg, ${p.color}, ${p.color}66)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {p.num}
                  </div>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: "16px",
                      marginBottom: "8px",
                      letterSpacing: "-0.3px",
                    }}
                  >
                    {p.title}
                  </h3>
                  <p
                    style={{
                      color: "rgba(255,255,255,0.4)",
                      fontSize: "13px",
                      lineHeight: 1.7,
                    }}
                  >
                    {p.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Imagen */}
          <div
            style={{
              marginTop: "60px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              opacity: s2.inView ? 1 : 0,
              transition: "all 0.8s ease 0.5s",
            }}
          >
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                height: "260px",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1593055357429-62b6aea4be05?w=800&q=80"
                alt="Mecánico trabajando"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                height: "260px",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=800&q=80"
                alt="Diagnóstico electrónico"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ POR QUÉ ELEGIRNOS ════════════════ */}
      <section
        ref={s3.ref}
        style={{ padding: "100px 5vw", background: "#0d1117" }}
      >
        <div
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "80px",
            alignItems: "center",
          }}
        >
          {/* Texto */}
          <div
            style={{
              opacity: s3.inView ? 1 : 0,
              transform: s3.inView ? "translateX(0)" : "translateX(-40px)",
              transition: "all 0.8s ease",
            }}
          >
            <p
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#fbbf24",
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: "12px",
              }}
            >
              ✦ Nuestra diferencia
            </p>
            <h2
              style={{
                fontSize: "clamp(28px, 3.5vw, 44px)",
                fontWeight: 900,
                letterSpacing: "-1.5px",
                marginBottom: "20px",
                lineHeight: 1.1,
              }}
            >
              Por Qué
              <br />
              Elegirnos
            </h2>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "14px",
                lineHeight: 1.8,
                marginBottom: "36px",
              }}
            >
              Más de 15 años cuidando los autos de Córdoba. Combinamos
              experiencia, tecnología y transparencia para darte la mejor
              experiencia.
            </p>
            <div
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {RAZONES.map((r, i) => (
                <div
                  key={r.title}
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                    opacity: s3.inView ? 1 : 0,
                    transform: s3.inView
                      ? "translateX(0)"
                      : "translateX(-30px)",
                    transition: `all 0.6s ease ${0.1 + i * 0.1}s`,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      flexShrink: 0,
                      background: "rgba(251,191,36,0.08)",
                      border: "1px solid rgba(251,191,36,0.15)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "18px",
                    }}
                  >
                    {r.icon}
                  </div>
                  <div>
                    <p
                      style={{
                        fontWeight: 700,
                        fontSize: "14px",
                        marginBottom: "4px",
                      }}
                    >
                      {r.title}
                    </p>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.4)",
                        fontSize: "12px",
                        lineHeight: 1.6,
                      }}
                    >
                      {r.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Imagen */}
          <div
            style={{
              opacity: s3.inView ? 1 : 0,
              transform: s3.inView ? "translateX(0)" : "translateX(40px)",
              transition: "all 0.8s ease 0.2s",
            }}
          >
            <div
              style={{
                borderRadius: "20px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1615906655593-ad0386982a0f?w=800&q=80"
                alt="Equipo de trabajo"
                style={{
                  width: "100%",
                  aspectRatio: "4/5",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(to top, rgba(13,17,23,0.6) 0%, transparent 50%)",
                }}
              />
              {/* Stats flotantes */}
              <div
                style={{
                  position: "absolute",
                  bottom: "24px",
                  left: "24px",
                  right: "24px",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                {[
                  { n: "+15", l: "Años de exp." },
                  { n: "+2000", l: "Clientes" },
                  { n: "6", l: "Servicios" },
                  { n: "100%", l: "Garantía" },
                ].map((s) => (
                  <div
                    key={s.l}
                    style={{
                      background: "rgba(13,17,23,0.8)",
                      backdropFilter: "blur(10px)",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "10px",
                      padding: "12px 14px",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: 900,
                        color: "#fff",
                        letterSpacing: "-0.5px",
                      }}
                    >
                      {s.n}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: "rgba(255,255,255,0.4)",
                        marginTop: "2px",
                      }}
                    >
                      {s.l}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════ CONTACTO ════════════════ */}
      <section
        ref={s4.ref}
        style={{
          padding: "100px 5vw",
          background: "#090c14",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: "-200px",
            right: "-200px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(52,211,153,0.05) 0%, transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          style={{
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
            opacity: s4.inView ? 1 : 0,
            transform: s4.inView ? "translateY(0)" : "translateY(40px)",
            transition: "all 0.8s ease",
          }}
        >
          <p
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "#34d399",
              letterSpacing: "2px",
              textTransform: "uppercase",
              marginBottom: "12px",
            }}
          >
            ✦ Encontranos
          </p>
          <h2
            style={{
              fontSize: "clamp(28px, 4vw, 48px)",
              fontWeight: 900,
              letterSpacing: "-1.5px",
              marginBottom: "16px",
            }}
          >
            Contacto
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "15px",
              lineHeight: 1.7,
              marginBottom: "48px",
            }}
          >
            Estamos en Córdoba para atenderte. Pedí tu turno online o comunicate
            directamente con nosotros.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "20px",
              marginBottom: "48px",
            }}
          >
            {[
              {
                icon: "📍",
                label: "Dirección",
                value: "Av. Colón 2500\nCórdoba Capital",
              },
              {
                icon: "📞",
                label: "Teléfono",
                value: "+54 351 123-4567\nLun–Sáb 8 a 18hs",
              },
              {
                icon: "✉️",
                label: "Email",
                value: "info@autoservices.com.ar\nRespondemos en 24hs",
              },
            ].map((c) => (
              <div
                key={c.label}
                style={{
                  padding: "28px 20px",
                  borderRadius: "16px",
                  border: "1px solid rgba(255,255,255,0.06)",
                  background: "rgba(255,255,255,0.02)",
                }}
              >
                <div style={{ fontSize: "28px", marginBottom: "12px" }}>
                  {c.icon}
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    color: "rgba(255,255,255,0.4)",
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  {c.label}
                </p>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#dde3f0",
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {c.value}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div
            style={{
              padding: "40px",
              borderRadius: "20px",
              background:
                "linear-gradient(135deg, rgba(79,142,247,0.08), rgba(52,211,153,0.06))",
              border: "1px solid rgba(79,142,247,0.15)",
            }}
          >
            <h3
              style={{
                fontSize: "22px",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                marginBottom: "10px",
              }}
            >
              ¿Listo para empezar?
            </h3>
            <p
              style={{
                color: "rgba(255,255,255,0.4)",
                fontSize: "13px",
                marginBottom: "24px",
              }}
            >
              Creá tu cuenta y pedí tu primer turno en menos de 2 minutos.
            </p>
            <a
              href="#top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              style={{
                display: "inline-block",
                padding: "14px 36px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                color: "#fff",
                fontWeight: 800,
                fontSize: "14px",
                textDecoration: "none",
                boxShadow: "0 4px 20px rgba(79,142,247,0.3)",
              }}
            >
              Registrarme →
            </a>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            maxWidth: "1100px",
            margin: "60px auto 0",
            paddingTop: "32px",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #4f8ef7, #3b7de8)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 900,
                fontSize: "13px",
              }}
            >
              ▦
            </div>
            <span style={{ fontWeight: 700, fontSize: "13px" }}>
              Auto Services
            </span>
          </div>
          <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.2)" }}>
            © 2026 Auto Services · Todos los derechos reservados
          </p>
          <a
            href="/login"
            style={{
              fontSize: "11px",
              color: "rgba(79,142,247,0.5)",
              textDecoration: "none",
            }}
          >
            Panel administrativo →
          </a>
        </div>
      </section>

      <style>{`
        @keyframes scrollDot {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(10px); opacity: 0; }
        }
        @media (max-width: 900px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .why-grid { grid-template-columns: 1fr !important; }
          .contact-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
