// src/pages/ContasPage.jsx

import React, { useState } from 'react'; // 1. IMPORTAR useState
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import FormCriarConta from '../components/FormCriarConta';

function ContasPage() {
  const { 
    contas, 
    loading, 
    refreshContas
  } = useData();
  const { utilizador } = useAuth();

  // 2. NOVO ESTADO para controlar o formulário
  const [mostrarForm, setMostrarForm] = useState(false);

  if (loading) {
    return <div>A carregar dados...</div>;
  }

  return (
    <div>
      <h2>Gestão de Contas Corrente</h2>

      <p>Adicione novas contas (ex: Nubank, Bradesco) ou visualize os saldos das suas contas existentes. O "Card de Saldo Total" (acima) soma todas estas contas.</p>

      <hr />

      {/* 3. NOVO BOTÃO para mostrar/esconder */}
      <button onClick={() => setMostrarForm(!mostrarForm)}>
        {mostrarForm ? 'Fechar Formulário' : 'Adicionar Nova Conta'}
      </button>

      {/* 4. O FORMULÁRIO AGORA É CONDICIONAL */}
      {mostrarForm && (
        <FormCriarConta
          clienteId={utilizador.id}
          // 5. ATUALIZADO: Fecha o form após o sucesso
          onContaCriada={() => {
            refreshContas();
            setMostrarForm(false); 
          }} 
        />
      )}

      <hr />

      {/* A lista de contas (sem mudança) */}
      <h3>As Minhas Contas</h3>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {contas.length > 0 ? (
          contas.map(conta => (
            <li key={conta.id} style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
              <strong style={{ fontSize: '1.2em' }}>{conta.nome}</strong>
              <br />
              <span>Saldo Atual: R$ {conta.saldoAtual.toFixed(2)}</span>
              <br />
              <span style={{ fontSize: '0.9em', color: '#555' }}>
                (Saldo de Abertura: R$ {conta.saldoAbertura.toFixed(2)})
              </span>
            </li>
          ))
        ) : (
          <p>Nenhuma conta corrente encontrada (além da "Carteira" padrão).</p>
        )}
      </ul>

    </div>
  );
}

export default ContasPage;