import axios from 'axios';
import { useApi } from '../context/ApiContext';

const apiUrl = useApi();

const API_URL = `${apiUrl}/api/plans`;

export const generatePlan = async (params) => {
  try {
    const response = await axios.get(API_URL, { params });
    return response.data;
  } catch (error) {
    throw error.response.data;
  }
};
