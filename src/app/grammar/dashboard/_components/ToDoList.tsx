// app/grammar/dashboard/_components/TodoList.tsx

'use client';

import { useState } from 'react';
import { TodoItem, mockTodos } from './mockData';
import { CheckCircleIcon, CircleStackIcon } from '@heroicons/react/24/solid';

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>(mockTodos);

  const toggleCompletion = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  return (
    <div className="bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">TODOリスト</h2>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <button onClick={() => toggleCompletion(todo.id)}>
                {todo.completed ? (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                ) : (
                  <CircleStackIcon className="h-6 w-6 text-gray-300" />
                )}
              </button>
              <span
                className={`ml-3 text-lg ${
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                }`}
              >
                {todo.task}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
