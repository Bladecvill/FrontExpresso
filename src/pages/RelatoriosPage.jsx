// src/pages/RelatoriosPage.jsx

import React, { useState, useMemo, useRef } from 'react';
import { useData } from '../context/DataContext';

// 1. IMPORTAR TUDO DO CHART.JS (como na HomePage)
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

// 2. IMPORTAR O JSPDF e a Biblioteca de Datas
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';

// 3. REGISTAR O CHART.JS
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// 4. CORES DOS GRÁFICOS (para consistência)
const CORES_GRAFICO = [
  '#005840', '#5dd62c', '#df0139', '#ffc107', '#0dcaf0',
  '#8B0000', '#006400', '#00008B', '#FF9F40', '#E7E9ED'
];


// --- O COMPONENTE DA PÁGINA ---
function RelatoriosPage() {
  const { contas, transacoes, loading } = useData();

  // --- Estados dos Filtros ---
  const [contaId, setContaId] = useState('todas');
  const [dataInicio, setDataInicio] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [dataFim, setDataFim] = useState(format(endOfMonth(new Date()), 'yyyy-MM-dd'));

  // 5. REFERÊNCIAS PARA OS GRÁFICOS (para "tirar a foto")
  const barChartRef = useRef(null);
  const doughnutDespesasRef = useRef(null);
  const doughnutReceitasRef = useRef(null);


  // 6. LÓGICA DE CÁLCULO (A Cópia "turbinada" da HomePage)
  const dadosRelatorio = useMemo(() => {
    const dataInicioObj = parseISO(dataInicio + 'T00:00:00');
    const dataFimObj = parseISO(dataFim + 'T23:59:59');

    // Filtra as contas (ignora "Metas" no relatório principal)
    const contasFiltradas = contas.filter(c =>
      c.tipo === 'CONTA_CORRENTE' && (contaId === 'todas' || c.id === contaId)
    );
    const idsContasFiltradas = contasFiltradas.map(c => c.id);

    // --- A. SALDO INICIAL ---
    let saldoInicial = 0;
    // 1. Soma o saldo de abertura
    contasFiltradas.forEach(c => saldoInicial += c.saldoAbertura);
    // 2. Soma transações ANTERIORES ao período
    transacoes
      .filter(t =>
        idsContasFiltradas.includes(t.contaId) &&
        parseISO(t.dataOperacao) < dataInicioObj
      )
      .forEach(t => saldoInicial += t.valor);

    // --- B. TRANSAÇÕES DO PERÍODO ---
    const transacoesFiltradas = transacoes
      .filter(t =>
        idsContasFiltradas.includes(t.contaId) &&
        parseISO(t.dataOperacao) >= dataInicioObj &&
        parseISO(t.dataOperacao) <= dataFimObj
      )
      .sort((a, b) => parseISO(a.dataOperacao) - parseISO(b.dataOperacao)); // Ordena

    // --- C. TOTAIS DO PERÍODO ---
    let totalReceitas = 0;
    let totalDespesas = 0;
    let saldoCorrente = saldoInicial;

    const despesasPorCategoria = {};
    const receitasPorCategoria = {};

    transacoesFiltradas.forEach(t => {
      saldoCorrente += t.valor;
      if (t.nomeCategoria !== 'Transferências') {
        if (t.valor > 0) {
          totalReceitas += t.valor;
          receitasPorCategoria[t.nomeCategoria] = (receitasPorCategoria[t.nomeCategoria] || 0) + t.valor;
        } else {
          totalDespesas += t.valor; // (valor é negativo)
          despesasPorCategoria[t.nomeCategoria] = (despesasPorCategoria[t.nomeCategoria] || 0) + Math.abs(t.valor);
        }
      }
    });

    const saldoFinal = saldoCorrente;

    // --- D. DADOS DOS GRÁFICOS ---
    const dataBarras = {
      labels: ['Resumo do Período'],
      datasets: [
        { label: 'Total Receitas', data: [totalReceitas], backgroundColor: '#198754' },
        { label: 'Total Despesas', data: [Math.abs(totalDespesas)], backgroundColor: '#dc3545' },
      ],
    };
    const dataPizzaDespesas = {
      labels: Object.keys(despesasPorCategoria),
      datasets: [{ data: Object.values(despesasPorCategoria), backgroundColor: CORES_GRAFICO }]
    };
    const dataPizzaReceitas = {
      labels: Object.keys(receitasPorCategoria),
      datasets: [{ data: Object.values(receitasPorCategoria), backgroundColor: CORES_GRAFICO }]
    };

    return {
      transacoesFiltradas,
      saldoInicial,
      totalReceitas,
      totalDespesas,
      saldoFinal,
      dataBarras,
      dataPizzaDespesas,
      dataPizzaReceitas
    };
  }, [contas, transacoes, contaId, dataInicio, dataFim]);


  // 7. A FUNÇÃO DE GERAR O PDF (A Lógica Principal)
  const handleGerarRelatorio = () => {
    try {
      const doc = new jsPDF('p', 'pt', 'a4'); // (portrait, points, A4)
      const margin = 40;
      let yPos = margin; // Posição vertical no PDF

      const {
        transacoesFiltradas, saldoInicial, totalReceitas,
        totalDespesas, saldoFinal
      } = dadosRelatorio;

      // --- 1. TÍTULO E RESUMO ---
      doc.setFontSize(18);
      doc.text('Relatório Financeiro - Expresso Finance', margin, yPos);
      yPos += 30;

      const nomeConta = contaId === 'todas' ? 'Todas as Contas' : contas.find(c => c.id === contaId).nome;
      doc.setFontSize(11);
      doc.text(`Conta: ${nomeConta}`, margin, yPos);
      yPos += 15;
      doc.text(`Período: ${format(parseISO(dataInicio), 'dd/MM/yyyy')} a ${format(parseISO(dataFim), 'dd/MM/yyyy')}`, margin, yPos);
      yPos += 30;

      // --- 2. TABELA DE RESUMO DE SALDOS ---
      doc.setFontSize(14);
      doc.text('Resumo do Período', margin, yPos);
      yPos += 10;
      doc.autoTable({
        startY: yPos,
        head: [['Saldo Inicial', 'Total Receitas', 'Total Despesas', 'Saldo Final']],
        body: [[
          `R$ ${saldoInicial.toFixed(2)}`,
          `R$ ${totalReceitas.toFixed(2)}`,
          `R$ ${Math.abs(totalDespesas).toFixed(2)}`,
          `R$ ${saldoFinal.toFixed(2)}`
        ]],
        theme: 'grid',
        headStyles: { fillColor: [0, 88, 64] } // Verde Escuro (nosso tema)
      });
      yPos = doc.lastAutoTable.finalY + 30;

      // --- 3. GRÁFICOS (A "Foto") ---
      doc.setFontSize(14);
      doc.text('Gráficos do Período', margin, yPos);
      yPos += 20;

      const barChartImg = barChartRef.current?.toBase64Image('image/png', 1.0);
      const doughDespesasImg = doughnutDespesasRef.current?.toBase64Image('image/png', 1.0);
      const doughReceitasImg = doughnutReceitasRef.current?.toBase64Image('image/png', 1.0);

      if (barChartImg) {
        doc.addImage(barChartImg, 'PNG', margin, yPos, 515, 200); // (img, tipo, x, y, width, height)
        yPos += 220;
      }
      if (doughDespesasImg) {
        doc.text('Despesas por Categoria', margin, yPos);
        doc.addImage(doughDespesasImg, 'PNG', margin, yPos + 10, 250, 200);
      }
      if (doughReceitasImg) {
        doc.text('Receitas por Categoria', margin + 265, yPos);
        doc.addImage(doughReceitasImg, 'PNG', margin + 265, yPos + 10, 250, 200);
      }

      // --- 4. TABELA DE TRANSAÇÕES (em outra página) ---
      doc.addPage();
      doc.setFontSize(18);
      doc.text('Histórico de Transações', margin, margin);
      yPos = margin + 30;

      const tableData = transacoesFiltradas.map(t => [
        format(parseISO(t.dataOperacao), 'dd/MM/yy HH:mm'),
        t.nomeConta,
        t.nomeCategoria,
        t.descricao || '-',
        t.valor > 0 ? `R$ ${t.valor.toFixed(2)}` : '', // Receita
        t.valor < 0 ? `R$ ${t.valor.toFixed(2)}` : ''  // Despesa
      ]);

      doc.autoTable({
        startY: yPos,
        head: [['Data', 'Conta', 'Categoria', 'Descrição', 'Receita', 'Despesa']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [0, 88, 64] }
      });

      // --- 5. SALVAR O PDF ---
      doc.save(`Relatorio_Financeiro_${nomeConta}_${dataInicio}_a_${dataFim}.pdf`);

    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Ocorreu um erro ao gerar o relatório em PDF.");
    }
  };


  if (loading) return <div>A carregar dados...</div>;

  // --- O JSX (HTML) DA PÁGINA ---
  return (
    <div>
      <h2>Gerador de Relatórios</h2>
      <p>Selecione os filtros para gerar o seu extrato financeiro em PDF. Os gráficos abaixo são uma prévia do que será incluído.</p>

      {/* O 'form' já está estilizado pelo index.css */}
      <form onSubmit={(e) => { e.preventDefault(); handleGerarRelatorio(); }}>

        {/* ... (Filtros - sem mudança) ... */}
        <div>
          <label>Conta:</label>
          <select value={contaId} onChange={(e) => setContaId(e.target.value)} required>
            <option value="todas">Todas as Contas Corrente</option>
            {contas.filter(c => c.tipo === 'CONTA_CORRENTE').map(conta => (
              <option key={conta.id} value={conta.id}>
                {conta.nome} (Saldo: {conta.saldoAtual.toFixed(2)})
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label>Data de Início:</label>
            <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} required />
          </div>
          <div style={{ flex: 1 }}>
            <label>Data de Fim:</label>
            <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} required />
          </div>
        </div>

        <button type="submit" style={{ marginTop: '10px', padding: '12px' }}>
          Gerar Relatório em PDF
        </button>
      </form>

      <hr />

      {/* 8. ADICIONAR OS GRÁFICOS VISUAIS (A "Prévia") */}
      <h3>Prévia do Relatório</h3>

      <div style={{ maxWidth: '800px', margin: 'auto' }}>
        <h4>Receitas vs. Despesas</h4>
        <Bar ref={barChartRef} data={dadosRelatorio.dataBarras} />
      </div>

      <hr />

      <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: '900px', margin: 'auto' }}>
        <div style={{ width: '45%' }}>
          <h4>Despesas por Categoria</h4>
          <Doughnut ref={doughnutDespesasRef} data={dadosRelatorio.dataPizzaDespesas} />
        </div>
        <div style={{ width: '45%' }}>
          <h4>Receitas por Categoria</h4>
          <Doughnut ref={doughnutReceitasRef} data={dadosRelatorio.dataPizzaReceitas} />
        </div>
      </div>

    </div>
  );
}

export default RelatoriosPage;