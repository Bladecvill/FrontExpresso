// src/components/FormCriarMeta.jsx

import React, { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

// Este componente recebe props do Dashboard:
// clienteId: para saber quem é o dono da meta
// onMetaCriada: a função de "refresh" do Dashboard
function FormCriarMeta({ clienteId, onMetaCriada }) {

  // Estado interno do formulário
  const [nome, setNome] = useState('');
  const [valorAlvo, setValorAlvo] = useState('');
  const [dataAlvo, setDataAlvo] = useState('');

  // Função chamada ao submeter o formulário
  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!nome || !valorAlvo || !dataAlvo) {
      alert('Por favor, preencha todos os campos.');
      return;
    }

    // Monta o payload para enviar para a API de Metas
    // (Lembre-se que o backend vai criar a Conta-Cofrinho automaticamente!)
    const payload = {
      clienteId: clienteId,
      nome: nome,
      valorAlvo: parseFloat(valorAlvo), // Converte para número
      dataAlvo: dataAlvo,
    };

    console.log('A enviar nova meta:', payload);

    try {
      // Chama o endpoint POST /api/metas
      await axios.post(`${API_BASE_URL}/metas`, payload);

      alert('Meta criada com sucesso!');

      // Chama a função de "refresh" do Pai (Dashboard)
      // para que a nova meta apareça na lista
      onMetaCriada(); 

      // Limpa o formulário
      setNome('');
      setValorAlvo('');
      setDataAlvo('');

    } catch (error) {
      console.error('Erro ao criar meta:', error.response.data);
      alert('Erro ao criar meta: ' + error.response.data);
    }
  };

  // O HTML (JSX) do formulário
  return (
    <form onSubmit={handleSubmit}>
      <h4>Criar Nova Meta (Cofrinho)</h4>

      <div>
        <label>Nome da Meta: </label>
        <input 
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Valor Alvo (R$): </label>
        <input 
          type="number"
          step="0.01"
          value={valorAlvo}
          onChange={(e) => setValorAlvo(e.target.value)}
          required
        />
      </div>

      <div>
        <label>Data Alvo: </label>
        <input 
          type="date" // Apenas Data (o backend aceita LocalDate)
          value={dataAlvo}
          onChange={(e) => setDataAlvo(e.target.value)}
          required
        />
      </div>

      <button type="submit">Criar Meta</button>
    </form>
  );
}

export default FormCriarMeta;