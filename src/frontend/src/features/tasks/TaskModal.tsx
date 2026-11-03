import React, { useState, useEffect } from 'react';
import { TaskComments } from './TaskComments';

interface UserDto { id: string; name: string; }
interface TaskDto {
    id: string; title: string; description: string; status: string;
    projectId: string; assigneeId: string | null; assigneeName: string | null;
}

interface TaskModalProps {
    task: TaskDto;
    users: UserDto[];
    readOnly?: boolean; // NEW PROP
    onClose: () => void;
    onUpdateAssignee: (taskId: string, assigneeId: string | null) => void;
    onUpdateDescription: (taskId: string, description: string) => void;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, users, readOnly = false, onClose, onUpdateAssignee, onUpdateDescription }) => {
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [descDraft, setDescDraft] = useState(task.description || '');

    useEffect(() => {
        setDescDraft(task.description || '');
    }, [task.description]);

    const handleSaveDescription = () => {
        if (readOnly) return;
        onUpdateDescription(task.id, descDraft);
        setIsEditingDesc(false);
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
            display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{
                background: 'white', padding: '25px', borderRadius: '8px',
                width: '500px', maxWidth: '90%', maxHeight: '90vh', overflowY: 'auto',
                position: 'relative', fontFamily: 'sans-serif'
            }}>
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '15px', right: '20px', background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#6c757d' }}
                >
                    &times;
                </button>

                <h2 style={{ marginTop: 0, marginBottom: '10px' }}>{task.title}</h2>
                <div style={{ display: 'inline-block', padding: '4px 8px', background: '#e2e3e5', borderRadius: '12px', fontSize: '12px', marginBottom: '20px' }}>
                    {task.status}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#495057', marginBottom: '5px' }}>Assignee</label>
                    {readOnly ? (
                        <div style={{ padding: '8px', fontSize: '14px', background: '#f8f9fa', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                            {task.assigneeName ? task.assigneeName.split('@')[0] : 'Unassigned'}
                        </div>
                    ) : (
                        <select
                            value={task.assigneeId || ''}
                            onChange={(e) => onUpdateAssignee(task.id, e.target.value)}
                            style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' }}
                        >
                            <option value="">Unassigned</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                    )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                        <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#495057' }}>Description</label>
                        {!isEditingDesc && !readOnly && (
                            <button
                                onClick={() => setIsEditingDesc(true)}
                                style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', fontSize: '12px' }}
                            >
                                ✎ Edit
                            </button>
                        )}
                    </div>

                    {isEditingDesc && !readOnly ? (
                        <div>
                            <textarea
                                value={descDraft}
                                onChange={(e) => setDescDraft(e.target.value)}
                                style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '4px', border: '1px solid #007bff', minHeight: '80px', boxSizing: 'border-box' }}
                                autoFocus
                            />
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                <button onClick={handleSaveDescription} style={{ padding: '6px 12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Save</button>
                                <button onClick={() => { setIsEditingDesc(false); setDescDraft(task.description || ''); }} style={{ padding: '6px 12px', background: '#e2e3e5', color: '#333', border: 'none', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Cancel</button>
                            </div>
                        </div>
                    ) : (
                        <div
                            onClick={() => { if (!readOnly) setIsEditingDesc(true); }}
                            style={{ padding: '10px', background: '#f8f9fa', borderRadius: '4px', fontSize: '14px', minHeight: '50px', cursor: readOnly ? 'default' : 'pointer', border: '1px solid transparent' }}
                            title={readOnly ? '' : 'Click to edit'}
                        >
                            {task.description || <span style={{ color: '#adb5bd', fontStyle: 'italic' }}>No description provided.</span>}
                        </div>
                    )}
                </div>

                {/* TaskComments remains fully interactive for Clients */}
                <TaskComments taskId={task.id} />
            </div>
        </div>
    );
};