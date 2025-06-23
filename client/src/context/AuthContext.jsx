import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios'; // Maan lijiye aap API calls ke liye axios use kar rahe hain

// 1. Context banaya
const AuthContext = createContext();

// 2. Provider Component banaya
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true); // Shuru me loading true rahegi

    useEffect(() => {
        // Yeh function app load hote hi check karega ki user pehle se logged in hai ya nahi
        const fetchLoggedInUser = async () => {
            setIsLoading(true);
            try {
                // Cookies me token check hota hai, aur "/me" route se user data milta hai
                const { data } = await axios.get('http://localhost:4000/api/v1/me',{
                    withCredentials:true,
                }); // Apne API route ko yahan daalein
                if (data.success) {
                    setUser(data.user); // User data state me set kiya
                }
            } catch (error) {
                // Koi error (ya token nahi mila) to user null hi rahega
                console.log("No logged in user found or token expired.");
            } finally {
                // Chahe kuch bhi ho, end me loading false ho jayegi
                setIsLoading(false);
            }
        };

        fetchLoggedInUser();
    }, []); // Empty array ka matlab ye sirf ek baar chalega jab app load hogi

    // Yeh values poori app me available hongi
    const value = {
        user,
        setUser,
        isLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// 3. Ek custom hook banaya taaki context use karna aasan ho jaye
export const useAuth = () => {
    return useContext(AuthContext);
};