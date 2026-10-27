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

    // Create Task Mutation
    const createTask = useMutation({
        mutationFn: async (title: string) => {
            const response = await api.post('/api/tasks', { title, description: '', projectId });
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            setNewTaskTitle('');
        }
    });

    // Update Task Status Mutation (Optimistic Update)
    const updateStatus = useMutation({
        mutationFn: async ({ taskId, status }: { taskId: string; status: string }) => {
            await api.patch(`/api/tasks/${taskId}/status`, { status });
        },
        onMutate: async (newStatusData) => {
            // Cancel outgoing refetches so they don't overwrite our optimistic update
            await queryClient.cancelQueries({ queryKey: ['tasks', projectId] });
            const previousTasks = queryClient.getQueryData<TaskDto[]>(['tasks', projectId]);

            // Optimistically update the task in the cache
            queryClient.setQueryData<TaskDto[]>(['tasks', projectId], old =>
                old?.map(task => task.id === newStatusData.taskId ? { ...task, status: newStatusData.status } : task)
            );

            return { previousTasks };
        },
        onError: (_err, _newStatusData, context) => {
            // Rollback on error
            if (context?.previousTasks) {
                queryClient.setQueryData(['tasks', projectId], context.previousTasks);
            }
        },
        onSettled: () => {
            // Always refetch after error or success to ensure backend sync
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
        }
    });

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        // Dropped outside a column or didn't move
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }

        // Trigger mutation to change status
        updateStatus.mutate({ taskId: draggableId, status: destination.droppableId });
    };

    const handleCreateTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTaskTitle.trim()) createTask.mutate(newTaskTitle);
    };

    if (isLoading) return <p>Loading board...</p>;

    return (
        <div style={{ fontFamily: 'sans-serif', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Project Board</h2>
                <Link to="/projects" style={{ textDecoration: 'none', color: '#007bff' }}>&larr; Back to Projects</Link>
            </div>

            {/* Add Quick Task */}
            <form onSubmit={handleCreateTask} style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text" placeholder="What needs to be done?"
                    value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                    style={{ padding: '8px', width: '300px' }}
                />
                <button type="submit" disabled={createTask.isPending} style={{ padding: '9px 15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}>
                    Add Task
                </button>
            </form>

            {/* Kanban Board */}
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
                                                            padding: '12px',
                                                            marginBottom: '8px',
                                                            background: '#fff',
                                                            borderRadius: '4px',
                                                            boxShadow: snapshot.isDragging ? '0 5px 10px rgba(0,0,0,0.15)' : '0 1px 2px rgba(0,0,0,0.1)',
                                                            ...provided.draggableProps.style
                                                        }}
                                                    >
                                                        <div style={{ fontWeight: '500', fontSize: '14px' }}>{task.title}</div>
                                                        {task.description && <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>{task.description}</div>}
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