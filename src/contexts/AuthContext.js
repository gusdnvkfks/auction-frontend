import React, { createContext, useState } from 'react';

export const AuthContext = createContext({
  certificationInfo: null,
  setCertificationInfo: () => {},
});

export const AuthProvider = ({ children }) => {
  const [certificationInfo, setCertificationInfo] = useState(null);

  // children을 배열로 바꾸고 string 타입은 걸러냅니다
  const filtered = React.Children.toArray(children)
      .filter(child => typeof child !== 'string');

  return (
    <AuthContext.Provider value={{ certificationInfo, setCertificationInfo }}>
      {filtered}
    </AuthContext.Provider>
  );
};