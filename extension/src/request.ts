import axios, { AxiosInstance } from 'axios';
const BASE_URL = 'https://qsyjt1qvn9.execute-api.us-east-1.amazonaws.com/';
export const INJEEST_URL = '/dev/ingest';

const axiosRequest: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosRequest.interceptors.request.use((request) => {
  console.log('Starting Request', request);
  return request;
});

export default axiosRequest;
