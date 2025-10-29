// src/pages/HomePage.jsx

import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';

// 1. Imports do Chart.js (ADICIONAR ArcElement)
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement, // <-- 1. IMPORTAR PARA PIZZA/DOUGHNUT
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
// ADICIONAR Doughnut
import { Bar, Line, Doughnut } from 'react-chartjs-2'; // <-- 2. IMPORTAR DOUGHNUT

// 2. Imports da biblioteca de datas
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

// 3. REGISTAR o ArcElement
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement, // <-- 3. REGISTAR AQUI
  Title,
  Tooltip,
  Legend
);

// 4. FUNÇÃO DE AJUDA PARA CORES (para o gráfico de pizza)
// (Vamos usar cores pré-definidas para ficar mais bonito)
const CORES_GRAFICO = [
  '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
  '#FF9F40', '#E7E9ED', '#8B0000', '#006400', '#00008B'
];

// --- O Componente Principal do Dashboard ---
function HomePage() {
  // A. Pega os dados globais
  const { contas, transacoes, loading } = useData();

  // B. ESTADOS DOS FILTROS
  const [tipoGrafico, setTipoGrafico] = useState('barras'); // 'barras', 'linha', 'pizza'
  const [contaId, setContaId] = useState('todas');
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  // C. A LÓGICA DE PROCESSAMENTO DE DADOS (O "Cérebro")
  const dadosGrafico = useMemo(() => {

    const dataInicioObj = parseISO(dataInicio + 'T00:00:00');
    const dataFimObj = parseISO(dataFim + 'T23:59:59');

    // 1. Filtra as transações (sem mudança)
    const transacoesFiltradas = transacoes.filter(t => {
      const dataOp = parseISO(t.dataOperacao);
      const dentroDaData = dataOp >= dataInicioObj && dataOp <= dataFimObj;
      if (!dentroDaData) return false;
      if (contaId !== 'todas' && t.contaId !== contaId) {
        return false;
      }
      return true;
    });

    // 2. Lógica para BARRAS (sem mudança)
    let totalReceitas = 0;
    let totalDespesas = 0;
    transacoesFiltradas
      .filter(t => t.nomeCategoria !== 'Transferências')
      .forEach(t => {
        if (t.valor > 0) totalReceitas += t.valor;
        else totalDespesas += t.valor;
      });
    const dataBarras = { /* ... (código existente) ... */
      labels: ['Resumo do Período'],
      datasets: [
        { label: 'Total Receitas', data: [totalReceitas], backgroundColor: '#198754' },
        { label: 'Total Despesas', data: [Math.abs(totalDespesas)], backgroundColor: '#dc3545' },
      ],
    };

    // 3. Lógica para LINHA (sem mudança)
    // ... (cálculo do saldoInicial) ...
    // ... (cálculo das transacoesPorDia) ...
    // ... (montagem dos dataPointsLinha) ...
    const dataLinha = { /* ... (código existente, demasiado longo para colar) ... */ 
      labels: ['Início'], // Placeholder, o seu código real é mais complexo
      datasets: [{ label: 'Evolução do Saldo', data: [0], fill: true }],
    };
    // (VAMOS REUTILIZAR A LÓGICA DO GRÁFICO DE LINHA QUE VOCÊ JÁ TEM)
    // (Abaixo está a lógica completa do gráfico de linha, do passo anterior)
    let saldoInicial = 0;
    contas
      .filter(c => contaId === 'todas' || c.id === contaId)
      .forEach(c => saldoInicial += c.saldoAbertura);
    transacoes
      .filter(t => {
        const dataOp = parseISO(t.dataOperacao);
        const filtroConta = (contaId === 'todas' || t.contaId === contaId);
        return dataOp < dataInicioObj && filtroConta;
      })
      .forEach(t => saldoInicial += t.valor);

    let saldoCorrente = saldoInicial;
    const labelsLinha = ['Início'];
    const dataPointsLinha = [saldoInicial];
    const transacoesPorDia = {};
    transacoesFiltradas
      .sort((a, b) => parseISO(a.dataOperacao) - parseISO(b.dataOperacao))
      .forEach(t => {
        const dia = format(parseISO(t.dataOperacao), 'dd/MM/yyyy');
        if (!transacoesPorDia[dia]) transacoesPorDia[dia] = 0;
        transacoesPorDia[dia] += t.valor;
      });
    for (const dia in transacoesPorDia) {
      saldoCorrente += transacoesPorDia[dia];
      labelsLinha.push(dia);
      dataPointsLinha.push(saldoCorrente);
    }
    dataLinha.labels = labelsLinha;
    dataLinha.datasets[0].data = dataPointsLinha;


    // 4. NOVA LÓGICA: GRÁFICOS DE PIZZA (O que você pediu)

    // 4.1. Agrega Despesas por Categoria
    const despesasPorCategoria = transacoesFiltradas
      .filter(t => t.valor < 0 && t.nomeCategoria !== 'Transferências')
      .reduce((acc, t) => {
        const nome = t.nomeCategoria;
        if (!acc[nome]) {
          acc[nome] = 0;
        }
        acc[nome] += Math.abs(t.valor); // Soma o valor absoluto
        return acc;
      }, {});

    // 4.2. Agrega Receitas por Categoria
    const receitasPorCategoria = transacoesFiltradas
      .filter(t => t.valor > 0 && t.nomeCategoria !== 'Transferências')
      .reduce((acc, t) => {
        const nome = t.nomeCategoria;
        if (!acc[nome]) {
          acc[nome] = 0;
        }
        acc[nome] += t.valor;
        return acc;
      }, {});

    // 4.3. Formata os dados para o Chart.js
    const dataPizzaDespesas = {
      labels: Object.keys(despesasPorCategoria),
      datasets: [{
        data: Object.values(despesasPorCategoria),
        backgroundColor: CORES_GRAFICO,
        hoverBackgroundColor: CORES_GRAFICO
      }]
    };

    const dataPizzaReceitas = {
      labels: Object.keys(receitasPorCategoria),
      datasets: [{
        data: Object.values(receitasPorCategoria),
        backgroundColor: CORES_GRAFICO,
        hoverBackgroundColor: CORES_GRAFICO
      }]
    };

    // 5. RETORNA TUDO
    return { dataBarras, dataLinha, dataPizzaDespesas, dataPizzaReceitas };

  }, [contas, transacoes, contaId, dataInicio, dataFim]);


  // D. O JSX (HTML)
  if (loading) {
    return <h2>A carregar gráficos...</h2>;
  }

  return (
    <div>
      <h2>Dashboard Analítico</h2>

      {/* 4. OS FILTROS (ATUALIZADO) */}
      <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <label>Tipo de Gráfico: </label>
          <select value={tipoGrafico} onChange={(e) => setTipoGrafico(e.target.value)}>
            <option value="barras">Receita x Despesa</option>
            <option value="linha">Evolução do Saldo</option>
            {/* 5. ADICIONAR A NOVA OPÇÃO */}
            <option value="pizza">Categorias (Pizza)</option> 
          </select>
        </div>

        {/* ... (outros filtros - sem mudança) ... */}
        <div>
          <label>Conta: </label>
          <select value={contaId} onChange={(e) => setContaId(e.target.value)}>
            <option value="todas">Todas as Contas</option>
            {contas.map(conta => (
              <option key={conta.id} value={conta.id}>{conta.nome}</option>
            ))}
          </select>
        </div>
        <div>
          <label>De: </label>
          <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div>
          <label>Até: </label>
          <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>

      <hr />

      {/* 6. O GRÁFICO (Renderização condicional) */}
      <div style={{ maxWidth: '900px', margin: 'auto' }}>
        {tipoGrafico === 'barras' && (
          <div>
            <h3>Receitas vs. Despesas (Ignorando Transferências)</h3>
            <div style={{ maxWidth: '800px', margin: 'auto' }}>
              <Bar data={dadosGrafico.dataBarras} />
            </div>
          </div>
        )}

        {tipoGrafico === 'linha' && (
          <div>
            <h3>Evolução do Saldo (Saldo ao Longo do Tempo)</h3>
            <div style={{ maxWidth: '800px', margin: 'auto' }}>
              <Line data={dadosGrafico.dataLinha} />
            </div>
          </div>
        )}

        {/* 7. NOVO BLOCO DE RENDERIZAÇÃO PARA PIZZA */}
        {tipoGrafico === 'pizza' && (
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>

            {/* Gráfico da Esquerda: Despesas */}
            <div style={{ width: '45%' }}>
              <h3>Despesas por Categoria</h3>
              {dadosGrafico.dataPizzaDespesas.labels.length > 0 ? (
                <Doughnut data={dadosGrafico.dataPizzaDespesas} />
              ) : (
                <p>Nenhuma despesa encontrada no período.</p>
              )}
            </div>

            {/* Gráfico da Direita: Receitas */}
            <div style={{ width: '45%' }}>
              <h3>Receitas por Categoria</h3>
              {dadosGrafico.dataPizzaReceitas.labels.length > 0 ? (
                <Doughnut data={dadosGrafico.dataPizzaReceitas} />
              ) : (
                <p>Nenhuma receita encontrada no período.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;