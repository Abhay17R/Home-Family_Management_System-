// src/hooks/useAuth.js

import { useContext } from "react";
// Yahan par aapko AuthContext ko import karna hoga, jo uski original file mein hai
import { AuthContext } from "../context/AuthContext.jsx";

export const useAuth = () => {
    const context = useContext(AuthContext);

    // Ek acchi practice: Check karein ki hook provider ke andar hi use ho raha hai
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};