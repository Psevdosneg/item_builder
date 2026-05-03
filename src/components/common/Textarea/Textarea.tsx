import React from 'react';
import classNames from 'classnames';
import styles from './Textarea.module.css';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  fullWidth,
  className,
  ...props
}) => {
  return (
    <div className={classNames(styles.wrapper, fullWidth && styles.fullWidth)}>
      {label && <label className={styles.label}>{label}</label>}
      <textarea
        className={classNames(styles.textarea, error && styles.error, className)}
        {...props}
      />
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
};
