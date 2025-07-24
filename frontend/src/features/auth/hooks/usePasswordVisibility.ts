import { useState } from 'react';

export const usePasswordVisibility = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  const togglePasswordVisibility = () => {
    setShowPassword(prevShowPassword => !prevShowPassword);
  };
  
  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };
  
  return {
    showPassword,
    togglePasswordVisibility,
    handleMouseDownPassword
  };
}; 