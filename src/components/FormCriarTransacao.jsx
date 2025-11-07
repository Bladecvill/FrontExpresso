// src/components/FormCriarTransacao.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/transacoes';

function FormCriarTransacao({ onTransacaoCriada }) {
  const { utilizador } = useAuth();
  const { contas, categorias } = useData();

  // Estados do formulário
  const [tipo, setTipo] = useState('DESPESA');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [contaId, setContaId] = useState('');
  const [categoriaId, setCategoriaId] = useState('');

  // Filtra contas (só pode transacionar de CONTA_CORRENTE ou CARTEIRA)
  const contasDisponiveis = contas.filter(c => 
    c.tipoConta === 'CONTA_CORRENTE' || c.tipoConta === 'CARTEIRA'
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    const payload = {
      clienteId: utilizador.id,
      contaId: parseInt(contaId),
      categoriaId: parseInt(categoriaId),
      tipo,
      valor: parseFloat(valor),
      descricao,
      // Garante que a data esteja no formato ISO
      dataOperacao: new Date(data + 'T12:00:00').toISOString() 
    };

    try {
      await axios.post(API_URL, payload);
      alert('Transação criada com sucesso!');
      onTransacaoCriada(); // Chama a função de "refresh"
      
      // Limpa o formulário
      setValor('');
      setDescricao('');
      setContaId('');
      setCategoriaId('');

    } catch (error) {
      console.error('Erro ao criar transação:', error.response?.data);
      alert('Erro ao criar transação: ' + (error.response?.data || 'Erro desconhecido'));
    }
  };

  return (
    // O formulário em grid
    <form onSubmit={handleSubmit} className="form-criar-transacao">
      
      <div className="form-group">
        <label>Tipo de Transação</label>
        <select
          className="form-control"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        >
          <option value="DESPESA">Despesa</option>
          <option value="RECEITA">Receita</option>
        </select>
      </div>

      <div className="form-group">
        <label>Valor (R$)</label>
        <input
          type="number"
          step="0.01"
          min="0.01"
          className="form-control"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          placeholder="0.00"
          required
        />
      </div>

      {/* Ocupa a linha inteira */}
      <div className="form-group form-group-full">
        <label>Descrição</label>
        <input
          type="text"
          className="form-control"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Ex: Almoço, Salário"
          required
        />
      </div>

      <div className="form-group">
        <label>Conta</label>
        <select
          className="form-control"
          value={contaId}
          onChange={(e) => setContaId(e.target.value)}
          required
        >
          <option value="">Selecione a conta</option>
          {contasDisponiveis.map(conta => (
            <option key={conta.id} value={conta.id}>
              {conta.nome} (Saldo: R$ {conta.saldoAtual.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Categoria</label>
        <select
          className="form-control"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          required
        >
          <option value="">Selecione a categoria</option>
          {categorias.map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Data</label>
        <input
          type="date"
          className="form-control"
          value={data}
          onChange={(e) => setData(e.target.value)}
          required
        />
      </div>
      
      {/* Botão alinhado na base */}
      <div className="form-group form-group-submit">
        <button type="submit" className="btn btn-primary w-100">
          Salvar Transação
        </button>
      </div>
    </form>
  );
}
export default FormCriarTransacao;