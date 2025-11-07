// src/pages/TransferenciasPage.jsx

import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import FormFazerTransferencia from '../components/FormFazerTransferencia';

// Função de AJUDA para formatar a data (sem mudança)
function formatarData(dataISO) {
  if (!dataISO) return '';
  return new Date(dataISO).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function TransferenciasPage() {
  const { 
    contas, // Precisamos do nome das contas
    transacoes, 
    loading, 
    refreshDadosTransacao // Usamos a função de refresh mais completa
  } = useData();

  // --- ESTADOS DA PÁGINA ---
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false); // NOVO ESTADO

  // Lógica de filtragem e ordenação (sem mudança)
  const transferenciasOrdenadas = useMemo(() => {
    return transacoes
      .filter(t => t.nomeCategoria === 'Transferências') //
      .sort((a, b) => new Date(b.dataOperacao) - new Date(a.dataOperacao)); 
  }, [transacoes]);

  const visibleTransferencias = useMemo(() => {
    if (mostrarTodas) {
      return transferenciasOrdenadas;
    }
    return transferenciasOrdenadas.slice(0, 10);
  }, [transferenciasOrdenadas, mostrarTodas]);

  // Mapa para consulta rápida do nome da conta
  const mapContas = useMemo(() => 
    new Map(contas.map(c => [c.id, c.nome])), 
  [contas]);

  if (loading) {
    return <div>A carregar dados...</div>;
  }

  // --- O NOVO JSX ESTILIZADO ---
  return (
    <>
      {/* 1. Cabeçalho da Página */}
      <div className="page-header">
        <h2>Transferências entre Contas</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className={`btn ${mostrarForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {mostrarForm ? 'Fechar Formulário' : 'Fazer Transferência'}
        </button>
      </div>

      {/* 2. Formulário de "Fazer Transferência" (que abre e fecha) */}
      {mostrarForm && (
        <div className="card"> {/* O formulário já tem padding interno */}
          <FormFazerTransferencia
            onTransferenciaFeita={() => {
              refreshDadosTransacao(); // Atualiza tudo
              setMostrarForm(false);
            }}
          />
        </div>
      )}

      {/* 3. A Lista de Transações (Refatorada com classes) */}
      <ul className="transacoes-list">
        {visibleTransferencias.length > 0 ? (
          visibleTransferencias.map(transacao => {
            
            // LÓGICA CORRIGIDA: Usamos o 'tipo' da transação
            // (O seu código original usava transacao.valor > 0)
            const isReceita = transacao.tipo === 'RECEITA'; 
            const nomeConta = mapContas.get(transacao.contaId) || 'Conta Deletada';

            return (
              <li key={transacao.id} className="transacao-item">
                
                {/* Ícone (Esquerda) */}
                <div className={`transacao-icon ${isReceita ? 'receita' : 'despesa'}`}>
                  {isReceita ? 'E' : 'S'} {/* E = Entrada, S = Saída */}
                </div>

                {/* Detalhes (Meio) */}
                <div className="transacao-detalhes">
                  <strong>
                    {isReceita ? 'Entrada de Transferência' : 'Saída de Transferência'}
                  </strong>
                  <p>Conta: {nomeConta}</p>
                </div>

                {/* Valor e Data (Direita) */}
                <div className="transacao-info">
                  <div className={`transacao-valor ${isReceita ? 'receita' : 'despesa'}`}>
                    {isReceita ? '+' : '-'} R$ {transacao.valor.toFixed(2)}
                  </div>
                  <div className="transacao-data">
                    {formatarData(transacao.dataOperacao)}
                  </div>
                </div>
              </li>
            );
          })
        ) : (
          <li className="empty-state" style={{ padding: '2rem' }}>
            Nenhuma transferência encontrada.
          </li>
        )}
      </ul>

      {/* Botão "Mostrar Todas" */}
      {transferenciasOrdenadas.length > 10 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => setMostrarTodas(!mostrarTodas)} className="btn btn-secondary">
            {mostrarTodas ? 'Mostrar menos' : `Mostrar todas (${transferenciasOrdenadas.length})`}
          </button>
        </div>
      )}
    </>
  );
}

export default TransferenciasPage;