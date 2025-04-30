// src/contexts/SignUpContext.js
import React, { createContext, useState } from 'react';

export const SignUpContext = createContext({
    address: { city: '', gu: '', dong: '' },
    setAddress: () => {},
});

export function SignUpProvider({ children }) {
    const [address, setAddress] = useState({
        city: '',
        gu: '',
        dong: ''
    });

    return (
        <SignUpContext.Provider value={{ address, setAddress }}>
            {children}
        </SignUpContext.Provider>
    );
}
