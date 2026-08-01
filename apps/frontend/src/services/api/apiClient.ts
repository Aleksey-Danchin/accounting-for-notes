import axios from 'axios';
import { apiConfig } from './config';
import { enqueueRequest } from './httpManager';

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
  withCredentials: true,
  adapter: (config) => enqueueRequest(config),
});
