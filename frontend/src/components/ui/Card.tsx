import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Card = ({ children, className = "", ...rest }: CardProps) => {
  return (
    <div className={`bg-white rounded-xl shadow-md ${className}`} {...rest}>
      {children}
    </div>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent = ({ children, className = "" }: CardContentProps) => {
  return <div className={`p-4 ${className}`}>{children}</div>;
};
