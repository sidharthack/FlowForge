import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';

interface CommentDto {
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
}

export const TaskComments = ({ taskId }: { taskId: string }) => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');
    const [isOpen, setIsOpen] = useState(false); // Toggle to show/hide comments

    const { data: comments = [], isLoading } = useQuery<CommentDto[]>({
        queryKey: ['comments', taskId],
        queryFn: async () => (await api.get(`/api/tasks/${taskId}/comments`)).data,
        enabled: isOpen, // Only fetch if the user opens the comments section!
    });

    const createComment = useMutation({
        mutationFn: async (newContent: string) =>
            (await api.post(`/api/tasks/${taskId}/comments`, { content: newContent })).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
            setContent('');
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) createComment.mutate(content);
    };

    return (
        <div style={{ marginTop: '10px', borderTop: '1px solid #e9ecef', paddingTop: '8px' }}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px', padding: 0 }}
            >
                {isOpen ? 'Hide Comments' : '💬 View/Add Comments'}
            </button>

            {isOpen && (
                <div style={{ marginTop: '10px' }}>
                    {isLoading ? <span style={{ fontSize: '12px' }}>Loading...</span> : (
                        <div style={{ maxHeight: '100px', overflowY: 'auto', marginBottom: '8px' }}>
                            {comments.length === 0 ? <div style={{ fontSize: '12px', color: '#6c757d' }}>No comments yet.</div> : null}
                            {comments.map(c => (
                                <div key={c.id} style={{ fontSize: '12px', marginBottom: '6px', background: '#f8f9fa', padding: '6px', borderRadius: '4px' }}>
                                    <strong style={{ color: '#495057' }}>{c.authorName.split('@')[0]}</strong>: {c.content}
                                </div>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '5px' }}>
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            style={{ flexGrow: 1, padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '3px' }}
                        />
                        <button type="submit" disabled={createComment.isPending} style={{ padding: '4px 8px', fontSize: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '3px' }}>
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};