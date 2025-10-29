// src/components/ProgressBar.jsx

import React from 'react';

// Recebe a percentagem (ex: 30)
function ProgressBar({ percentual }) {
  // Garante que o percentual não passe de 100
  const percentualClamped = Math.min(percentual, 100);

  const containerStyles = {
    height: 20,
    width: '100%',
    backgroundColor: "#e0e0de",
    borderRadius: 50,
    margin: '10px 0'
  };

  const fillerStyles = {
    height: '100%',
    width: `${percentualClamped}%`, // A "mágica"
    backgroundColor: '#00695c', // Um tom de verde
    borderRadius: 'inherit',
    textAlign: 'right',
    transition: 'width 1s ease-in-out', // Animação
  };

  const labelStyles = {
    padding: 5,
    color: 'white',
    fontWeight: 'bold'
  };

  return (
    <div style={containerStyles}>
      <div style={fillerStyles}>
        <span style={labelStyles}>{`${percentualClamped.toFixed(0)}%`}</span>
      </div>
    </div>
  );
}

export default ProgressBar;