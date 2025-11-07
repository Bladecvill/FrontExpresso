// src/components/MainLayout.jsx

import React from 'react';
// 1. IMPORTAR NavLink para o estilo de link "ativo"
import { Outlet, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CardsResumoContainer from './CardsResumoContainer'; //

function MainLayout() {
  const { utilizador, logout } = useAuth(); //

  return (
    <div className="app-layout">
      
      {/* 1. SIDEBAR (Menu de Navegação) */}
      <nav className="app-sidebar">
        <div className="sidebar-header">
          <h2>Expresso Finance</h2>
        </div>

        <div className="sidebar-nav">
          {/* Usamos NavLink em vez de Link para a classe "active" */}
          <NavLink to="/" className="nav-link" end>
            Dashboard
          </NavLink>
          <NavLink to="/contas" className="nav-link">
            Minhas Contas
          </NavLink>
          <NavLink to="/transacoes" className="nav-link">
            Transações
          </NavLink>
          <NavLink to="/metas" className="nav-link">
            Metas
          </NavLink>
          <NavLink to="/transferencias" className="nav-link">
            Transferências
          </NavLink>
          <NavLink to="/perfil" className="nav-link">
            Perfil
          </NavLink>
        </div>
        
        <div className="sidebar-footer">
          <button onClick={logout} className="btn btn-logout">
            Sair (Logout)
          </button>
        </div>
      </nav>

      {/* 2. ÁREA DE CONTEÚDO (Header + Página) */}
      <div className="app-content-wrapper">
        
        {/* 2a. Header (Saudação + Cards) */}
        <header className="app-header">
          <h2>Olá, {utilizador.nome}!</h2>
          {/* O container de cards agora fica aqui dentro */}
          <CardsResumoContainer /> 
        </header>

        {/* 2b. Conteúdo da Página (renderizado pelo <Outlet>) */}
        <main className="app-content">
          <Outlet /> {/* HomePage, ContasPage, etc. aparecem aqui */}
        </main>
        
      </div>
    </div>
  );
}

export default MainLayout;