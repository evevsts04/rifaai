import React, { useState, useEffect } from 'react';
import { 
  Ticket, PlusCircle, Users, ArrowLeft, 
  CheckCircle, TrendingUp, User, Phone, X, 
  Award, Copy, Trash2, ExternalLink,
  ShoppingCart, AlertCircle, Lock, LogOut
} from 'lucide-react';

// --- Importações do Firebase ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, signInAnonymously, signInWithEmailAndPassword, 
  onAuthStateChanged, signOut, signInWithCustomToken 
} from 'firebase/auth';
import { 
  getFirestore, collection, doc, setDoc, 
  onSnapshot, updateDoc, deleteDoc 
} from 'firebase/firestore';

// --- Configuração do Firebase ---
// ⚠️ ATENÇÃO: Substitua os valores abaixo pelas credenciais do SEU projeto Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDa3x2I1_t6SRmxi2jbLL-HaV9Dk2U3TuU",
  authDomain: "rifaai-61c2e.firebaseapp.com",
  projectId: "rifaai-61c2e",
  storageBucket: "rifaai-61c2e.firebasestorage.app",
  messagingSenderId: "557459423486",
  appId: "1:557459423486:web:8ee4abe36a78d2166e65af"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// Define o caminho do banco de dados (Suporta o simulador e o seu projeto real)
const getRafflesCol = () => {
  if (typeof __firebase_config !== 'undefined') {
    return collection(db, 'artifacts', appId, 'public', 'data', 'raffles');
  }
  return collection(db, 'raffles');
};

