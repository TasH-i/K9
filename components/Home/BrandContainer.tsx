import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
}

const Container: React.FC<ContainerProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-4 md:px-10 lg:px-20 ${className}`}>
      {children}
    </div>
  );
};

export default Container; 