// src/components/FormCriarConta.jsx

import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Recebe o clienteId e a função de refresh
function FormCriarConta({ clienteId, onContaCriada }) {

  const [nome, setNome] = useState('');
  const [saldoAbertura, setSaldoAbertura] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nome || saldoAbertura === '') {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // O backend espera que 'saldoAtual' seja igual a 'saldoAbertura'
    const payload = {
      clienteId: clienteId,
      nome: nome,
      saldoAbertura: parseFloat(saldoAbertura),
      tipoConta: 'CONTA_CORRENTE' // O backend espera isto
    };

    console.log('A enviar nova conta:', payload);

    try {
      // Chama o endpoint POST /api/contas
      await axios.post(`${API_BASE_URL}/contas`, payload);

      alert('Conta criada com sucesso!');

      // Chama a função de "refresh" do Pai (DataContext)
      onContaCriada(); 

      // Limpa o formulário
      setNome('');
      setSaldoAbertura('');

    } catch (error) {
      console.error('Erro ao criar conta:', error.response.data);
      alert('Erro ao criar conta: ' + error.response.data);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h4>Adicionar Nova Conta Corrente</h4>

      <div>
        <label>Nome da Conta (ex: Nubank, Bradesco): </label>
        <input 
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Saldo de Abertura (R$): </label>
        <input 
          type="number"
          step="0.01"
          value={saldoAbertura}
          onChange={(e) => setSaldoAbertura(e.target.value)}
          required
        />
      </div>

      <button type="submit">Criar Conta</button>
    </form>
  );
}

export default FormCriarConta;