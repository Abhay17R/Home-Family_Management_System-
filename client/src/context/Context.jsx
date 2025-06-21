import { createContext } from "react";

export const Context = createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
  user: null,
  setUser: () => {},
  theme: "dark",
  toggleTheme: () => {},
});