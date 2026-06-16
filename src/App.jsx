"use client";

import React, { useState } from 'react';
import { 
  Ticket, PlusCircle, Users, ArrowLeft, 
  CheckCircle, TrendingUp, User, Phone, X, 
  Award, Copy, Trash2, ExternalLink,
  ShoppingCart, AlertCircle
} from 'lucide-react';

// --- Utilitários ---
const BR_NAMES = [
  "Alice", "Miguel", "Sophia", "Arthur", "Helena", "Davi", "Valentina", "Heitor", "Laura", "Gabriel",
  "Isabella", "Bernardo", "Manuela", "Lorenzo", "Júlia", "Enzo", "Heloísa", "Pedro", "Luiza", "Lucas",
  "Maria Eduarda", "Matheus", "Lorena", "Kauã", "Lívia", "Isaac", "Giovanna", "Lucca", "Maria Luiza", "Rafael",
  "Isadora", "Nicolas", "Antonella", "João", "Nicolly", "Guilherme", "Cecília", "Samuel", "Maitê", "Theo",
  "Ana Clara", "Gustavo", "Maria Clara", "Murilo", "Emanuelly", "Pietro", "Ana Júlia", "Daniel", "Ana Luiza", "Anthony",
  "Sarah", "Felipe", "Beatriz", "Henrique", "Clara", "Carlos", "Maria Alice", "Eduardo", "Rebeca", "Victor",
  "Letícia", "Leonardo", "Mariana", "Caio", "Ana Laura", "Thiago", "Marina", "Ian", "Melissa", "Rodrigo",
  "Gabriela", "Diego", "Yasmin", "Otávio", "Eduarda", "Emanuel", "Isabelly", "Bryan", "Ana", "Caleb",
  "Alícia", "Antônio", "Vitória", "Vicente", "Bárbara", "Augusto", "Carolina", "Francisco", "Emilly", "João Miguel",
  "Amanda", "João Pedro", "Evelyn", "João Lucas", "Agatha", "Enzo Gabriel", "Bianca", "Pedro Henrique", "Mirella", "Benício"
];

const padNumber = (num, max) => {
  const len = max.toString().length;
  return num.toString().padStart(len, '0');
};

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

