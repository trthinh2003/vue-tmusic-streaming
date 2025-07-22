import axiosInstance from '@/configs/axios';

export const getUserProfile = async () => {
    try {
        const response = await axiosInstance.get(`users/profile`);
        return response.data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        throw error;
    }
};

export const updateUserProfile = async (formData) => {
    try {
        const response = await axiosInstance.put(`users/profile`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};