import React, { createContext, useState, useContext, useCallback } from 'react';

// 1. Context create karein
const AppFocusContext = createContext();

// 2. Provider component banayein jo state aur functions dega
export const AppFocusProvider = ({ children }) => {
    // state batayega ki koi action (jaise file dialog) focus ko block kar raha hai ya nahi
    const [isActionBlockingFocus, setIsActionBlockingFocus] = useState(false);

    // Ye functions context ke zariye components ko milenge
    const blockFocusAction = useCallback(() => {
        console.log("CONTEXT: Focus action BLOCKED.");
        setIsActionBlockingFocus(true);
    }, []);

    const unblockFocusAction = useCallback(() => {
        console.log("CONTEXT: Focus action UNBLOCKED.");
        // Hum focus event ke baad unblock karenge, isliye yahan direct call ki zaroorat nahi
        setIsActionBlockingFocus(false);
    }, []);
    
    const value = {
        isActionBlockingFocus,
        blockFocusAction,
        unblockFocusAction,
    };

    return (
        <AppFocusContext.Provider value={value}>
            {children}
        </AppFocusContext.Provider>
    );
}; // <-- Yahan Provider component khatam hota hai. Iske baad extra bracket nahi hai.

// 3. Custom hook jisse context ko use karna aasan ho
export const useAppFocus = () => {
    const context = useContext(AppFocusContext);
    if (!context) {
        throw new Error('useAppFocus must be used within an AppFocusProvider');
    }
    return context;
};