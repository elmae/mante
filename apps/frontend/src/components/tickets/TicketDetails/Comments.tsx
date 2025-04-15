import { useComments } from "@/hooks/useComments";
import { useState, useEffect } from "react";
import { TicketComment } from "@/types/entities";

interface CommentsProps {
  ticketId: string;
  currentUser?: {
    id: string;
    email: string;
    name: string;
  };
}

export function Comments({ ticketId, currentUser }: CommentsProps) {
  const [newComment, setNewComment] = useState("");
  const {
    comments,
    isLoading,
    createComment,
    updateComment,
    deleteComment,
    fetchComments,
  } = useComments(ticketId);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    await createComment(newComment);
    setNewComment("");
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold mb-2">Comentarios</h3>

      {/* Formulario de nuevo comentario */}
      {currentUser && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="w-full p-3 border rounded-lg min-h-[100px] focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
            disabled={isLoading || !newComment.trim()}
          >
            Agregar Comentario
          </button>
        </form>
      )}

      {/* Lista de comentarios */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
              >
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-center py-4">
            No hay comentarios aún.{" "}
            {currentUser ? "Sé el primero en comentar." : ""}
          </p>
        ) : (
          comments.map((comment: TicketComment) => (
            <div
              key={comment.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-medium">{comment.createdBy.name}</span>
                  <span className="text-gray-500 dark:text-gray-400 text-sm ml-2">
                    {new Date(comment.createdAt).toLocaleDateString("es", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                {currentUser?.id === comment.createdBy.id && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        const newContent = window.prompt(
                          "Editar comentario",
                          comment.content
                        );
                        if (newContent && newContent !== comment.content) {
                          updateComment(comment.id, newContent);
                        }
                      }}
                      className="text-blue-500 hover:text-blue-600 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "¿Estás seguro de eliminar este comentario?"
                          )
                        ) {
                          deleteComment(comment.id);
                        }
                      }}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                )}
              </div>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {comment.content}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