// --- Utilitários ---
const BR_NAMES = [
  "Alice", "Miguel", "Sophia", "Arthur", "Helena", "Davi", "Valentina", "Heitor", "Laura", "Gabriel",
  "Isabella", "Bernardo", "Manuela", "Lorenzo", "Júlia", "Enzo", "Heloísa", "Pedro", "Luiza", "Lucas",
  "Maria Eduarda", "Matheus", "Lorena", "Kauã", "Lívia", "Isaac", "Giovanna", "Lucca", "Maria Luiza", "Rafael"
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

// 0. Tela de Login do Admin
const AdminLogin = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Credenciais inválidas. Verifique seu email e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="!p-2"><ArrowLeft size={20} /></Button>
        <h2 className="text-2xl font-bold text-gray-800">Acesso Restrito</h2>
      </div>

      <Card>
        <div className="flex flex-col items-center mb-6">
          <div className="bg-indigo-50 p-4 rounded-full mb-3 text-indigo-600">
            <Lock size={32} />
          </div>
          <p className="text-gray-500 text-center text-sm">Faça login com sua conta de administrador para criar e gerenciar rifas.</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-4 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input 
              required type="email" placeholder="admin@rifadigital.com"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={email} onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input 
              required type="password" placeholder="••••••••"
              className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={password} onChange={e => setPassword(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full mt-2" disabled={loading}>
            {loading ? 'Autenticando...' : 'Entrar no Painel'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

// 1. Lista Pública de Rifas (O que o cliente vê)
const PublicList = ({ raffles, onOpenPublicView }) => {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto py-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Rifas Disponíveis</h1>
        <p className="text-gray-500 text-lg">Participe e concorra a prêmios incríveis. Escolha uma rifa abaixo para começar!</p>
      </div>

      {raffles.length === 0 ? (
        <div className="text-center p-12 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">Nenhuma rifa disponível no momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {raffles.map(raffle => {
            const soldTickets = raffle.tickets.filter(t => t.status === 'reserved').length;
            const isSoldOut = soldTickets >= raffle.totalTickets;

            return (
              <Card key={raffle.id} className="hover:shadow-xl transition-shadow flex flex-col border-2 border-transparent hover:border-indigo-100">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                    <Award size={14} /> Prêmio: {raffle.prize}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 line-clamp-1 mb-4">{raffle.title}</h3>
                
                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-500">Valor do Bilhete</span>
                    <span className="font-bold text-lg text-indigo-600">{formatCurrency(raffle.price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Disponíveis</span>
                    <span className="font-medium text-gray-800">{raffle.totalTickets - soldTickets} bilhetes</span>
                  </div>
                </div>

                <div className="mt-auto pt-2">
                  <Button 
                    className="w-full" 
                    variant={isSoldOut ? 'secondary' : 'primary'}
                    disabled={isSoldOut}
                    onClick={() => onOpenPublicView(raffle.id)}
                  >
                    {isSoldOut ? 'Esgotada' : 'Participar Agora'}
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

// 2. Dashboard Principal (Admin)
const Dashboard = ({ raffles, onCreateClick, onManageClick }) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Painel de Gestão</h2>
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

// 3. Criar Nova Rifa (Admin)
const CreateRaffle = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '', description: '', prize: '', price: '', totalTickets: 100, type: 'numbers', maxPerUser: 0
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
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Título da Rifa</label>
            <input id="title" name="title" required type="text" placeholder="Ex: Rifa Solidária"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          <div>
            <label htmlFor="prize" className="block text-sm font-medium text-gray-700 mb-1">Prêmio</label>
            <input id="prize" name="prize" required type="text" placeholder="Ex: iPhone 15"
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              value={formData.prize} onChange={e => setFormData({...formData, prize: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">Valor por Bilhete (R$)</label>
              <input id="price" name="price" required type="number" step="0.01" min="0.10" placeholder="Ex: 10.00"
                className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Tipo da Rifa</label>
              <select id="type" name="type" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.type}
                onChange={e => {
                  const newType = e.target.value;
                  setFormData({...formData, type: newType, totalTickets: newType === 'names' && formData.totalTickets > 100 ? 100 : formData.totalTickets});
                }}
              >
                <option value="numbers">Números</option>
                <option value="names">Nomes</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label htmlFor="totalTickets" className="block text-sm font-medium text-gray-700 mb-1">Quantidade</label>
              <select id="totalTickets" name="totalTickets" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.totalTickets} onChange={e => setFormData({...formData, totalTickets: e.target.value})}
              >
                <option value={50}>50</option>
                <option value={100}>100</option>
                {formData.type === 'numbers' && (<><option value={200}>200</option><option value={500}>500</option></>)}
              </select>
            </div>
            <div>
              <label htmlFor="maxPerUser" className="block text-sm font-medium text-gray-700 mb-1">Limite por Pessoa</label>
              <select id="maxPerUser" name="maxPerUser" className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                value={formData.maxPerUser} onChange={e => setFormData({...formData, maxPerUser: e.target.value})}
              >
                <option value={0}>Sem limite</option>
                {[1,2,3,4,5,10].map(n => <option key={n} value={n}>{n} bilhetes</option>)}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea id="description" name="description" rows={3} placeholder="Detalhes..."
              className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none"
              value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
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

// 4. Administração da Rifa (Admin)
const AdminRaffle = ({ raffle, onBack, onOpenPublicView, onUpdateTicketStatus, onDelete }) => {
  const [toastMessage, setToastMessage] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  if (!raffle) return null;

  const soldTickets = raffle.tickets.filter(t => t.status === 'reserved').length;
  const totalRevenue = soldTickets * raffle.price;
  const potentialRevenue = raffle.totalTickets * raffle.price;

  const handleCopyLink = () => {
    // Ajustado para funcionar em produção (copia a URL atual)
    const url = window.location.href;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            setToastMessage('Link copiado!');
            setTimeout(() => setToastMessage(''), 3000);
        });
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-gray-800 text-white px-6 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle size={18} className="text-emerald-400" />
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={onBack} className="!p-2"><ArrowLeft size={20} /></Button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{raffle.title}</h2>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleCopyLink} icon={Copy}>Copiar Link</Button>
          <Button variant="primary" onClick={() => onOpenPublicView(raffle.id)} icon={ExternalLink}>Ver Página</Button>
        </div>
      </div>

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
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-gray-800">Painel de Números</h3>
            <div className="flex gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-emerald-500"></div> Livre</span>
              <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500"></div> Vendido</span>
            </div>
          </div>
          <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {raffle.tickets.map(ticket => (
              <div key={ticket.number} title={ticket.label}
                className={`aspect-square rounded-lg flex items-center justify-center font-semibold text-xs sm:text-sm border-2 p-1 text-center break-words
                  ${ticket.status === 'available' ? 'border-emerald-100 bg-emerald-50 text-emerald-700' : 'border-red-100 bg-red-50 text-red-700'}
                `}
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
              <div className="text-center text-gray-500 mt-10">Nenhum bilhete vendido.</div>
            ) : (
              raffle.tickets.filter(t => t.status === 'reserved').reverse().map(ticket => (
                <div key={ticket.number} className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex justify-between items-center group">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded text-xs truncate max-w-[80px]">{ticket.label}</span>
                      <span className="font-medium text-gray-800 text-sm line-clamp-1">{ticket.buyerName}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-1"><Phone size={12}/> {ticket.buyerPhone}</div>
                  </div>
                  <button onClick={() => onUpdateTicketStatus(raffle.id, ticket.number, 'available')}
                    className="text-red-500 hover:bg-red-100 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" title="Cancelar Reserva"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
      
      {showConfirmDelete ? (
        <div className="mt-8 pt-6 border-t border-red-100 flex flex-col sm:flex-row gap-4 items-center justify-between bg-red-50 p-4 rounded-xl">
          <span className="text-red-700 font-medium">Tem certeza que deseja excluir esta rifa?</span>
          <div className="flex gap-2">
             <Button variant="secondary" onClick={() => setShowConfirmDelete(false)}>Cancelar</Button>
             <Button variant="danger" onClick={() => onDelete(raffle.id)}>Sim, excluir</Button>
          </div>
        </div>
      ) : (
        <div className="mt-8 pt-6 border-t border-red-100">
           <Button variant="danger" icon={Trash2} onClick={() => setShowConfirmDelete(true)}>Excluir Rifa</Button>
        </div>
      )}
    </div>
  );
};

// 5. Visão Pública (Página de Vendas)
const PublicRaffleView = ({ raffle, onReserve, onBack }) => {
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
      <div className="max-w-4xl mx-auto flex justify-between items-center mb-4">
        <button onClick={onBack} className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium">
          <ArrowLeft size={18} /> Voltar para lista
        </button>
      </div>

      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl overflow-hidden relative">
        {errorMsg && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-10 flex items-center gap-2">
               <AlertCircle size={16} /> {errorMsg}
            </div>
        )}

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

        <div className="p-6 md:p-10">
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-xl font-bold text-gray-800">Escolha {raffle.type === 'names' ? 'os nomes' : 'os números'}</h2>
            <div className="flex gap-4 text-sm font-medium">
              <span className="flex items-center gap-2 text-emerald-600"><div className="w-4 h-4 rounded-full bg-emerald-100 border-2 border-emerald-500"></div> Livre</span>
              <span className="flex items-center gap-2 text-indigo-600"><div className="w-4 h-4 rounded-full bg-indigo-100 border-2 border-indigo-500"></div> Selecionado</span>
              <span className="flex items-center gap-2 text-gray-400"><div className="w-4 h-4 rounded-full bg-gray-100 border-2 border-gray-300"></div> Reservado</span>
            </div>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2 sm:gap-3">
            {raffle.tickets.map(ticket => {
              const isSelected = selectedTickets.find(t => t.number === ticket.number);
              return (
                <button key={ticket.number} disabled={ticket.status !== 'available'} onClick={() => handleToggleTicket(ticket)} title={ticket.label}
                  className={`aspect-square rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm transition-all transform active:scale-95 p-1 text-center break-words
                    ${isSelected ? 'bg-indigo-600 border-2 border-indigo-700 text-white shadow-md scale-105' 
                      : ticket.status === 'available' ? 'bg-emerald-50 border-2 border-emerald-400 text-emerald-700 hover:bg-emerald-100 hover:shadow-md cursor-pointer' 
                      : 'bg-gray-100 border-2 border-gray-200 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {ticket.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedTickets.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.1)] p-4 z-40">
          <div className="max-w-4xl mx-auto flex flex-row justify-between items-center gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium">
                Selecionados: <span className="text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded">{selectedTickets.length}</span>
              </p>
              <p className="text-xl sm:text-2xl font-bold text-gray-800">{formatCurrency(selectedTickets.length * raffle.price)}</p>
            </div>
            <Button onClick={() => setShowModal(true)} icon={ShoppingCart} className="px-6 py-3 text-lg shadow-indigo-200 shadow-lg">
              Reservar
            </Button>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white text-center">
              <h3 className="text-xl font-bold">Concluir Reserva</h3>
              <p className="text-indigo-100 mt-1">Você está garantindo {selectedTickets.length} bilhete(s)</p>
            </div>
            
            <form onSubmit={submitReservation} className="p-6 space-y-4">
              <div>
                <label htmlFor="buyerName" className="block text-sm font-medium text-gray-700 mb-1">Seu Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input id="buyerName" name="buyerName" required autoFocus type="text" placeholder="Ex: João da Silva"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={buyerData.name} onChange={e => setBuyerData({...buyerData, name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="buyerPhone" className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input id="buyerPhone" name="buyerPhone" required type="tel" placeholder="(00) 00000-0000"
                    className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={buyerData.phone} onChange={e => setBuyerData({...buyerData, phone: e.target.value})}
                  />
                </div>
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

// --- App Principal (Conectado ao Firebase) ---
export default function App() {
  const [currentView, setCurrentView] = useState('publicList');
  const [activeRaffleId, setActiveRaffleId] = useState(null);
  
  // Estados do Firebase
  const [raffles, setRaffles] = useState([]);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Inicializa a Autenticação
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Ambiente de simulação
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          // Se não estiver logado como admin, faz login anônimo para poder ler/escrever dados públicos
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        }
      } catch (error) {
        console.error("Erro de autenticação:", error);
      }
    };
    initAuth();

    // Monitora o status do usuário (Se tem e-mail, é o Admin)
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // É admin apenas se não for um usuário anônimo
      if (currentUser && !currentUser.isAnonymous) {
        setIsAdmin(true);
        setCurrentView('dashboard');
      } else {
        setIsAdmin(false);
        setCurrentView('publicList');
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. Busca os dados do Firestore em tempo real
  useEffect(() => {
    if (!user) return; // Só busca se tiver autenticado (mesmo que anonimamente)

    const unsubscribe = onSnapshot(getRafflesCol(), (snapshot) => {
      const rafflesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      // Ordena pelas mais recentes
      rafflesData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setRaffles(rafflesData);
      setLoading(false);
    }, (error) => {
      console.error("Erro ao buscar rifas:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Ações do Firebase
  const handleCreateRaffle = async (newRaffle) => {
    if (!isAdmin) return;
    try {
      await setDoc(doc(getRafflesCol(), newRaffle.id), newRaffle);
      setCurrentView('dashboard');
    } catch (e) {
      console.error("Erro ao criar:", e);
    }
  };

  const handleDeleteRaffle = async (id) => {
    if (!isAdmin) return;
    try {
      await deleteDoc(doc(getRafflesCol(), id));
      setCurrentView('dashboard');
    } catch (e) {
      console.error("Erro ao deletar:", e);
    }
  };

  const handleReserveTicket = async (raffleId, ticketNumbersArray, buyerData) => {
    const raffle = raffles.find(r => r.id === raffleId);
    if (!raffle) return;

    // Atualiza a lista de tickets localmente
    const updatedTickets = raffle.tickets.map(t => 
      ticketNumbersArray.includes(t.number)
        ? { ...t, status: 'reserved', buyerName: buyerData.name, buyerPhone: buyerData.phone } 
        : t
    );

    // Salva no banco de dados
    try {
      await updateDoc(doc(getRafflesCol(), raffleId), { tickets: updatedTickets });
    } catch (e) {
      console.error("Erro ao reservar:", e);
    }
  };

  const handleUpdateTicketStatus = async (raffleId, ticketNumber, newStatus) => {
    if (!isAdmin) return;
    const raffle = raffles.find(r => r.id === raffleId);
    if (!raffle) return;

    const updatedTickets = raffle.tickets.map(t => 
      t.number === ticketNumber ? { ...t, status: newStatus, buyerName: '', buyerPhone: '' } : t
    );

    try {
      await updateDoc(doc(getRafflesCol(), raffleId), { tickets: updatedTickets });
    } catch (e) {
      console.error("Erro ao atualizar status:", e);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    // Volta a ser um usuário anônimo
    await signInAnonymously(auth);
  };

  // Renderização principal
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-indigo-600 font-bold">Carregando sistema...</div>;
  }

  // Se for a tela de visualização pública completa, removemos o cabeçalho padrão
  if (currentView === 'publicRaffle') {
    return (
      <PublicRaffleView 
        raffle={raffles.find(r => r.id === activeRaffleId)} 
        onReserve={handleReserveTicket}
        onBack={() => setCurrentView(isAdmin ? 'adminRaffle' : 'publicList')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-indigo-600 text-white shadow-md sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div 
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            onClick={() => setCurrentView(isAdmin ? 'dashboard' : 'publicList')}
          >
            <div className="bg-white p-1.5 rounded-lg text-indigo-600">
              <Ticket size={24} />
            </div>
            RifaDigital
          </div>
          <div className="flex items-center gap-4 text-sm font-medium">
             {isAdmin ? (
               <>
                 <span className="hidden sm:inline-block text-indigo-200">Painel do Administrador</span>
                 <button onClick={handleLogout} className="flex items-center gap-1 bg-indigo-700 hover:bg-indigo-800 px-3 py-1.5 rounded-lg transition-colors">
                   <LogOut size={16} /> Sair
                 </button>
               </>
             ) : (
               <button onClick={() => setCurrentView('login')} className="flex items-center gap-1 bg-indigo-500 hover:bg-indigo-700 px-3 py-1.5 rounded-lg transition-colors">
                 <Lock size={16} /> Acesso Admin
               </button>
             )}
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        {currentView === 'login' && <AdminLogin onBack={() => setCurrentView('publicList')} />}
        
        {currentView === 'publicList' && (
          <PublicList 
            raffles={raffles} 
            onOpenPublicView={(id) => { setActiveRaffleId(id); setCurrentView('publicRaffle'); }} 
          />
        )}

        {currentView === 'dashboard' && isAdmin && (
          <Dashboard 
            raffles={raffles} 
            onCreateClick={() => setCurrentView('create')} 
            onManageClick={(id) => { setActiveRaffleId(id); setCurrentView('adminRaffle'); }}
          />
        )}

        {currentView === 'create' && isAdmin && (
          <CreateRaffle onSave={handleCreateRaffle} onCancel={() => setCurrentView('dashboard')} />
        )}

        {currentView === 'adminRaffle' && isAdmin && (
          <AdminRaffle 
            raffle={raffles.find(r => r.id === activeRaffleId)} 
            onBack={() => setCurrentView('dashboard')}
            onOpenPublicView={(id) => { setActiveRaffleId(id); setCurrentView('publicRaffle'); }}
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