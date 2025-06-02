// src/services/auth.ts
import axios from "axios";


export const login = async (email: string, password: string) => {
    const response = await axios.post("http://localhost:3001/api/users/login", {
      email,
      password
    });
    return response.data;
  };
  
  export const getAuthToken = () => localStorage.getItem("authToken");
  export const setAuthToken = (token: string) => localStorage.setItem("authToken", token);
  export const removeAuthToken = () => localStorage.removeItem("authToken");