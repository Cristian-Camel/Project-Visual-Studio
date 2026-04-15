import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const Button = ({ variant = 'primary', className = '', ...props }: Props) => {
  const styles: Record<typeof variant, string> = {
    primary: 'bg-blue-600 text-white hover:bg-blue-500',
    secondary: 'bg-slate-800 text-white hover:bg-slate-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 border border-slate-300',
    danger: 'bg-red-600 text-white hover:bg-red-500',
  };

  return (
    <button
      {...props}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition ${styles[variant]} ${className}`}
    />
  );
};
