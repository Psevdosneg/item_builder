import React from 'react';
import classNames from 'classnames';
import styles from './Input.module.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth,
  className,
  ...props
}) => {
  return (
    <div className={classNames(styles.wrapper, fullWidth && styles.fullWidth)}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        className={classNames(styles.input, error && styles.error, className)}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
