import axios from 'axios';
import { apiConfig } from '__frontend/services/api/config';

export const authClient = axios.create({
  baseURL: apiConfig.baseURL,
  withCredentials: true,
});
