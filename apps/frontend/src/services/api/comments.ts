import { TicketComment } from "../../types/entities";
import { apiClient } from "./client";
const BASE_URL = "/comments";

export interface CreateCommentDto {
  content: string;
  ticket_id: string;
}

export interface UpdateCommentDto {
  content: string;
}

export const CommentAPI = {
  create: async (data: CreateCommentDto): Promise<TicketComment> => {
    const response = await apiClient.post(BASE_URL, data);
    return response.data;
  },

  getByTicketId: async (ticketId: string): Promise<TicketComment[]> => {
    const response = await apiClient.get(`${BASE_URL}/ticket/${ticketId}`);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateCommentDto
  ): Promise<TicketComment> => {
    const response = await apiClient.patch(`${BASE_URL}/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`${BASE_URL}/${id}`);
  },
};
