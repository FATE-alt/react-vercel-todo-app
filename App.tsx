
import React, { useState, useEffect, useCallback, FormEvent } from 'react';

// Define the type for a single task
interface Task {
  id: number;
  text: string;
  created_at: string;
}

// Loading Spinner Component
const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center p-4">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
  </div>
);

// Error Message Component
interface ErrorMessageProps {
  message: string;
}
const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => (
  <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md relative" role="alert">
    <strong className="font-bold">Error: </strong>
    <span className="block sm:inline">{message}</span>
  </div>
);


export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/getTasks');
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      const data = await response.json();
      setTasks(data.tasks);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddTask = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;

    try {
      const response = await fetch('/api/addTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: newTaskText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add task');
      }

      setNewTaskText('');
      await getTasks(); // Refresh the list
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred while adding task');
    }
  };

  return (
    <div className="min-h-screen bg-primary font-sans">
      <main className="max-w-xl mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-accent to-indigo-400">
            ToDo List
          </h1>
          <p className="text-text-secondary mt-2">Powered by Vercel and React</p>
        </header>

        <div className="bg-secondary p-6 rounded-lg shadow-2xl shadow-black/50">
          <form onSubmit={handleAddTask} className="flex gap-3">
            <input
              type="text"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              placeholder="Add a new task..."
              className="flex-grow bg-primary border-2 border-gray-700 rounded-md px-4 py-2 text-text-primary focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
            />
            <button
              type="submit"
              className="bg-accent hover:bg-indigo-500 text-white font-bold py-2 px-5 rounded-md transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!newTaskText.trim()}
            >
              Add
            </button>
          </form>
        </div>

        <div className="mt-8">
          {error && <ErrorMessage message={error} />}
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <ul className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <li
                    key={task.id}
                    className="bg-secondary p-4 rounded-lg shadow-lg flex items-center justify-between transition-transform hover:scale-[1.02]"
                  >
                    <span className="text-text-primary">{task.text}</span>
                    <span className="text-xs text-text-secondary">
                      {new Date(task.created_at).toLocaleDateString()}
                    </span>
                  </li>
                ))
              ) : (
                <div className="text-center py-8 px-4 bg-secondary rounded-lg">
                  <p className="text-text-secondary">No tasks yet. Add one above to get started!</p>
                </div>
              )}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
