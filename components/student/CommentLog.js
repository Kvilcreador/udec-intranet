'use client';
import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { addComment } from '@/lib/data';

export default function CommentLog({ studentId, comments, onUpdate }) {
    const { currentUser } = useAuth();
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text) return;

        addComment(studentId, {
            user: currentUser.email,
            text: text
        });

        setText('');
        if (onUpdate) onUpdate();
    };

    return (
        <div className="bg-white border rounded-lg overflow-hidden flex flex-col h-[500px]">
            <div className="bg-gray-50 p-4 border-b">
                <h3 className="font-bold text-sm text-gray-700">Comentarios de Seguimiento</h3>
                <p className="text-xs text-gray-500">Chat de coordinación interna</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {comments && comments.length > 0 ? comments.map(c => {
                    const isMe = c.user === currentUser.email;
                    return (
                        <div key={c.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[85%] p-3 rounded-lg text-sm ${isMe ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'}`}>
                                <p>{c.text}</p>
                            </div>
                            <span className="text-[10px] text-gray-400 mt-1">
                                {c.user.split('@')[0]} • {c.date}
                            </span>
                        </div>
                    )
                }) : (
                    <div className="h-full flex items-center justify-center text-gray-300 text-sm italic">
                        No hay comentarios aún.
                    </div>
                )}
            </div>

            <form onSubmit={handleSubmit} className="p-4 bg-gray-50 border-t flex gap-2">
                <input
                    className="flex-1 p-2 border rounded text-sm focus:outline-none focus:border-blue-500"
                    placeholder="Escriba un comentario..."
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <button type="submit" disabled={!text} className="px-4 py-2 bg-blue-600 text-white rounded font-bold text-sm hover:bg-blue-700 disabled:opacity-50">
                    Enviar
                </button>
            </form>
        </div>
    );
}
