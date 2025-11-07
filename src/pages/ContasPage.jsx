// src/pages/ContasPage.jsx

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import FormCriarConta from '../components/FormCriarConta'; //

function ContasPage() {
  const { contas, loading, refreshContas } = useData(); //
  const { utilizador } = useAuth(); //
  const [mostrarForm, setMostrarForm] = useState(false); //

  if (loading) {
    return <div>A carregar dados...</div>;
  }

  return (
    <>
      {/* 1. Cabeçalho da Página */}
      <div className="page-header">
        <h2>Gestão de Contas Corrente</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className={`btn ${mostrarForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {mostrarForm ? 'Fechar Formulário' : 'Adicionar Nova Conta'}
        </button>
      </div>

      {/* 2. Formulário de "Criar Conta" (que abre e fecha) */}
      {mostrarForm && (
        <div className="card form-criar-conta"> {/* Aplicamos a classe .card */}
          <FormCriarConta
            clienteId={utilizador.id}
            onContaCriada={() => {
              refreshContas();
              setMostrarForm(false);
            }}
          />
        </div>
      )}

      {/* 3. Lista de Contas (Grid de Cards) */}
      <ul className="contas-list">
        {contas.length > 0 ? (
          contas.map(conta => (
            // O Card de Conta Individual
            <li key={conta.id} className="conta-item-card">
              <div className="conta-item-header">
                <h3>{conta.nome}</h3>
                <span>{conta.tipoConta.replace('_', ' ')}</span>
              </div>
              <p className="conta-item-saldo">
                R$ {conta.saldoAtual.toFixed(2)}
              </p>
              <p className="conta-item-detalhe">
                (Saldo de Abertura: R$ {conta.saldoAbertura.toFixed(2)})
              </p>
            </li>
          ))
        ) : (
          !mostrarForm && (
            <p className="empty-state">
              Nenhuma conta encontrada. Comece adicionando uma nova conta!
            </p>
          )
        )}
      </ul>
    </>
  );
}

export default ContasPage;