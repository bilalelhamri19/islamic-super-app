import React from 'react';
import styles from './Card.module.css';

export function Card({ 
  children, 
  className = '', 
  variant = 'default',
  interactive = false,
  ...props 
}) {
  const cardClass = [
    styles.card,
    styles[variant],
    interactive ? styles.interactive : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
}
