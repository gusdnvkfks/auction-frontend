import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
  certificationInfo: null,
  setCertificationInfo: () => {},
});

export const AuthProvider = ({ children }) => {
  const [certificationInfo, setCertificationInfo] = useState(null);

  return (
    <AuthContext.Provider value={{ certificationInfo, setCertificationInfo }}>
      {children}
    </AuthContext.Provider>
  );
};