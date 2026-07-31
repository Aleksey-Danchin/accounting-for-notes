import axios from 'axios';
import pLimit from 'p-limit';
import { apiConfig } from './config';

const limit = pLimit(apiConfig.concurrency);
const defaultAdapter = axios.getAdapter(axios.defaults.adapter);

export const apiClient = axios.create({
  baseURL: apiConfig.baseURL,
});

apiClient.defaults.adapter = (config) =>
  limit(() => defaultAdapter(config));
