import { useState, useCallback } from "react";
import { TicketComment } from "../types/entities";
import { CommentAPI } from "../services/api/comments";

export function useComments(ticketId: string) {
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await CommentAPI.getByTicketId(ticketId);
      setComments(data);
    } catch (error) {
      setError("No se pudieron cargar los comentarios");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  const createComment = async (content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await CommentAPI.create({
        content,
        ticket_id: ticketId,
      });
      setComments((prev) => [...prev, data]);
    } catch (error) {
      setError("No se pudo crear el comentario");
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateComment = async (id: string, content: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await CommentAPI.update(id, { content });
      setComments((prev) =>
        prev.map((comment) => (comment.id === id ? data : comment))
      );
    } catch (error) {
      setError("No se pudo actualizar el comentario");
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteComment = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      await CommentAPI.delete(id);
      setComments((prev) => prev.filter((comment) => comment.id !== id));
    } catch (error) {
      setError("No se pudo eliminar el comentario");
      console.error(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    comments,
    isLoading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
  };
}
