// src/components/MainLayout.jsx

import React from 'react'; // Removido 'useMemo' e 'useData'
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 1. IMPORTAR O NOSSO NOVO CONTAINER
import CardsResumoContainer from './CardsResumoContainer';

// --- O Layout Principal (AGORA MAIS LIMPO) ---
function MainLayout() {
  const { utilizador, logout } = useAuth(); // Para o "Olá" e o "Sair"

  return (
    <div>
      <header>
        <h2>Olá, {utilizador.nome}!</h2>
        <button onClick={logout}>Sair (Logout)</button>
        <hr />

        {/* A Barra de Navegação (as "Abas") (sem mudança) */}
        <nav>
          <Link to="/"><button>Dashboard</button></Link>
          <Link to="/contas"><button>Minhas Contas</button></Link>
          <Link to="/transacoes"><button>Transações</button></Link>
          <Link to="/metas"><button>Metas</button></Link>
          <Link to="/transferencias"><button>Transferências</button></Link>
          <Link to="/perfil"><button>Perfil</button></Link>
        </nav>

        <hr />

        {/* 2. RENDERIZAR O NOVO CONTAINER DE CARDS */}
        {/* O SaldoTotalCard foi removido e substituído por isto */}
        <CardsResumoContainer />

      </header>

      <main>
        {/* <Outlet> (sem mudança) */}
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;