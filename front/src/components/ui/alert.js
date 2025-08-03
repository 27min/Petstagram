const Alert = ({ children, variant = "default", className = "" }) => {
    const variants = {
      default: "bg-gray-100 border-gray-300 text-gray-900",
      destructive: "bg-red-100 border-red-300 text-red-900",
    };
  
    return (
      <div className={`border p-4 rounded-lg ${variants[variant]} ${className}`}>
        {children}
      </div>
    );
  };
  
  const AlertDescription = ({ children, className = "" }) => {
    return <div className={`text-sm ${className}`}>{children}</div>;
  };
  
  export { Alert, AlertDescription };