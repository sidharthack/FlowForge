import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import api from '../../lib/api';

interface TaskDto {
    id: string;
    title: string;
    description: string;
    status: string;
    projectId: string;
    assigneeId: string | null;
    assigneeName: string | null;
}

interface UserDto {
    id: string;
    name: string;
}

const COLUMNS = ['To Do', 'In Progress', 'Done'];

export const ProjectBoard = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // Fetch Tasks
    const { data: tasks = [], isLoading } = useQuery<TaskDto[]>({
        queryKey: ['tasks', projectId],
        queryFn: async () => (await api.get(`/api/projects/${projectId}/tasks`)).data,
        enabled: !!projectId,
    });

    // Fetch Users (for the assignment dropdown)
    const { data: users = [] } = useQuery<UserDto[]>({
        queryKey: ['users'],
        queryFn: async () => (await api.get('/api/users')).data,
    });

    // Create Task Mutation
    const createTask = useMutation({
        mutationFn: async (title: string) => (await api.post('/api/tasks', { title, description: '', projectId })).data,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }); setNewTaskTitle(''); }
    });

    // Update Status Mutation
    const updateStatus = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => api.patch(`/api/tasks/${taskId}/status`, { status }),
        onMutate: async (newStatusData) => {
            await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
            const previousTasks = queryClient.getQueryData<TaskDto[]>(['tasks', projectId]);
            queryClient.setQueryData<TaskDto[]>(['tasks', projectId], old =>
                old?.map(task => task.id === newStatusData.taskId ? { ...task, status: newStatusData.status } : task)
            );
            return { previousTasks };
        },
        onError: (err, newStatusData, context) => {
            if (context?.previousTasks) queryClient.setQueryData(['tasks', projectId], context.previousTasks);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    });

    // Update Assignee Mutation
    const updateAssignee = useMutation({
        mutationFn: async ({ taskId, assigneeId }: { taskId: string; assigneeId: string | null }) =>
            api.patch(`/api/tasks/${taskId}/assignee`, { assigneeId: assigneeId || null }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
        updateStatus.mutate({ taskId: draggableId, status: destination.droppableId });
    };

    if (isLoading) return <p>Loading board...</p>;

    return (
        <div style={{ fontFamily: 'sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Project Board</h2>
                <Link to="/projects" style={{ textDecoration: 'none', color: '#007bff' }}>&larr; Back to Projects</Link>
            </div>

            <form onSubmit={e => { e.preventDefault(); if (newTaskTitle.trim()) createTask.mutate(newTaskTitle); }} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input type="text" placeholder="What needs to be done?" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} style={{ padding: '8px', width: '300px' }} />
                <button type="submit" disabled={createTask.isPending} style={{ padding: '9px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>Add Task</button>
            </form>

            <DragDropContext onDragEnd={onDragEnd}>
                <div style={{ display: 'flex', gap: '20px', flexGrow: 1, overflowX: 'auto' }}>
                    {COLUMNS.map(columnId => (
                        <div key={columnId} style={{ background: '#f4f5f7', padding: '10px', borderRadius: '8px', width: '300px', minWidth: '300px', display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '14px', textTransform: 'uppercase', color: '#5e6c84', marginBottom: '10px' }}>{columnId}</h3>

                            <Droppable droppableId={columnId}>
                                {(provided) => (
                                    <div ref={provided.innerRef} {...provided.droppableProps} style={{ flexGrow: 1, minHeight: '150px' }}>
                                        {tasks.filter(t => t.status === columnId).map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided, snapshot) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        style={{
                                                            padding: '12px', marginBottom: '8px', background: '#fff', borderRadius: '4px',
                                                            boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.1)',
                                                            ...provided.draggableProps.style
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: '500', fontSize: '14px', marginBottom: '8px' }}>{task.title}</div>

                                                        {/* Assignee Dropdown */}
                                                        <select
                                                            value={task.assigneeId || ''}
                                                            onChange={(e) => updateAssignee.mutate({ taskId: task.id, assigneeId: e.target.value })}
                                                            style={{ width: '100%', padding: '4px', fontSize: '12px', border: '1px solid #ccc', borderRadius: '4px' }}
                                                        >
                                                            <option value="">Unassigned</option>
                                                            {users.map(u => (
                                                                <option key={u.id} value={u.id}>{u.name}</option>
                                                            ))}
                                                        </select>

                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </div>
                    ))}
                </div>
            </DragDropContext>
        </div>
    );
};