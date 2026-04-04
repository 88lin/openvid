"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { useState } from "react";
import { type DONATION_METHODS } from "./page";

type Method = typeof DONATION_METHODS[number];

export default function DonateClient({ 
  methods, 
  defaultMethod 
}: { 
  methods: Method[];
  defaultMethod: string;
}) {
  const [selected, setSelected] = useState<string | null>(defaultMethod);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrModalSrc, setQrModalSrc] = useState<string | null>(null);

  const handleCopy = (text: string, key: string) => {
    const cleanText = text.replace(/\s/g, ''); 
    navigator.clipboard.writeText(cleanText);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden pt-24 pb-16 relative">
      <div className="max-w-2xl mx-auto px-4">
        
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white mb-12 transition-colors group font-medium"
        >
          <Icon icon="lucide:arrow-left" width="16" className="group-hover:-translate-x-1 transition-transform" />
          Volver al inicio
        </Link>

        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-white mb-2 tracking-tight">
            Apoya el desarrollo
          </h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-lg">
            openvid es una herramienta de código abierto. Tu contribución nos permite mantener los servidores activos y continuar el desarrollo de nuevas características.
          </p>
        </div>

        <div className="flex flex-col bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
          <div className="px-5 py-3 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-white/50">
              Métodos
            </span>
            <Icon icon="lucide:shield-check" width="14" className="text-white/30" />
          </div>

          <div className="flex flex-col">
            {methods.map((method) => (
              <div key={method.id} className="border-b border-white/5 last:border-0">
                <button
                  onClick={() => setSelected(selected === method.id ? null : method.id)}
                  className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-white/5 group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded bg-[#1C1C1F] border border-white/10 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-white/20 transition-colors">
                      {method.image ? (
                        <img src={method.image} alt={method.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                      ) : (
                        <Icon icon={method.icon!} width="18" style={{ color: method.color }} className="opacity-80 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium text-white/90 group-hover:text-white transition-colors">{method.name}</span>
                        <span className="text-[9px] uppercase tracking-wider text-white/40 border border-white/10 px-1.5 py-0.5 rounded font-medium">
                          {method.tagline}
                        </span>
                      </div>
                      <p className="text-[11px] text-white/40">{method.detail}</p>
                    </div>
                  </div>
                  <Icon
                    icon="lucide:chevron-down"
                    width="16"
                    className={`text-white/30 shrink-0 transition-transform duration-300 ${selected === method.id ? "rotate-180 text-white/70" : ""}`}
                  />
                </button>

                {selected === method.id && (
                  <div className="bg-[#131315] border-t border-white/5 px-5 py-6 animate-in fade-in slide-in-from-top-2 duration-200">
                    
                    {method.id === "yape" && (
                      <div className="space-y-4 max-w-md">
                        <div className="flex flex-col items-center p-5 bg-black border border-white/10 rounded-lg">
                          <button 
                            onClick={() => setQrModalSrc(method.qrImage!)}
                            className="relative w-32 h-32 bg-white rounded flex items-center justify-center overflow-hidden cursor-pointer group hover:ring-2 hover:ring-white/20 transition-all"
                          >
                            <img src={method.qrImage} alt="Código QR Yape" className="w-full h-full object-contain transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                              <Icon icon="lucide:zoom-in" width="24" className="text-black opacity-0 group-hover:opacity-60 transition-opacity" />
                            </div>
                          </button>
                        </div>

                        <CopyRow label="Número celular" value={method.phone!} copyKey="yape-phone" copied={copied} onCopy={handleCopy} />
                      </div>
                    )}

                    {method.id === "visa" && (
                      <div className="space-y-3 max-w-md">
                        <CopyRow label="Cuenta BCP (Soles)" value={method.account!} copyKey="visa-account" copied={copied} onCopy={handleCopy} />
                        <CopyRow label="Código de Cuenta Interbancario (CCI)" value={method.cci!} copyKey="visa-cci" copied={copied} onCopy={handleCopy} />
                      </div>
                    )}

                    {method.id === "paypal" && (
                      <div className="space-y-4 max-w-md">
                        <CopyRow label="Correo electrónico de PayPal" value={method.email!} copyKey="paypal-email" copied={copied} onCopy={handleCopy} />
                        <div className="flex items-center gap-3">
                          <div className="h-px bg-white/10 flex-1"></div>
                          <span className="text-[10px] uppercase tracking-widest text-white/30 font-medium">o alternativamente</span>
                          <div className="h-px bg-white/10 flex-1"></div>
                        </div>
                        <a
                          href={method.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
                        >
                          <Icon icon="lucide:external-link" width="16" className="text-white/50" />
                          Abrir enlace de pago directo
                        </a>
                      </div>
                    )}

                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {qrModalSrc && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setQrModalSrc(null)}
        >
          <div 
            className="relative w-full max-w-sm bg-[#131315] border border-white/10 rounded-2xl p-6 shadow-2xl flex flex-col items-center animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full flex justify-between items-center mb-6">
              <span className="text-sm font-semibold text-white/90 tracking-wide">Escanear código QR</span>
              <button 
                onClick={() => setQrModalSrc(null)}
                className="text-white/40 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-1.5 transition-colors"
              >
                <Icon icon="lucide:x" width="18" />
              </button>
            </div>
            
            <div className="w-full aspect-square bg-white rounded-xl overflow-hidden flex items-center justify-center p-2">
              <img src={qrModalSrc} alt="QR Ampliado" className="w-full h-full object-contain" />
            </div>
            
            <button
              onClick={() => setQrModalSrc(null)}
              className="mt-6 w-full py-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-white transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function CopyRow({ label, value, copyKey, copied, onCopy }: { label: string, value: string, copyKey: string, copied: string | null, onCopy: (val: string, key: string) => void }) {
  return (
    <div className="flex items-center justify-between bg-black border border-white/10 rounded-lg p-3 group">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-white/40 mb-1 font-medium">{label}</p>
        <p className="font-mono text-sm text-white/90 tracking-wide">{value}</p>
      </div>
      <button
        onClick={() => onCopy(value, copyKey)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all text-xs font-medium ${
          copied === copyKey 
            ? "border-green-500/30 bg-green-500/10 text-green-400" 
            : "border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10"
        }`}
      >
        <Icon icon={copied === copyKey ? "lucide:check" : "lucide:copy"} width="14" />
        {copied === copyKey ? "Copiado" : "Copiar"}
      </button>
    </div>
  );
}