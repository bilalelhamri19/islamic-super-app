import React from 'react';
import styles from './Button.module.css';

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) {
  const btnClass = `${styles.btn} ${styles[variant]} ${styles[size]} ${className}`;
  
  return (
    <button className={btnClass} {...props}>
      {children}
    </button>
  );
}
