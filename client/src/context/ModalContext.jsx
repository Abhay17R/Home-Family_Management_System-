import React, { createContext, useState, useContext } from 'react';

// 1. Context ko create karein
const ModalContext = createContext();

// 2. Provider component banayein
export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        type: null, // 'create_folder', 'upload_file', etc.
        props: {}   // Modal ko pass karne ke liye extra data
    });

    const openModal = (type, props = {}) => {
        setModalState({ type, props });
    };

    const closeModal = () => {
        setModalState({ type: null, props: {} });
    };

    const value = {
        modalState,
        openModal,
        closeModal
    };

    return (
        <ModalContext.Provider value={value}>
            {children}
        </ModalContext.Provider>
    );
};

// 3. Ek custom hook banayein (optional but good practice)
export const useModal = () => {
    return useContext(ModalContext);
};