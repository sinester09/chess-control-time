
import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onToggle: (id: number) => void;
  onComplete: (id: number) => void;
  onDelete: (id: number) => void;
  toleranceTime?: number;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onToggle, onComplete, onDelete, toleranceTime = 300 }) => {
  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-slate-800/50 rounded-lg">
        <h3 className="text-lg font-semibold text-slate-300">No tasks yet!</h3>
        <p className="text-slate-400">Add a task above to get started.</p>
      </div>
    );
  }

  return (
    <div>
      {tasks.map(task => (
        <TaskItem 
          key={task.id}
          task={task}
          onToggle={onToggle}
          onComplete={onComplete}
          onDelete={onDelete}
          toleranceTime={toleranceTime}
        />
      ))}
    </div>
  );
};

export default TaskList;
