import axios from 'axios';



export const getBanks = async () => {
    try {
        const response = await axios.get(`/api/banks/banks`);
        return response.data;
    } catch (error) {
        console.error('Error fetching banks:', error);
        return [];
    }
};

export const getBranches = async (bankId) => {
    try {
        const response = await axios.get(`/api/banks/banks/${bankId}/branches`);
        return response.data;
    } catch (error) {
        console.error('Error fetching branches:', error);
        return [];
    }
};
