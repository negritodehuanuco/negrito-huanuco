import React, { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Bike,
  ShieldCheck,
  Phone,
  Clock,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const ServiceChatModal: React.FC = () => {
  const {
    activeChatOrderId,
    chatSenderRole,
    closeChatModal,
    orders,
    sendChatMessage,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const order = orders.find((o) => o.id === activeChatOrderId);

  // Auto-scroll to bottom whenever messages change
  useEffect(() => {
    if (activeChatOrderId) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [order?.chatMessages, activeChatOrderId]);

  if (!activeChatOrderId || !order) return null;

  // Check if service is closed for new messages
  const isServiceClosed = order.status === 'entregado' || order.status === 'cancelado';

  const driver = order.driver;
  const isSenderClient = chatSenderRole === 'client';

  const otherPartyName = isSenderClient ? (driver?.name || 'Repartidor') : order.customer.name;
  const otherPartyRole = isSenderClient ? 'Repartidor / Conductor' : 'Cliente';
  const vehicleInfo = driver?.vehicle || 'Vehículo asignado';
  const vehicleTypeEmoji = driver?.vehicle.toLowerCase().includes('mototaxi') || driver?.vehicle.toLowerCase().includes('torito') ? '🛺' : '🏍️';

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isServiceClosed) return;
    sendChatMessage(order.id, inputText, chatSenderRole);
    setInputText('');
  };

  const quickPills = isSenderClient
    ? ['Ya estoy en la puerta', '¿Aproximadamente cuánto falta?', 'Por favor tocar el timbre', 'Estoy atento al celular']
    : ['Ya voy en camino', 'Llego en 3 minutos', 'Estoy en la puerta', 'Hay tráfico pero ya llego'];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col h-[600px] max-h-[92vh]">
        {/* Chat Header */}
        <div className="bg-slate-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            {isSenderClient && driver?.photo ? (
              <img
                src={driver.photo}
                alt={driver.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-500 shadow-md shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-lg shadow-md shrink-0">
                {isSenderClient ? <Bike className="w-6 h-6" /> : otherPartyName.charAt(0)}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base text-white truncate max-w-[180px] sm:max-w-[220px]">
                  {otherPartyName}
                </h3>
                {isSenderClient && (
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3" /> Verificado
                  </span>
                )}
              </div>

              {/* Show vehicle type according to prompt requirement */}
              <div className="text-xs text-amber-400 font-semibold flex items-center gap-1.5 mt-0.5">
                <span>{vehicleTypeEmoji}</span>
                <span>{vehicleInfo}</span>
                {driver?.plate && (
                  <span className="text-slate-400 font-normal">· {driver.plate}</span>
                )}
              </div>

              <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isServiceClosed ? 'bg-slate-500' : 'bg-emerald-400 animate-pulse'}`} />
                <span>
                  {isServiceClosed
                    ? `Servicio ${order.status}`
                    : `Servicio en curso (${order.id})`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {isSenderClient && driver?.phone && !isServiceClosed && (
              <a
                href={`tel:${driver.phone}`}
                className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors"
                title="Llamar al chofer"
              >
                <Phone className="w-4 h-4" />
              </a>
            )}

            <button
              type="button"
              onClick={closeChatModal}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info banner about current order status */}
        <div className="bg-slate-100 px-4 py-2 text-[11px] text-slate-600 flex items-center justify-between border-b border-slate-200">
          <span className="font-semibold text-slate-700">
            {isSenderClient ? 'Chat con tu conductor asignado' : 'Chat con el cliente del pedido'}
          </span>
          <span className="font-mono text-slate-500">
            Tarifa: S/ {order.pricing.servicePrice.toFixed(2)}
          </span>
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {(!order.chatMessages || order.chatMessages.length === 0) && (
            <div className="text-center py-10 space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 mx-auto flex items-center justify-center">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div className="text-xs font-bold text-slate-700">
                Inicia la conversación con {otherPartyName}
              </div>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Puedes coordinar referencias de entrega, tiempos o detalles de tu servicio en Huánuco.
              </p>
            </div>
          )}

          {order.chatMessages?.map((msg) => {
            const isMe = msg.sender === chatSenderRole;

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="text-[10px] text-slate-400 px-1 font-medium">
                  {isMe ? 'Tú' : msg.senderName} · {msg.timestamp}
                </div>

                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed shadow-xs ${
                    isMe
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-xs'
                      : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Message Pills (only if service active) */}
        {!isServiceClosed && (
          <div className="px-3 py-1.5 bg-white border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickPills.map((pill, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  sendChatMessage(order.id, pill, chatSenderRole);
                }}
                className="text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-amber-100 hover:text-amber-950 px-2.5 py-1 rounded-lg shrink-0 transition-colors border border-slate-200"
              >
                {pill}
              </button>
            ))}
          </div>
        )}

        {/* Footer: Input Form OR Closed State */}
        {isServiceClosed ? (
          <div className="p-4 bg-slate-100 border-t border-slate-200 text-center space-y-1">
            <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-700">
              <Lock className="w-4 h-4 text-slate-500" />
              <span>El servicio ha finalizado ({order.status === 'entregado' ? 'Entregado' : 'Cancelado'})</span>
            </div>
            <p className="text-[11px] text-slate-500">
              El chat se encuentra cerrado para nuevos mensajes de acuerdo a las políticas de seguridad.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSend}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Escribe un mensaje para ${otherPartyName}...`}
              className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-md shrink-0 cursor-pointer"
            >
              <span>Enviar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
