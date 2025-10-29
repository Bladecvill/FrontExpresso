// src/components/ResumoCard.jsx

import React from 'react';

// Este componente recebe todas as props do "Pai"
function ResumoCard({ 
  title, 
  valor, 
  color, 
  isExpanded, 
  onToggle, 
  breakdownMap, // O Map com os dados por conta
  breakdownKey   // Qual chave mostrar ('saldo', 'receitas', 'despesas')
}) {

  const cardStyle = {
    border: `2px solid ${color}`,
    borderRadius: '8px',
    padding: '15px',
    margin: '5px',
    flex: 1, // Faz os cards terem o mesmo tamanho
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: isExpanded ? '#f9f9f9' : '#fff'
  };

  const valorStyle = {
    fontSize: '1.8em',
    fontWeight: 'bold',
    color: color
  };

  const breakdownStyle = {
    marginTop: '15px',
    textAlign: 'left',
    borderTop: '1px solid #eee',
    paddingTop: '10px'
  };

  return (
    <div style={cardStyle} onClick={onToggle}>
      <h3 style={{ margin: 0, color: '#555' }}>{title}</h3>
      <p style={valorStyle}>R$ {valor.toFixed(2)}</p>

      {/* O "Breakdown" que expande (o que você pediu) */}
      {isExpanded && (
        <div style={breakdownStyle}>
          <h4 style={{ margin: '0 0 5px 0' }}>Detalhes por Conta:</h4>
          {/* Converte o Map para um Array e faz o loop */}
          {Array.from(breakdownMap.values()).map(item => (
            <div key={item.nome} style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>{item.nome}:</span>
              <strong>R$ {item[breakdownKey].toFixed(2)}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumoCard;