// src/pages/TransacoesPage.jsx

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import FormCriarTransacao from '../components/FormCriarTransacao';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

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

function TransacoesPage() {
  const { 
    contas, 
    categorias, 
    transacoes, 
    loading, 
    refreshDadosTransacao
  } = useData();
  const { utilizador } = useAuth();
  
  // --- ESTADOS DA PÁGINA (ADICIONADOS) ---
  const [mostrarTodas, setMostrarTodas] = useState(false);
  const [mostrarForm, setMostrarForm] = useState(false);

  // Lógica de ordenação e visibilidade (sem mudança)
  const transacoesOrdenadas = useMemo(() => {
    return [...transacoes]
      .sort((a, b) => new Date(b.dataOperacao) - new Date(a.dataOperacao)); 
  }, [transacoes]);

  const visibleTransacoes = useMemo(() => {
    if (mostrarTodas) {
      return transacoesOrdenadas;
    }
    return transacoesOrdenadas.slice(0, 10); // Mostra as 10 últimas
  }, [transacoesOrdenadas, mostrarTodas]);

  // Lógica para Deletar (sem mudança)
  const handleDeletar = async (transacaoId) => {
    if (!window.confirm('Tem certeza que deseja deletar esta transação?')) {
      return;
    }
    try {
      await axios.delete(`${API_BASE_URL}/transacoes/${transacaoId}`, {
        data: { clienteId: utilizador.id }
      });
      alert('Transação deletada com sucesso!');
      refreshDadosTransacao(); // Atualiza tudo (transações, contas, metas)
    } catch (error) {
      console.error('Erro ao deletar transação:', error);
      alert('Erro ao deletar: ' + (error.response?.data || 'Erro desconhecido.'));
    }
  };

  // Mapas para consulta rápida (nome da categoria e conta)
  const mapCategorias = useMemo(() => 
    new Map(categorias.map(c => [c.id, c.nome])), 
  [categorias]);
  
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
        <h2>Histórico de Transações</h2>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className={`btn ${mostrarForm ? 'btn-secondary' : 'btn-primary'}`}
        >
          {mostrarForm ? 'Fechar Formulário' : 'Adicionar Transação'}
        </button>
      </div>

      {/* 2. Formulário de "Criar Transação" (que abre e fecha) */}
      {mostrarForm && (
        <div className="card"> {/* O formulário já tem padding interno */}
          <FormCriarTransacao
            onTransacaoCriada={() => {
              refreshDadosTransacao();
              setMostrarForm(false);
            }}
          />
        </div>
      )}

      {/* 3. A Lista de Transações (Refatorada) */}
      <ul className="transacoes-list">
        {visibleTransacoes.length > 0 ? (
          visibleTransacoes.map(transacao => {
            const isReceita = transacao.tipo === 'RECEITA';
            const nomeCategoria = mapCategorias.get(transacao.categoriaId) || 'Sem Categoria';
            const nomeConta = mapContas.get(transacao.contaId) || 'Conta Deletada';

            return (
              <li key={transacao.id} className="transacao-item">
                
                {/* Ícone (Esquerda) */}
                <div className={`transacao-icon ${isReceita ? 'receita' : 'despesa'}`}>
                  {isReceita ? 'R' : 'D'}
                </div>

                {/* Detalhes (Meio) */}
                <div className="transacao-detalhes">
                  <strong>{transacao.descricao}</strong>
                  <p>{nomeCategoria} | {nomeConta}</p>
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

                {/* Botão Deletar (Extrema Direita) */}
                <button
                  onClick={() => handleDeletar(transacao.id)}
                  className="btn-deletar-transacao"
                  title="Deletar transação"
                >
                  &times; {/* Um "X" para deletar */}
                </button>
              </li>
            );
          })
        ) : (
          <li className="empty-state" style={{ padding: '2rem' }}>
            Nenhuma transação encontrada.
          </li>
        )}
      </ul>

      {/* Botão "Mostrar Todas" */}
      {transacoesOrdenadas.length > 10 && (
        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button onClick={() => setMostrarTodas(!mostrarTodas)} className="btn btn-secondary">
            {mostrarTodas ? 'Mostrar menos' : `Mostrar todas (${transacoesOrdenadas.length})`}
          </button>
        </div>
      )}
    </>
  );
}

export default TransacoesPage;