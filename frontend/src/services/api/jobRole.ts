import apiInstance from '../api';

export const createJobRole = async (payload: {
  title: string;
})=>{
    const response = await apiInstance.post('/jobRole/create', payload);
    return response;
}

