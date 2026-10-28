import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../lib/api';
import toast from 'react-hot-toast';

interface CommentDto {
    id: string;
    content: string;
    createdAt: string;
    authorName: string;
}

export const TaskComments = ({ taskId }: { taskId: string }) => {
    const queryClient = useQueryClient();
    const [content, setContent] = useState('');

    const { data: comments = [], isLoading } = useQuery<CommentDto[]>({
        queryKey: ['comments', taskId],
        queryFn: async () => (await api.get(`/api/tasks/${taskId}/comments`)).data,
    });

    const createComment = useMutation({
        mutationFn: async (newContent: string) =>
            (await api.post(`/api/tasks/${taskId}/comments`, { content: newContent })).data,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['comments', taskId] });
            setContent('');
            toast.success('Comment posted');
        },
        onError: () => toast.error('Failed to post comment')
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (content.trim()) createComment.mutate(content);
    };

    return (
        <div style={{ marginTop: '20px', borderTop: '1px solid #e9ecef', paddingTop: '15px' }}>
            <h4 style={{ marginBottom: '10px' }}>Comments</h4>

            {isLoading ? <span style={{ fontSize: '14px' }}>Loading comments...</span> : (
                <div style={{ maxHeight: '200px', overflowY: 'auto', marginBottom: '15px' }}>
                    {comments.length === 0 ? <div style={{ fontSize: '13px', color: '#6c757d' }}>No comments yet.</div> : null}
                    {comments.map(c => (
                        <div key={c.id} style={{ fontSize: '13px', marginBottom: '8px', background: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
                            <strong style={{ color: '#495057' }}>{c.authorName.split('@')[0]}</strong>
                            <span style={{ color: '#adb5bd', fontSize: '11px', marginLeft: '8px' }}>
                                {new Date(c.createdAt).toLocaleString()}
                            </span>
                            <div style={{ marginTop: '4px' }}>{c.content}</div>
                        </div>
                    ))}
                </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px' }}>
                <input
                    type="text"
                    placeholder="Write a comment..."
                    value={content}
                    onChange={e => setContent(e.target.value)}
                    style={{ flexGrow: 1, padding: '8px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
                <button type="submit" disabled={createComment.isPending} style={{ padding: '8px 12px', fontSize: '13px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Post
                </button>
            </form>
        </div>
    );
};