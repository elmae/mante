import { Comment } from "../../types/entities";

const BASE_URL = "/api/comments";

export interface CreateCommentDto {
  content: string;
  ticket_id: string;
}

export interface UpdateCommentDto {
  content: string;
}

export const CommentAPI = {
  create: async (data: CreateCommentDto): Promise<Comment> => {
    const response = await fetch(BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error creating comment");
    }

    return response.json();
  },

  getByTicketId: async (ticketId: string): Promise<Comment[]> => {
    const response = await fetch(`${BASE_URL}/ticket/${ticketId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error fetching comments");
    }

    return response.json();
  },

  update: async (id: string, data: UpdateCommentDto): Promise<Comment> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error updating comment");
    }

    return response.json();
  },

  delete: async (id: string): Promise<void> => {
    const response = await fetch(`${BASE_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Error deleting comment");
    }
  },
};
