import axiosInstance from "@/configs/axios";

export const getComments = (songId) => axiosInstance.get(`/comments/${songId}`);

export const createComment = (data) => axiosInstance.post('/comments', data);

export const createCommentReply = (data) => axiosInstance.post('/comments/reply', data);

export const toggleCommentLike = (commentId) => axiosInstance.post(`/comments/${commentId}/like`);