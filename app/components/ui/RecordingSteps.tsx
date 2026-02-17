import { Icon } from "@iconify/react";

export default function InteractiveRecordingSteps() {
  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-24 text-left">
      
      {/* Header */}
      <div className="max-w-3xl mx-auto text-center mb-32">
        <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-6 leading-tight drop-shadow-[1.2px_1.2px_100.2px_rgba(183,203,248,1)]">
          Crea tu toma en <br />
          <span className="bg-gradient-to-r from-neutral-400 to-white bg-clip-text text-transparent">
            cuatro sencillos pasos
          </span>
        </h2>
        <p className="text-lg md:text-xl text-neutral-400 font-light leading-relaxed">
          Sigue estas instrucciones para capturar tu pantalla. Todo el proceso ocurre en tu navegador, sin necesidad de instalar nada.
        </p>
      </div>

      <div className="space-y-32">
        
        {/* PASO 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="aspect-video bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
              {/* Mockup de la ventana nativa del navegador */}
              <div className="bg-[#141414] border border-white/10 rounded-lg p-5 w-3/4 shadow-2xl relative z-10 flex flex-col">
                <div className="flex gap-6 mb-4 border-b border-white/5 pb-3 text-sm text-neutral-500 font-medium">
                  <span className="text-white border-b border-white pb-3 -mb-[13px]">Pestaña de Chrome</span>
                  <span>Ventana</span>
                  <span>Pantalla Completa</span>
                </div>
                <div className="h-28 bg-white/5 rounded border border-white/5 flex items-center justify-center mb-4">
                  <Icon icon="solar:browser-minimalistic-linear" className="text-neutral-500 text-4xl" />
                </div>
                <div className="flex justify-end gap-3 mt-auto">
                  <div className="px-4 py-1.5 border border-white/10 text-neutral-400 rounded text-sm">Cancelar</div>
                  <div className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm">Compartir</div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-5 mb-6">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white font-light text-2xl shrink-0">
                1
              </span>
              <h3 className="text-3xl md:text-4xl font-light tracking-tight text-white">
                Inicia la captura
              </h3>
            </div>
            <p className="text-lg text-neutral-400 mb-10 leading-relaxed font-light">
              Haz clic en el botón de abajo. Tu navegador te pedirá qué deseas compartir. Para un rendimiento óptimo y tomas más limpias, te recomendamos seleccionar una <strong>Pestaña</strong> o <strong>Ventana específica</strong>.
            </p>
            {/* BOTÓN DE ACCIÓN REAL */}
            <button className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-black hover:bg-neutral-200 transition-colors font-medium rounded-md text-lg w-full sm:w-auto">
              <Icon icon="solar:record-circle-linear" className="text-xl" />
              Compartir Pantalla
            </button>
          </div>
        </div>

        {/* PASO 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-1 lg:order-1">
            <div className="flex items-center gap-5 mb-6">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white font-light text-2xl shrink-0">
                2
              </span>
              <h3 className="text-3xl md:text-4xl font-light tracking-tight text-white">
                Oculta las distracciones
              </h3>
            </div>
            <p className="text-lg text-neutral-400 mb-10 leading-relaxed font-light">
              Si decides compartir toda tu pantalla, tu navegador mostrará automáticamente una barra flotante avisando que la captura está activa. Haz clic en <strong>&quot;Ocultar&quot;</strong> para asegurarte de que no aparezca en tu video final.
            </p>
          </div>
          <div className="order-2 lg:order-2">
            <div className="aspect-video bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-2xl">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-blue-500/10 rounded-[100%] blur-3xl"></div>
              {/* Mockup de la barra de Chrome */}
              <div className="bg-[#1E1E20] border border-white/10 rounded-full px-5 py-3 flex items-center gap-6 shadow-2xl z-10">
                <div className="flex items-center gap-3">
                  <Icon icon="logos:chrome" className="text-xl" />
                  <span className="text-sm text-neutral-200">app.freeshot.com está compartiendo tu pantalla.</span>
                </div>
                <div className="flex gap-4 border-l border-white/10 pl-4">
                  <span className="text-sm text-blue-400 font-medium cursor-pointer hover:text-blue-300">Dejar de compartir</span>
                  <span className="text-sm text-blue-400 font-medium cursor-pointer hover:text-white transition-colors relative group/btn">
                    Ocultar
                    {/* Cursor Falso apuntando a Ocultar */}
                    <Icon icon="solar:cursor-default-bold" className="absolute -bottom-4 -right-2 text-white text-xl drop-shadow-md" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PASO 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-2 lg:order-1">
            <div className="aspect-video bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden flex flex-col items-center justify-center relative group shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-t from-red-500/5 via-transparent to-transparent"></div>
              {/* Pestaña Falsa */}
              <div className="absolute top-6 left-6 right-6 h-10 bg-[#141414] border border-white/10 rounded-md flex items-center px-4 gap-3 shadow-lg">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></div>
                <span className="text-sm text-neutral-400 font-mono">🔴 Grabando en 3...</span>
              </div>
              <span className="text-[120px] font-light text-white tracking-tighter mt-12">
                3
              </span>
            </div>
          </div>
          <div className="order-1 lg:order-2">
            <div className="flex items-center gap-5 mb-6">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white font-light text-2xl shrink-0">
                3
              </span>
              <h3 className="text-3xl md:text-4xl font-light tracking-tight text-white">
                Prepárate para la acción
              </h3>
            </div>
            <p className="text-lg text-neutral-400 mb-10 leading-relaxed font-light">
              No hay prisa. Una vez que apruebes los permisos en el paso 1, iniciaremos una cuenta regresiva de 4 segundos. Verás el indicador en la pestaña del navegador para que sepas exactamente cuándo empezar a hablar o mover el mouse.
            </p>
          </div>
        </div>

        {/* PASO 4 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div className="order-1 lg:order-1">
            <div className="flex items-center gap-5 mb-6">
              <span className="flex items-center justify-center w-14 h-14 rounded-full bg-white/5 border border-white/10 text-white font-light text-2xl shrink-0">
                4
              </span>
              <h3 className="text-3xl md:text-4xl font-light tracking-tight text-white">
                Corte y al editor
              </h3>
            </div>
            <p className="text-lg text-neutral-400 mb-10 leading-relaxed font-light">
              Cuando termines tu explicación, simplemente detén la grabación. El archivo no se descargará de inmediato; pasará mágicamente a nuestro editor web para que apliques zooms, fondos y recortes.
            </p>
            {/* BOTÓN DE ACCIÓN REAL */}
            <button className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-transparent border border-red-500/50 text-red-500 hover:bg-red-500/10 transition-colors font-medium rounded-md text-lg w-full sm:w-auto">
              <div className="w-4 h-4 bg-red-500 rounded-sm"></div>
              Detener Grabación
            </button>
          </div>
          <div className="order-2 lg:order-2">
            <div className="aspect-video bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden flex items-center justify-center relative group shadow-2xl">
              <div className="absolute top-1/2 left-0 w-full h-[1px] bg-white/5"></div>
              <div className="absolute top-0 left-1/2 w-[1px] h-full bg-white/5"></div>
              
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/30 rounded-full flex items-center justify-center backdrop-blur-sm relative shadow-[0_0_40px_rgba(239,68,68,0.15)] z-10 group-hover:bg-red-500/20 transition-all duration-500">
                <div className="absolute inset-0 rounded-full border border-red-500/50 animate-ping opacity-20"></div>
                <div className="w-6 h-6 bg-red-500 rounded-sm"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}