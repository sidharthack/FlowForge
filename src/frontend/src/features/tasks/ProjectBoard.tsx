import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd';
import api from '../../lib/api';
import { TaskModal } from './TaskModal';

interface TaskDto {
    id: string; title: string; description: string; status: string;
    projectId: string; assigneeId: string | null; assigneeName: string | null;
}
interface UserDto { id: string; name: string; }

const COLUMNS = ['To Do', 'In Progress', 'Done'];

export const ProjectBoard = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [newTaskTitle, setNewTaskTitle] = useState('');

    // NEW: State for tracking the open task modal
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

    const { data: tasks = [], isLoading } = useQuery<TaskDto[]>({
        queryKey: ['tasks', projectId],
        queryFn: async () => (await api.get(`/api/projects/${projectId}/tasks`)).data,
        enabled: !!projectId,
    });

    const { data: users = [] } = useQuery<UserDto[]>({
        queryKey: ['users'],
        queryFn: async () => (await api.get('/api/users')).data,
    });

    const createTask = useMutation({
        mutationFn: async (title: string) => (await api.post('/api/tasks', { title, description: '', projectId })).data,
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tasks', projectId] }); setNewTaskTitle(''); }
    });

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
        onError: (_err, _newStatusData, context) => {
            if (context?.previousTasks) queryClient.setQueryData(['tasks', projectId], context.previousTasks);
        },
        onSettled: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    });

    const updateAssignee = useMutation({
        mutationFn: async ({ taskId, assigneeId }: { taskId: string; assigneeId: string | null }) =>
            api.patch(`/api/tasks/${taskId}/assignee`, { assigneeId: assigneeId || null }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    });
    // Update Description Mutation
    const updateDescription = useMutation({
        mutationFn: async ({ taskId, description }: { taskId: string; description: string }) =>
            api.patch(`/api/tasks/${taskId}/description`, { description }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks', projectId] })
    });
    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) return;
        updateStatus.mutate({ taskId: draggableId, status: destination.droppableId });
    };

    if (isLoading) return <p>Loading board...</p>;

    const selectedTask = tasks.find(t => t.id === selectedTaskId);

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
                                                        onClick={() => setSelectedTaskId(task.id)} // Click to open modal
                                                        style={{
                                                            padding: '12px', marginBottom: '8px', background: '#fff', borderRadius: '4px',
                                                            boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.1)',
                                                            cursor: 'pointer', // Show pointer cursor on hover
                                                            ...provided.draggableProps.style
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{task.title}</div>
                                                        {/* Render a subtle assignee badge if assigned */}
                                                        {task.assigneeName && (
                                                            <div style={{ fontSize: '11px', color: '#007bff', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                👤 {task.assigneeName.split('@')[0]}
                                                            </div>
                                                        )}
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

            {/* Render Modal if a task is selected */}
            {selectedTask && (
                <TaskModal
                    task={selectedTask}
                    users={users}
                    onClose={() => setSelectedTaskId(null)}
                    onUpdateAssignee={(taskId, assigneeId) => updateAssignee.mutate({ taskId, assigneeId })}
                    onUpdateDescription={(taskId, description) => updateDescription.mutate({ taskId, description })}
                />
            )}
        </div>
    );
};