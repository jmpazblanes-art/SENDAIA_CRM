'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { login } from './actions'

export default function LoginPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <>
      <style jsx global>{`
        /* ===== KEYFRAME ANIMATIONS ===== */

        @keyframes float-particle {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          25% { transform: translate(30px, -50px) scale(1.2); opacity: 0.6; }
          50% { transform: translate(-20px, -100px) scale(0.8); opacity: 0.4; }
          75% { transform: translate(50px, -60px) scale(1.1); opacity: 0.5; }
        }

        @keyframes float-particle-reverse {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.2; }
          25% { transform: translate(-40px, 30px) scale(0.9); opacity: 0.5; }
          50% { transform: translate(30px, 60px) scale(1.3); opacity: 0.3; }
          75% { transform: translate(-20px, 40px) scale(1); opacity: 0.6; }
        }

        @keyframes logo-glow-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 20px rgba(201, 162, 77, 0.3)) drop-shadow(0 0 60px rgba(201, 162, 77, 0.1));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 40px rgba(201, 162, 77, 0.5)) drop-shadow(0 0 80px rgba(201, 162, 77, 0.2));
            transform: scale(1.02);
          }
        }

        @keyframes gradient-border-spin {
          0% { --gradient-angle: 0deg; }
          100% { --gradient-angle: 360deg; }
        }

        @keyframes card-fade-in {
          0% { opacity: 0; transform: translateY(30px) scale(0.96); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }

        @keyframes pulse-ring {
          0% { transform: scale(0.8); opacity: 0.6; }
          50% { transform: scale(1.1); opacity: 0; }
          100% { transform: scale(0.8); opacity: 0; }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes tagline-reveal {
          0% { opacity: 0; letter-spacing: 0.3em; filter: blur(4px); }
          100% { opacity: 1; letter-spacing: 0.15em; filter: blur(0px); }
        }

        @keyframes subtle-drift {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(2px, -3px); }
          66% { transform: translate(-2px, 2px); }
        }

        @keyframes line-draw {
          0% { stroke-dashoffset: 1000; }
          100% { stroke-dashoffset: 0; }
        }

        @keyframes dot-pulse {
          0%, 100% { r: 2; opacity: 0.3; }
          50% { r: 3.5; opacity: 0.8; }
        }

        /* ===== PARTICLE STYLES ===== */
        .particle {
          position: absolute;
          width: 4px;
          height: 4px;
          background: rgba(201, 162, 77, 0.4);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 6px rgba(201, 162, 77, 0.3);
        }

        .particle-1 { top: 15%; left: 10%; animation: float-particle 12s ease-in-out infinite; }
        .particle-2 { top: 25%; right: 15%; animation: float-particle-reverse 15s ease-in-out infinite 1s; }
        .particle-3 { bottom: 30%; left: 20%; animation: float-particle 18s ease-in-out infinite 2s; }
        .particle-4 { top: 60%; right: 25%; animation: float-particle-reverse 14s ease-in-out infinite 3s; }
        .particle-5 { top: 10%; left: 45%; animation: float-particle 16s ease-in-out infinite 0.5s; }
        .particle-6 { bottom: 15%; right: 10%; animation: float-particle-reverse 13s ease-in-out infinite 4s; }
        .particle-7 { top: 40%; left: 5%; animation: float-particle 20s ease-in-out infinite 1.5s; }
        .particle-8 { bottom: 40%; right: 35%; animation: float-particle-reverse 17s ease-in-out infinite 2.5s; }

        /* Large ambient particles */
        .particle-lg {
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(212, 175, 55, 0.2);
          border-radius: 50%;
          pointer-events: none;
          box-shadow: 0 0 12px rgba(212, 175, 55, 0.15);
        }
        .particle-lg-1 { top: 20%; left: 30%; animation: float-particle 25s ease-in-out infinite; }
        .particle-lg-2 { bottom: 25%; right: 20%; animation: float-particle-reverse 22s ease-in-out infinite 3s; }

        /* ===== GRID BACKGROUND ===== */
        .grid-bg {
          background-image:
            linear-gradient(rgba(201, 162, 77, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 162, 77, 0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        /* ===== ANIMATED GRADIENT BORDER ===== */
        @property --gradient-angle {
          syntax: "<angle>";
          initial-value: 0deg;
          inherits: false;
        }

        .animated-border {
          position: relative;
          border-radius: 16px;
        }

        .animated-border::before {
          content: '';
          position: absolute;
          inset: -1px;
          border-radius: 17px;
          padding: 1px;
          background: conic-gradient(
            from var(--gradient-angle, 0deg),
            rgba(201, 162, 77, 0.1),
            rgba(201, 162, 77, 0.5),
            rgba(212, 175, 55, 0.8),
            rgba(201, 162, 77, 0.5),
            rgba(201, 162, 77, 0.1),
            transparent,
            transparent,
            rgba(201, 162, 77, 0.1)
          );
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: gradient-border-spin 4s linear infinite;
          z-index: 0;
        }

        /* ===== SCANLINE OVERLAY ===== */
        .scanline-overlay {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
          border-radius: 16px;
        }

        .scanline-overlay::after {
          content: '';
          position: absolute;
          width: 100%;
          height: 30%;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(201, 162, 77, 0.015),
            transparent
          );
          animation: scanline 8s linear infinite;
        }

        /* ===== LOGO GLOW ===== */
        .logo-container {
          animation: logo-glow-pulse 4s ease-in-out infinite;
        }

        .logo-glow-ring {
          position: absolute;
          inset: -20px;
          border-radius: 50%;
          border: 1px solid rgba(201, 162, 77, 0.15);
          animation: pulse-ring 3s ease-out infinite;
        }

        .logo-glow-ring-2 {
          position: absolute;
          inset: -40px;
          border-radius: 50%;
          border: 1px solid rgba(201, 162, 77, 0.08);
          animation: pulse-ring 3s ease-out infinite 1s;
        }

        /* ===== CARD ANIMATIONS ===== */
        .card-enter {
          animation: card-fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .card-enter-delay {
          animation: card-fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
          opacity: 0;
        }

        /* ===== TAGLINE ===== */
        .tagline-animate {
          animation: tagline-reveal 1.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s forwards;
          opacity: 0;
        }

        /* ===== BUTTON SHIMMER ===== */
        .btn-shimmer {
          background-size: 200% auto;
          background-image: linear-gradient(
            90deg,
            #C9A24D 0%,
            #D4AF37 25%,
            #E8C84A 50%,
            #D4AF37 75%,
            #C9A24D 100%
          );
          transition: all 0.4s ease;
        }

        .btn-shimmer:hover {
          background-position: right center;
          box-shadow: 0 0 30px rgba(201, 162, 77, 0.4), 0 0 60px rgba(201, 162, 77, 0.1);
          transform: translateY(-1px);
        }

        /* ===== INPUT GLOW ===== */
        .input-glow:focus {
          box-shadow: 0 0 0 1px rgba(201, 162, 77, 0.5), 0 0 20px rgba(201, 162, 77, 0.1);
        }

        /* ===== NEURAL NETWORK SVG ===== */
        .neural-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0.15;
        }

        .neural-svg line {
          stroke: rgba(201, 162, 77, 0.3);
          stroke-width: 0.5;
          stroke-dasharray: 1000;
          animation: line-draw 20s linear infinite;
        }

        .neural-svg circle {
          fill: rgba(201, 162, 77, 0.5);
        }

        .neural-dot-1 { animation: dot-pulse 4s ease-in-out infinite; }
        .neural-dot-2 { animation: dot-pulse 4s ease-in-out infinite 0.5s; }
        .neural-dot-3 { animation: dot-pulse 4s ease-in-out infinite 1s; }
        .neural-dot-4 { animation: dot-pulse 4s ease-in-out infinite 1.5s; }
        .neural-dot-5 { animation: dot-pulse 4s ease-in-out infinite 2s; }
        .neural-dot-6 { animation: dot-pulse 4s ease-in-out infinite 2.5s; }
        .neural-dot-7 { animation: dot-pulse 4s ease-in-out infinite 3s; }
        .neural-dot-8 { animation: dot-pulse 4s ease-in-out infinite 3.5s; }

        /* ===== AMBIENT GRADIENT ===== */
        .ambient-gradient {
          background: radial-gradient(ellipse at 50% 0%, rgba(201, 162, 77, 0.08) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 50%, rgba(201, 162, 77, 0.04) 0%, transparent 50%),
                      radial-gradient(ellipse at 20% 80%, rgba(201, 162, 77, 0.03) 0%, transparent 50%);
          animation: subtle-drift 20s ease-in-out infinite;
        }
      `}</style>

      <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden"
           style={{ backgroundColor: '#0A0A0A' }}>

        {/* Grid background */}
        <div className="grid-bg absolute inset-0" />

        {/* Ambient gradient overlay */}
        <div className="ambient-gradient absolute inset-0" />

        {/* Neural network SVG background */}
        <svg className="neural-svg" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          {/* Neural nodes */}
          <circle className="neural-dot-1" cx="200" cy="150" r="2" />
          <circle className="neural-dot-2" cx="400" cy="300" r="2" />
          <circle className="neural-dot-3" cx="650" cy="100" r="2" />
          <circle className="neural-dot-4" cx="900" cy="250" r="2" />
          <circle className="neural-dot-5" cx="1100" cy="400" r="2" />
          <circle className="neural-dot-6" cx="300" cy="600" r="2" />
          <circle className="neural-dot-7" cx="750" cy="700" r="2" />
          <circle className="neural-dot-8" cx="1200" cy="150" r="2" />
          {/* Extra nodes */}
          <circle className="neural-dot-3" cx="100" cy="400" r="1.5" />
          <circle className="neural-dot-5" cx="500" cy="500" r="1.5" />
          <circle className="neural-dot-1" cx="1000" cy="600" r="1.5" />
          <circle className="neural-dot-7" cx="1300" cy="350" r="1.5" />
          <circle className="neural-dot-2" cx="150" cy="750" r="1.5" />
          <circle className="neural-dot-4" cx="850" cy="50" r="1.5" />
          <circle className="neural-dot-6" cx="600" cy="450" r="1.5" />

          {/* Connection lines */}
          <line x1="200" y1="150" x2="400" y2="300" />
          <line x1="400" y1="300" x2="650" y2="100" />
          <line x1="650" y1="100" x2="900" y2="250" />
          <line x1="900" y1="250" x2="1100" y2="400" />
          <line x1="200" y1="150" x2="650" y2="100" />
          <line x1="300" y1="600" x2="750" y2="700" />
          <line x1="400" y1="300" x2="300" y2="600" />
          <line x1="1100" y1="400" x2="1200" y2="150" />
          <line x1="900" y1="250" x2="1200" y2="150" />
          <line x1="750" y1="700" x2="1100" y2="400" />
          <line x1="100" y1="400" x2="200" y2="150" />
          <line x1="100" y1="400" x2="300" y2="600" />
          <line x1="500" y1="500" x2="400" y2="300" />
          <line x1="500" y1="500" x2="750" y2="700" />
          <line x1="1000" y1="600" x2="1100" y2="400" />
          <line x1="1000" y1="600" x2="750" y2="700" />
          <line x1="1300" y1="350" x2="1200" y2="150" />
          <line x1="1300" y1="350" x2="1100" y2="400" />
          <line x1="150" y1="750" x2="300" y2="600" />
          <line x1="850" y1="50" x2="650" y2="100" />
          <line x1="850" y1="50" x2="900" y2="250" />
          <line x1="600" y1="450" x2="500" y2="500" />
          <line x1="600" y1="450" x2="400" y2="300" />
          <line x1="600" y1="450" x2="900" y2="250" />
        </svg>

        {/* Floating particles */}
        <div className="particle particle-1" />
        <div className="particle particle-2" />
        <div className="particle particle-3" />
        <div className="particle particle-4" />
        <div className="particle particle-5" />
        <div className="particle particle-6" />
        <div className="particle particle-7" />
        <div className="particle particle-8" />
        <div className="particle-lg particle-lg-1" />
        <div className="particle-lg particle-lg-2" />

        {/* Main content */}
        <div className="relative z-10 flex w-full max-w-lg flex-col items-center px-4 sm:px-6">

          {/* Logo section */}
          <div className={`mb-6 flex flex-col items-center ${mounted ? 'card-enter' : 'opacity-0'}`}>
            {/* Logo with glow */}
            <div className="logo-container relative mb-6 flex items-center justify-center"
                 style={{ width: 140, height: 140 }}>
              <div className="logo-glow-ring" />
              <div className="logo-glow-ring-2" />
              {/* Radial glow behind logo */}
              <div className="absolute inset-0 rounded-full"
                   style={{
                     background: 'radial-gradient(circle, rgba(201, 162, 77, 0.15) 0%, transparent 70%)',
                     transform: 'scale(1.8)',
                   }}
              />
              <Image
                src="/logo-sendaia-transparent.png"
                alt="SendaIA"
                width={140}
                height={140}
                priority
                className="relative z-10 object-contain"
                style={{ filter: 'drop-shadow(0 0 20px rgba(201, 162, 77, 0.3))' }}
              />
            </div>

            {/* Subtitle */}
            <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]"
               style={{ color: '#C9A24D' }}>
              Sistema Operativo de IA para empresas
            </p>

            {/* Tagline */}
            <p className={`text-center text-[11px] font-medium uppercase tracking-[0.15em] ${mounted ? 'tagline-animate' : 'opacity-0'}`}
               style={{ color: '#A0A0A0' }}>
              Tu tiempo es oro. Nosotros ponemos el sistema.
            </p>
          </div>

          {/* Login card */}
          <div className={`animated-border w-full ${mounted ? 'card-enter-delay' : 'opacity-0'}`}>
            <div className="relative overflow-hidden rounded-2xl"
                 style={{
                   backgroundColor: 'rgba(26, 26, 26, 0.8)',
                   backdropFilter: 'blur(20px)',
                   WebkitBackdropFilter: 'blur(20px)',
                 }}>

              {/* Scanline overlay */}
              <div className="scanline-overlay" />

              {/* Top accent line */}
              <div className="h-[1px] w-full"
                   style={{
                     background: 'linear-gradient(90deg, transparent, rgba(201, 162, 77, 0.6), transparent)',
                   }}
              />

              {/* Card content */}
              <div className="relative z-10 px-6 py-8 sm:px-8 sm:py-10">

                {/* Card header */}
                <div className="mb-8 text-center">
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <div className="h-[1px] w-8"
                         style={{ background: 'linear-gradient(90deg, transparent, rgba(201, 162, 77, 0.5))' }}
                    />
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A24D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    </svg>
                    <div className="h-[1px] w-8"
                         style={{ background: 'linear-gradient(270deg, transparent, rgba(201, 162, 77, 0.5))' }}
                    />
                  </div>
                  <h2 className="text-lg font-bold tracking-wide text-white">
                    Acceso al Nucleo
                  </h2>
                  <p className="mt-1 text-[11px] italic"
                     style={{ color: '#A0A0A0' }}>
                    Introduce tus credenciales para acceder al sistema operativo.
                  </p>
                </div>

                {/* Form */}
                <form className="space-y-5">
                  {/* Email field */}
                  <div className="space-y-2">
                    <label htmlFor="email"
                           className="block text-[10px] font-bold uppercase tracking-[0.2em]"
                           style={{ color: 'rgba(201, 162, 77, 0.7)' }}>
                      Email Corporativo
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="nombre@sendaia.es"
                      required
                      autoComplete="email"
                      className="input-glow h-12 w-full rounded-lg px-4 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(201, 162, 77, 0.3)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 162, 77, 0.8)'
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 162, 77, 0.3)'
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>

                  {/* Password field */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label htmlFor="password"
                             className="block text-[10px] font-bold uppercase tracking-[0.2em]"
                             style={{ color: 'rgba(201, 162, 77, 0.7)' }}>
                        Contrasena
                      </label>
                      <a href="#"
                         className="text-[10px] transition-colors duration-200 hover:underline"
                         style={{ color: '#C9A24D' }}>
                        Recuperar clave
                      </a>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      className="input-glow h-12 w-full rounded-lg px-4 text-sm text-white placeholder-gray-600 outline-none transition-all duration-300"
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(201, 162, 77, 0.3)',
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 162, 77, 0.8)'
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)'
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(201, 162, 77, 0.3)'
                        e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)'
                      }}
                    />
                  </div>

                  {/* Login button */}
                  <button
                    formAction={login}
                    className="btn-shimmer flex h-12 w-full items-center justify-center gap-2 rounded-lg text-sm font-bold uppercase tracking-wider text-black transition-all duration-300"
                    style={{
                      boxShadow: '0 0 20px rgba(201, 162, 77, 0.2)',
                    }}
                  >
                    Entrar al Sistema
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center py-1">
                    <div className="flex-1 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                    <span className="px-4 text-[10px] font-bold uppercase tracking-widest"
                          style={{ color: '#A0A0A0' }}>
                      o
                    </span>
                    <div className="flex-1 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.06)' }} />
                  </div>

                  {/* Demo access button */}
                  <Link href="/dashboard" className="block w-full">
                    <button
                      type="button"
                      className="flex h-11 w-full items-center justify-center gap-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all duration-300"
                      style={{
                        color: '#C9A24D',
                        border: '1px solid rgba(201, 162, 77, 0.25)',
                        backgroundColor: 'transparent',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(201, 162, 77, 0.1)'
                        e.currentTarget.style.borderColor = 'rgba(201, 162, 77, 0.5)'
                        e.currentTarget.style.boxShadow = '0 0 20px rgba(201, 162, 77, 0.1)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = 'rgba(201, 162, 77, 0.25)'
                        e.currentTarget.style.boxShadow = 'none'
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                      </svg>
                      Acceso Directo al Dashboard
                    </button>
                  </Link>
                </form>
              </div>

              {/* Bottom accent line */}
              <div className="h-[1px] w-full"
                   style={{
                     background: 'linear-gradient(90deg, transparent, rgba(201, 162, 77, 0.3), transparent)',
                   }}
              />
            </div>
          </div>

          {/* Footer */}
          <p className={`mt-6 text-center text-[10px] ${mounted ? 'tagline-animate' : 'opacity-0'}`}
             style={{ color: 'rgba(160, 160, 160, 0.4)' }}>
            &copy; 2026 SendaIA &mdash; Sistemas de Inteligencia Comercial
          </p>
        </div>
      </div>
    </>
  )
}
