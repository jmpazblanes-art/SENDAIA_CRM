'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function LeadFormPage() {
    const [form, setForm] = useState({ name: '', email: '', phone: '', company: '', message: '' })
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')
        try {
            const res = await fetch('/api/webhooks/webform', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Error al enviar')
            }
            setStatus('success')
        } catch (err: any) {
            setErrorMsg(err.message)
            setStatus('error')
        }
    }

    const inputClass = "w-full bg-[#0a0a0a] border border-[#1e1e1e] rounded-lg px-4 py-3.5 text-white placeholder-[#444] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 transition-all text-sm"
    const labelClass = "block text-xs font-semibold text-[#888] uppercase tracking-wider mb-2"

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'radial-gradient(ellipse at top, #111 0%, #050505 70%)' }}>
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'linear-gradient(135deg, #D4AF37, #B8972C)' }}>
                        <svg className="w-8 h-8 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3">Mensaje recibido</h2>
                    <p className="text-[#888] mb-2">Nos pondremos en contacto contigo en menos de 24h.</p>
                    <p className="text-[#D4AF37] text-sm font-medium italic">"Tu tiempo es oro. Nosotros ponemos el sistema."</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8" style={{ background: 'radial-gradient(ellipse at top, #111 0%, #050505 70%)' }}>
            <div className="w-full max-w-lg">

                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-6">
                        <Image
                            src="/logo-sendaia.png"
                            alt="SendaIA"
                            width={160}
                            height={50}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                        Hablemos de tu negocio
                    </h1>
                    <p className="text-[#666] text-sm">
                        Cuéntanos qué necesitas. Te respondemos en 24h.
                    </p>
                    {/* Gold divider */}
                    <div className="mt-4 mx-auto w-12 h-0.5" style={{ background: 'linear-gradient(90deg, transparent, #D4AF37, transparent)' }} />
                </div>

                {/* Form card */}
                <div className="rounded-2xl p-6 sm:p-8 border border-[#1a1a1a]" style={{ background: 'rgba(255,255,255,0.02)' }}>
                    <form onSubmit={handleSubmit} className="space-y-5">

                        <div>
                            <label className={labelClass}>Nombre completo *</label>
                            <input
                                required
                                type="text"
                                placeholder="Ej: Carlos Martínez"
                                className={inputClass}
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                            />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Email *</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="tu@empresa.com"
                                    className={inputClass}
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Teléfono</label>
                                <input
                                    type="tel"
                                    placeholder="+34 600 000 000"
                                    className={inputClass}
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Empresa</label>
                            <input
                                type="text"
                                placeholder="Nombre de tu empresa"
                                className={inputClass}
                                value={form.company}
                                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>¿Qué necesitas automatizar?</label>
                            <textarea
                                rows={4}
                                placeholder="Cuéntanos tu situación actual y qué quieres mejorar..."
                                className={`${inputClass} resize-none`}
                                value={form.message}
                                onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            />
                        </div>

                        {status === 'error' && (
                            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-2">
                                {errorMsg}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="w-full font-bold py-4 px-6 rounded-lg transition-all text-sm uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed text-black"
                            style={{ background: status === 'loading' ? '#B8972C' : 'linear-gradient(135deg, #D4AF37 0%, #C9A035 100%)' }}
                        >
                            {status === 'loading' ? 'Enviando...' : 'Solicitar información →'}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-[#444] text-xs mt-6">
                    sendaia.es · Granada, España · info@sendaia.es
                </p>
            </div>
        </div>
    )
}
