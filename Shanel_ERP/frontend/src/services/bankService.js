import axios from 'axios';
import { API_ENDPOINTS } from '../config/apiEndpoints';



export const getBanks = async () => {
    try {
        const response = await axios.get(API_ENDPOINTS.banks.list);
        return response.data;
    } catch (error) {
        console.error('Error fetching banks:', error);
        return [];
    }
};

export const getBranches = async (bankId) => {
    try {
        const response = await axios.get(API_ENDPOINTS.banks.branches(bankId));
        return response.data;
    } catch (error) {
        console.error('Error fetching branches:', error);
        return [];
    }
};