// --- Componentes Compartilhados ---
const Button = ({ children, onClick, variant = 'primary', className = '', icon: Icon, disabled = false, type = 'button' }) => {
  const baseStyle = "flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow",
    danger: "bg-red-50 text-red-600 hover:bg-red-100",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100"
  };

  return (
    <button type={type} onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`} disabled={disabled}>
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
    {children}
  </div>
);

// --- Visões do App ---

// 1. Dashboard Principal
const Dashboard = ({ raffles, onCreateClick, onManageClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Minhas Rifas</h2>
          <p className="text-gray-500 text-sm mt-1">Gerencie suas campanhas e acompanhe as vendas.</p>
        </div>
        <Button onClick={onCreateClick} icon={PlusCircle}>Nova Rifa</Button>
      </div>

      {raffles.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="bg-indigo-50 p-4 rounded-full mb-4">
            <Ticket size={32} className="text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">Nenhuma rifa criada</h3>
          <p className="text-gray-500 mt-2 max-w-sm mb-6">Você ainda não possui nenhuma rifa. Crie sua primeira campanha para começar a vender.</p>
          <Button onClick={onCreateClick} icon={PlusCircle}>Criar Minha Primeira Rifa</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map(raffle => {
            const soldTickets = raffle.tickets.filter(t => t.status === 'reserved').length;
            const progress = (soldTickets / raffle.totalTickets) * 100;

            return (
              <Card key={raffle.id} className="hover:shadow-md transition-shadow flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Award size={14} /> Prêmio: {raffle.prize}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1">{raffle.title}</h3>
                <div className="mt-4 space-y-2 flex-grow">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Progresso</span>
                    <span className="font-medium">{soldTickets} de {raffle.totalTickets}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-500 pt-2 flex flex-col">
                    <span>Valor: <strong className="text-gray-800">{formatCurrency(raffle.price)}</strong> / bilhete</span>
                    {raffle.maxPerUser > 0 && <span className="text-orange-500">Limite: {raffle.maxPerUser} por pessoa</span>}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Button variant="secondary" className="w-full" onClick={() => onManageClick(raffle.id)}>
                    Gerenciar Rifa
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

// 2. Criar Nova Rifa
const CreateRaffle = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize: '',
    price: '',
    totalTickets: 100,
    type: 'numbers', // numbers | names
    maxPerUser: 0 // 0 = sem limite
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.prize || !formData.price || !formData.totalTickets) return;
    
    const isNames = formData.type === 'names';
    const newRaffle = {
      id: Date.now().toString(),
      ...formData,
      price: parseFloat(formData.price),
      totalTickets: parseInt(formData.totalTickets),
      maxPerUser: parseInt(formData.maxPerUser),
      createdAt: new Date().toISOString(),
      tickets: Array.from({ length: parseInt(formData.totalTickets) }, (_, i) => ({
        number: i + 1,
        label: isNames ? BR_NAMES[i] || `Nome ${i+1}` : padNumber(i + 1, formData.totalTickets),
        status: 'available',
        buyerName: '',
        buyerPhone: ''
      }))
    };
    onSave(newRaffle);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onCancel} className="!p-2"><ArrowLeft size={20} /></Button>
        <h2 className="text-2xl font-bold text-gray-800">Criar Nova Rifa</h2>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Título da Rifa</label>
            <input 
              required
              type="text" 
              placeholder="Ex: Rifa Solidária - Fim de Ano"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prêmio</label>
            <input 
              required
              type="text" 
              placeholder="Ex: iPhone 15 Pro Max"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              value={formData.prize}
              onChange={e => setFormData({...formData, prize: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Bilhete (R$)</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0.10"
                placeholder="Ex: 10.00"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo da Rifa</label>
              <select 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.type}
                onChange={e => {
                  const newType = e.target.value;
                  setFormData({
                    ...formData, 
                    type: newType,
                    totalTickets: newType === 'names' && formData.totalTickets > 100 ? 100 : formData.totalTickets
                  });
                }}
              >
                <option value="numbers">Números (ex: 001, 002)</option>
                <option value="names">Nomes (ex: Alice, Miguel)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade de {formData.type === 'names' ? 'Nomes' : 'Bilhetes'}</label>
              <select 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.totalTickets}
                onChange={e => setFormData({...formData, totalTickets: e.target.value})}
              >
                <option value={50}>50 {formData.type === 'names' ? 'nomes' : 'números'}</option>
                <option value={100}>100 {formData.type === 'names' ? 'nomes' : 'números'}</option>
                {formData.type === 'numbers' && (
                  <>
                    <option value={200}>200 números</option>
                    <option value={500}>500 números</option>
                    <option value={1000}>1000 números</option>
                  </>
                )}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Compras por Pessoa</label>
              <select 
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                value={formData.maxPerUser}
                onChange={e => setFormData({...formData, maxPerUser: e.target.value})}
              >
                <option value={0}>Sem limite</option>
                <option value={1}>1 bilhete</option>
                <option value={2}>2 bilhetes</option>
                <option value={3}>3 bilhetes</option>
                <option value={4}>4 bilhetes</option>
                <option value={5}>5 bilhetes</option>
                <option value={10}>10 bilhetes</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição (Opcional)</label>
            <textarea 
              rows={3}
              placeholder="Regras, data do sorteio, detalhes do prêmio..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all resize-none"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" icon={CheckCircle}>Salvar Rifa</Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

// 3. Administração da Rifa
const AdminRaffle = ({ raffle, onBack, onOpenPublicView, onUpdateTicketStatus, onDelete }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!raffle) return null;

  const soldTickets = raffle.tickets.filter(t => t.status === 'reserved').length;
  const totalRevenue = soldTickets * raffle.price;
  const potentialRevenue = raffle.totalTickets * raffle.price;

  const handleCopyLink = () => {
    const dummyUrl = `${window.location.origin}/?raffle=${raffle.id}`;
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(dummyUrl).then(() => {
            setToastMessage('Link copiado!');
            setTimeout(() => setToastMessage(''), 3000);
        });
    } else {
        const textArea = document.createElement("textarea");
        textArea.value = dummyUrl;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            setToastMessage('Link copiado!');
            setTimeout(() => setToastMessage(''), 3000);
        } catch (err) {
            console.error('Falha ao copiar', err);
        }
        document.body.removeChild(textArea);
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle size={18} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="!p-2"><ArrowLeft size={20} /></Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{raffle.title}</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Award size={14} className="text-indigo-500" /> {raffle.prize}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleCopyLink} icon={Copy}>Copiar Link</Button>
          <Button variant="primary" onClick={() => onOpenPublicView(raffle.id)} icon={ExternalLink}>Página de Vendas</Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 !border-none text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-indigo-100 text-sm font-medium mb-1">Arrecadação Atual</p>
              <h3 className="text-3xl font-bold">{formatCurrency(totalRevenue)}</h3>
            </div>
            <div className="bg-white/20 p-2 rounded-lg"><TrendingUp size={24} /></div>
          </div>
          <p className="text-indigo-100 text-sm mt-4">Meta: {formatCurrency(potentialRevenue)}</p>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Bilhetes Vendidos</p>
              <h3 className="text-3xl font-bold text-gray-800">{soldTickets} <span className="text-lg text-gray-400 font-normal">/ {raffle.totalTickets}</span></h3>
            </div>
            <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><Ticket size={24} /></div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${(soldTickets / raffle.totalTickets) * 100}%` }}></div>
          </div>
        </Card>

        <Card>
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Valor do Bilhete</p>
              <h3 className="text-3xl font-bold text-gray-800">{formatCurrency(raffle.price)}</h3>
            </div>
            <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><Users size={24} /></div>
          </div>
        </Card>
      </div>

      {/* Lista de Compradores e Painel de Números */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Painel de Números</h3>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Disponível</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Vendido</span>
            </div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {raffle.tickets.map(ticket => (
              <div 
                key={ticket.number}
                className={`
                  aspect-square rounded-lg flex items-center justify-center font-semibold text-xs sm:text-sm border-2 transition-all p-1 text-center break-words
                  ${ticket.status === 'available' 
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-700' 
                    : 'border-red-100 bg-red-50 text-red-700'
                  }
                `}
                title={ticket.label}
              >
                {ticket.label}
              </div>
            ))}
          </div>
        </Card>

        <Card className="flex flex-col h-[580px]">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-indigo-600"/> Últimas Vendas
          </h3>
          <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {raffle.tickets.filter(t => t.status === 'reserved').length === 0 ? (
              <div className="text-center text-gray-500 mt-10">Nenhum bilhete vendido ainda.</div>
            ) : (
              raffle.tickets.filter(t => t.status === 'reserved').reverse().map(ticket => (
                <div key={ticket.number} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded text-xs truncate max-w-[80px]">
                        {ticket.label}
                      </span>
                      <span className="font-medium text-gray-800 text-sm line-clamp-1">{ticket.buyerName}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                      <Phone size={12}/> {ticket.buyerPhone}
                    </div>
                  </div>
                  <button 
                    onClick={() => onUpdateTicketStatus(raffle.id, ticket.number, 'available')}
                    className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Cancelar Reserva"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
      
      {/* Zona de Perigo */}
      {showConfirmDelete ? (
        <div className="mt-8 pt-6 border-t border-red-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-red-50 p-4 rounded-xl">
          <span className="text-red-700 font-medium">Tem certeza que deseja excluir esta rifa? Esta ação não pode ser desfeita.</span>
          <div className="flex gap-2">
             <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>Cancelar</Button>
             <Button variant="danger" onClick={() => onDelete(raffle.id)}>Sim, excluir</Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 pt-6 border-t border-red-100">
           <Button variant="danger" icon={Trash2} onClick={() => setShowConfirmDelete(true)}>
             Excluir Rifa Permanentemente
           </Button>
        </div>
      )}
    </div>
  );
};

// 4. Visão Pública (Página de Vendas simulada)
const PublicRaffleView = ({ raffle, onReserve, onBackToAdmin }) => {
  const [selectedTickets, setSelectedTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [buyerData, setBuyerData] = useState({ name: '', phone: '' });
  const [errorMsg, setErrorMsg] = useState('');

  if (!raffle) return null;

  const handleToggleTicket = (ticket) => {
    if (ticket.status !== 'available') return;
    setErrorMsg('');

    const isSelected = selectedTickets.find(t => t.number === ticket.number);
    
    if (isSelected) {
      setSelectedTickets(selectedTickets.filter(t => t.number !== ticket.number));
    } else {
      if (raffle.maxPerUser > 0 && selectedTickets.length >= raffle.maxPerUser) {
        setErrorMsg(`Limite de ${raffle.maxPerUser} bilhete(s) por pessoa.`);
        setTimeout(() => setErrorMsg(''), 3000);
        return;
      }
      setSelectedTickets([...selectedTickets, ticket]);
    }
  };

  const submitReservation = (e) => {
    e.preventDefault();
    if (!buyerData.name || !buyerData.phone || selectedTickets.length === 0) return;
    
    const ticketNumbers = selectedTickets.map(t => t.number);
    onReserve(raffle.id, ticketNumbers, buyerData);
    
    setSelectedTickets([]);
    setBuyerData({ name: '', phone: '' });
    setShowModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 pb-24">
      <div className="max-w-4xl mx-auto bg-indigo-600 text-white text-sm font-medium px-4 py-2 rounded-t-2xl flex justify-between items-center">
        <span>Modo de Visualização do Cliente</span>
        <button onClick={onBackToAdmin} className="text-indigo-100 hover:text-white underline text-xs">Voltar ao Admin</button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-b-2xl rounded-t-none overflow-hidden relative">
        {errorMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-10 flex items-center gap-2">
               <AlertCircle size={16} /> {errorMsg}
            </div>
        )}

        {/* Header da Rifa Pública */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-6 md:p-10 border-b border-indigo-100 text-center">
          <div className="inline-flex items-center gap-2 bg-white text-indigo-600 px-4 py-2 rounded-full font-bold shadow-sm mb-6 border border-indigo-100">
            <Award size={18} /> Prêmio: {raffle.prize}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{raffle.title}</h1>
          {raffle.description && <p className="text-gray-600 max-w-2xl mx-auto mb-6">{raffle.description}</p>}
          
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 text-lg">
            <span className="bg-white border border-gray-200 px-6 py-3 rounded-xl font-bold text-gray-800 shadow-sm flex flex-col">
              <span className="text-gray-500 font-normal text-sm">Por bilhete</span>
              {formatCurrency(raffle.price)}
            </span>
            {raffle.maxPerUser > 0 && (
               <span className="bg-orange-50 border border-orange-100 text-orange-700 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2">
                 <AlertCircle size={16} /> Limite: {raffle.maxPerUser} por pessoa
               </span>
            )}
          </div>
        </div>

        {/* Seleção de Números */}
        <div className="p-6 md:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800">Escolha {raffle.type === 'names' ? 'os nomes' : 'os números'}</h2>
            <div className="flex gap-4 text-sm font-medium">
              <span className="flex items-center gap-2 text-emerald-600">
                <div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500"></div> Livre
              </span>
              <span className="flex items-center gap-2 text-indigo-600">
                <div className="w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500"></div> Selecionado
              </span>
              <span className="flex items-center gap-2 text-gray-400">
                <div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-300"></div> Reservado
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
            {raffle.tickets.map(ticket => {
              const isSelected = selectedTickets.find(t => t.number === ticket.number);
              return (
                <button
                  key={ticket.number}
                  disabled={ticket.status !== 'available'}
                  onClick={() => handleToggleTicket(ticket)}
                  className={`
                    aspect-square rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all transform active:scale-95 p-1 text-center break-words
                    ${isSelected 
                      ? 'bg-indigo-600 border-2 border-indigo-700 text-white shadow-md scale-105' 
                      : ticket.status === 'available' 
                        ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:shadow-md cursor-pointer' 
                        : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                  title={ticket.label}
                >
                  {ticket.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Floating Checkout Bar */}
      {selectedTickets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] p-4 z-40">
          <div className="max-w-4xl mx-auto flex flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Selecionados: <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{selectedTickets.length}</span>
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">
                {formatCurrency(selectedTickets.length * raffle.price)}
              </p>
            </div>
            <Button onClick={() => setShowModal(true)} icon={ShoppingCart} className="px-6 py-3 text-lg shadow-indigo-200 shadow-lg">
              Reservar
            </Button>
          </div>
        </div>
      )}

      {/* Modal de Reserva */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white text-center">
              <h3 className="text-xl font-bold">Concluir Reserva</h3>
              <p className="text-indigo-100 mt-1">Você está garantindo {selectedTickets.length} bilhete(s)</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3 max-h-24 overflow-y-auto custom-scrollbar">
                {selectedTickets.map(t => (
                   <span key={t.number} className="bg-indigo-800 px-2 py-1 rounded text-sm font-bold">
                     {t.label}
                   </span>
                ))}
              </div>
            </div>
            
            <form onSubmit={submitReservation} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Seu Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required autoFocus
                    type="text" placeholder="Ex: João da Silva"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={buyerData.name} onChange={e => setBuyerData({...buyerData, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input 
                    required
                    type="tel" placeholder="(00) 00000-0000"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                    value={buyerData.phone} onChange={e => setBuyerData({...buyerData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-indigo-50 p-4 rounded-xl text-indigo-800 flex justify-between items-center">
                <span className="font-medium">Total a pagar:</span>
                <span className="text-xl font-bold">{formatCurrency(selectedTickets.length * raffle.price)}</span>
              </div>

              <div className="pt-2 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Voltar</Button>
                <Button type="submit" variant="primary" className="flex-1" icon={CheckCircle}>Confirmar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- App Principal ---
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeRaffleId, setActiveRaffleId] = useState(null);
  
  const [raffles, setRaffles] = useState([
    {
      id: '1',
      title: 'Ação Solidária - Smart TV 55"',
      description: 'Participe e concorra a uma TV novinha para sua sala!',
      prize: 'Smart TV 55" 4K',
      price: 15.00,
      totalTickets: 100,
      type: 'numbers',
      maxPerUser: 4,
      createdAt: new Date().toISOString(),
      tickets: Array.from({ length: 100 }, (_, i) => ({
        number: i + 1,
        label: padNumber(i + 1, 100),
        status: i === 4 || i === 12 || i === 42 ? 'reserved' : 'available',
        buyerName: i === 4 ? 'Maria Oliveira' : (i === 12 ? 'Carlos Santos' : (i === 42 ? 'Ana Costa' : '')),
        buyerPhone: i === 4 ? '(11) 99999-1111' : (i === 12 ? '(21) 98888-2222' : (i === 42 ? '(31) 97777-3333' : ''))
      }))
    }
  ]);

  const activeRaffle = raffles.find(r => r.id === activeRaffleId);

  const handleCreateRaffle = (newRaffle) => {
    setRaffles([newRaffle, ...raffles]);
    setCurrentView('dashboard');
  };

  const handleDeleteRaffle = (id) => {
    setRaffles(raffles.filter(r => r.id !== id));
    setCurrentView('dashboard');
  };

  const handleReserveTicket = (raffleId, ticketNumbersArray, buyerData) => {
    setRaffles(raffles.map(r => {
      if (r.id === raffleId) {
        return {
          ...r,
          tickets: r.tickets.map(t => 
            ticketNumbersArray.includes(t.number)
              ? { ...t, status: 'reserved', buyerName: buyerData.name, buyerPhone: buyerData.phone } 
              : t
          )
        };
      }
      return r;
    }));
  };

  const handleUpdateTicketStatus = (raffleId, ticketNumber, newStatus) => {
    setRaffles(raffles.map(r => {
      if (r.id === raffleId) {
        return {
          ...r,
          tickets: r.tickets.map(t => 
            t.number === ticketNumber 
              ? { ...t, status: newStatus, buyerName: '', buyerPhone: '' } 
              : t
          )
        };
      }
      return r;
    }));
  };

  if (currentView === 'publicRaffle') {
    return (
      <PublicRaffleView 
        raffle={activeRaffle} 
        onReserve={handleReserveTicket}
        onBackToAdmin={() => setCurrentView('adminRaffle')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
          >
            <div className="bg-white p-1.5 rounded-lg text-indigo-600">
              <Ticket size={24} />
            </div>
            RifaDigital
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
             <span className="hidden sm:inline-block text-indigo-200">Painel do Administrador</span>
             <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center border border-indigo-400">
                <User size={16} />
             </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentView === 'dashboard' && (
          <Dashboard 
            raffles={raffles} 
            onCreateClick={() => setCurrentView('create')} 
            onManageClick={(id) => {
              setActiveRaffleId(id);
              setCurrentView('adminRaffle');
            }}
          />
        )}

        {currentView === 'create' && (
          <CreateRaffle 
            onSave={handleCreateRaffle} 
            onCancel={() => setCurrentView('dashboard')} 
          />
        )}

        {currentView === 'adminRaffle' && (
          <AdminRaffle 
            raffle={activeRaffle} 
            onBack={() => setCurrentView('dashboard')}
            onOpenPublicView={(id) => {
              setActiveRaffleId(id);
              setCurrentView('publicRaffle');
            }}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onDelete={handleDeleteRaffle}
          />
        )}
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
    </div>
  );
}