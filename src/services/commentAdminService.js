import axiosInstance from "@/configs/axios";

export const getCommentsForAdmin = (page = 1, pageSize = 10) => 
    axiosInstance.get(`/admincomments/all?page=${page}&pageSize=${pageSize}`);

export const searchCommentsForAdmin = (searchTerm, page = 1, pageSize = 10) => 
    axiosInstance.get(`/admincomments/search?searchTerm=${searchTerm}&page=${page}&pageSize=${pageSize}`);

export const deleteComment = (commentId) => 
    axiosInstance.delete(`/admincomments/${commentId}`);