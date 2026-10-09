import React, { useState } from 'react';
import { MessageCircle, X, ExternalLink, Phone, Send, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const WhatsAppModal: React.FC = () => {
  const { openWhatsAppModal, setOpenWhatsAppModal, commissionConfig } = useApp();
  const [customMsg, setCustomMsg] = useState('');

  if (!openWhatsAppModal) return null;

  const quickTopics = [
    { title: '📦 Consultar estado de mi pedido', msg: 'Hola NEGRITO DE HUÁNUCO, deseo consultar el estado de mi envío.' },
    { title: '💼 Cotización para empresas o tiendas', msg: 'Hola, tengo una tienda en Huánuco y quiero cotizar envíos frecuentes.' },
    { title: '🏍️ Ayuda para repartidores', msg: 'Hola NEGRITO DE HUÁNUCO, soy repartidor y necesito soporte con mi cuenta.' },
    { title: '🚨 Reportar un inconveniente', msg: 'Hola, necesito asistencia urgente con un servicio en curso.' },
  ];

  const handleOpenWhatsApp = (text: string) => {
    const cleanNumber = commissionConfig.whatsappNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(text || 'Hola NEGRITO DE HUÁNUCO, solicito información de delivery.')}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-700 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <MessageCircle className="w-6 h-6 fill-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Atención WhatsApp Huánuco</h3>
              <p className="text-xs text-emerald-200">Asistencia inmediata de lunes a domingo</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setOpenWhatsAppModal(false)}
            className="p-1.5 text-emerald-200 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="text-xs text-slate-600">
            Selecciona un tema frecuente o escribe tu consulta directa a nuestra central en Huánuco:
          </div>

          <div className="space-y-2">
            {quickTopics.map((topic, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleOpenWhatsApp(topic.msg)}
                className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between text-xs font-semibold text-slate-800 group"
              >
                <span>{topic.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0" />
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              O escribe tu mensaje personalizado:
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={customMsg}
                onChange={(e) => setCustomMsg(e.target.value)}
                placeholder="Escribe tu consulta aquí..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              />
              <button
                type="button"
                onClick={() => handleOpenWhatsApp(customMsg)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-500 text-center font-mono">
            Número oficial de soporte: <span className="font-bold text-slate-800">976 387 226</span>
          </div>

          <div className="pt-2">
            <a
              href="https://wa.me/51976387226?text=Hola%20NEGRITO%20DE%20HU%C3%81NUCO%2C%20necesito%20soporte%20y%20asistencia."
              target="_blank"
              rel="noreferrer"
              className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md"
            >
              <span>📲 ABRIR CONVERSACIÓN EN WHATSAPP (976 387 226)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
