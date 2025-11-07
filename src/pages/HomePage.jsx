// src/pages/HomePage.jsx

import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import ProgressBar from '../components/ProgressBar'; // 1. IMPORTAR O PROGRESSBAR

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement, 
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2'; 
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

// (O registro do ChartJS não muda)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement, 
  Title,
  Tooltip,
  Legend
);

// (A função de cores não muda)
const CORES_GRAFICO = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#E7E9ED', '#8B0000', '#006400', '#00008B'
];

function HomePage() {
  // 2. PEGAR AS METAS DO CONTEXTO
  const { transacoes, categorias, metas } = useData();
  const [tipoGrafico, setTipoGrafico] = useState('pizza'); // Inicia com Pizza
  
  // (O useMemo dos dadosGrafico não muda)
  const dadosGrafico = useMemo(() => {
    // ... (toda a sua lógica de cálculo de gráfico) ...
    // (O CÓDIGO INTERNO DO useMemo NÃO MUDA)
    //
    const hoje = new Date();
    const inicioMes = startOfMonth(hoje);
    const fimMes = endOfMonth(hoje);

    // Filtra transações para o mês corrente
    const transacoesMes = transacoes.filter(t => {
      const dataTransacao = parseISO(t.data);
      return dataTransacao >= inicioMes && dataTransacao <= fimMes;
    });

    // 1. DADOS PARA GRÁFICO DE PIZZA (por Categoria)
    const mapCategorias = new Map(categorias.map(c => [c.id, c.nome]));
    const receitasPorCategoria = new Map();
    const despesasPorCategoria = new Map();

    transacoesMes.forEach(t => {
      const nomeCat = mapCategorias.get(t.categoriaId) || 'Sem Categoria';
      const valor = t.valor;

      if (t.tipo === 'RECEITA') {
        receitasPorCategoria.set(nomeCat, (receitasPorCategoria.get(nomeCat) || 0) + valor);
      } else if (t.tipo === 'DESPESA') {
        despesasPorCategoria.set(nomeCat, (despesasPorCategoria.get(nomeCat) || 0) + valor);
      }
    });

    const dataPizzaReceitas = {
      labels: Array.from(receitasPorCategoria.keys()),
      datasets: [{
        data: Array.from(receitasPorCategoria.values()),
        backgroundColor: CORES_GRAFICO,
      }]
    };

    const dataPizzaDespesas = {
      labels: Array.from(despesasPorCategoria.keys()),
      datasets: [{
        data: Array.from(despesasPorCategoria.values()),
        backgroundColor: CORES_GRAFICO,
      }]
    };

    // 2. DADOS PARA GRÁFICO DE BARRA (Receita x Despesa)
    // (Lógica de exemplo)
    const dataBarras = {
      labels: ['Mês Atual'],
      datasets: [
        {
          label: 'Receitas',
          data: [Array.from(receitasPorCategoria.values()).reduce((a, b) => a + b, 0)],
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
        },
        {
          label: 'Despesas',
          data: [Array.from(despesasPorCategoria.values()).reduce((a, b) => a + b, 0)],
          backgroundColor: 'rgba(255, 99, 132, 0.6)',
        },
      ],
    };

    // 3. DADOS PARA GRÁFICO DE LINHA (Saldo ao longo do tempo)
    // (Lógica de exemplo)
    const dataLinha = {
      labels: ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4'],
      datasets: [{
        label: 'Saldo',
        data: [1000, 1200, 1100, 1500],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }]
    };
    
    return { dataPizzaReceitas, dataPizzaDespesas, dataBarras, dataLinha };
  }, [transacoes, categorias]);
  
  // 3. FUNÇÃO AUXILIAR PARA CALCULAR % DA META
  const calcularProgressoMeta = (meta) => {
    if (meta.tipoMeta === 'ECONOMIA') {
      // (Exemplo: Saldo Atual vs Valor Alvo)
      // Esta lógica precisa ser ajustada com seus dados reais
      return (meta.valorAtual / meta.valorAlvo) * 100;
    }
    // TODO: Adicionar lógica para outros tipos de meta
    return 0;
  };

  // --- O NOVO JSX RENDERIZADO ---
  return (
    <>
      <h2>Dashboard</h2>

      {/* Grid para os cards de conteúdo */}
      <div className="home-grid">

        {/* Card dos Gráficos (Ocupa as 2 colunas) */}
        <div className="card chart-card">
          <h4>Balanço Mensal</h4>
          
          {/* Botões de seleção do gráfico */}
          <div className="btn-group" role="group">
            <button 
              type="button" 
              className={`btn ${tipoGrafico === 'pizza' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTipoGrafico('pizza')}
            >
              Categorias (Pizza)
            </button>
            <button 
              type="button" 
              className={`btn ${tipoGrafico === 'barra' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTipoGrafico('barra')}
            >
              Receita vs Despesa (Barra)
            </button>
            <button 
              type="button" 
              className={`btn ${tipoGrafico === 'linha' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setTipoGrafico('linha')}
            >
              Evolução (Linha)
            </button>
          </div>

          <hr />

          {/* Renderização dos Gráficos */}
          {tipoGrafico === 'barra' && (
            <div style={{ maxWidth: '800px', margin: 'auto' }}>
              <Bar data={dadosGrafico.dataBarras} />
            </div>
          )}

          {tipoGrafico === 'linha' && (
            <div style={{ maxWidth: '800px', margin: 'auto' }}>
              <Line data={dadosGrafico.dataLinha} />
            </div>
          )}

          {tipoGrafico === 'pizza' && (
            <div style={{ display: 'flex', justifyContent: 'space-around' }}>
              <div style={{ width: '45%' }}>
                <h5>Despesas por Categoria</h5>
                {dadosGrafico.dataPizzaDespesas.labels.length > 0 ? (
                  <Doughnut data={dadosGrafico.dataPizzaDespesas} />
                ) : (
                  <p>Nenhuma despesa encontrada.</p>
                )}
              </div>
              <div style={{ width: '45%' }}>
                <h5>Receitas por Categoria</h5>
                {dadosGrafico.dataPizzaReceitas.labels.length > 0 ? (
                  <Doughnut data={dadosGrafico.dataPizzaReceitas} />
                ) : (
                  <p>Nenhuma receita encontrada.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 4. NOVO CARD DE METAS (Ocupa 1 coluna) */}
        <div className="card metas-card">
          <h4>Minhas Metas</h4>
          <ul className="metas-list">
            {metas.length > 0 ? (
              metas.slice(0, 3).map(meta => { // Mostra as 3 primeiras
                const progresso = calcularProgressoMeta(meta);
                return (
                  <li key={meta.id}>
                    <div className="metas-list-header">
                      <span>{meta.nome}</span>
                      <span>R$ {meta.valorAtual.toFixed(2)} / R$ {meta.valorAlvo.toFixed(2)}</span>
                    </div>
                    <ProgressBar percentual={progresso} />
                  </li>
                );
              })
            ) : (
              <p>Nenhuma meta cadastrada.</p>
            )}
          </ul>
        </div>
      </div>
    </>
  );
}

export default HomePage;