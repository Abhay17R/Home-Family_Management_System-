// src/api/axios.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:4000/api/v1', // Apna backend URL yahan daalo
  withCredentials: true, // Yeh line cookie bhejne ke liye sabse zaroori hai
});

export default API;