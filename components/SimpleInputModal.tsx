// C:\Users\aliak\Desktop\Док-оборот\microservice\components\SimpleInputModal.tsx
// --- НОВЫЙ ФАЙЛ ---

import React, { useState } from 'react';

interface SimpleInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
  title: string;
  label: string;
  inputType?: 'text' | 'textarea' | 'date';
  isLoading?: boolean;
  submitText?: string;
}

const SimpleInputModal: React.FC<SimpleInputModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  label,
  inputType = 'text',
  isLoading = false,
  submitText = 'Saqlash',
}) => {
  const [value, setValue] = useState(inputType === 'date' ? new Date().toISOString().split('T')[0] : '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim() === '') {
      alert("Iltimos, maydonni to'ldiring.");
      return;
    }
    onSubmit(value);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md p-6 text-white bg-black/20 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="modal-input" className="block mb-1 text-sm font-medium text-white/80">
                {label}
              </label>
              {inputType === 'textarea' ? (
                <textarea
                  id="modal-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  rows={4}
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md focus:ring-primary focus:border-primary"
                />
              ) : (
                <input
                  type={inputType}
                  id="modal-input"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  required
                  className="w-full p-2 bg-white/10 border border-white/20 rounded-md focus:ring-primary focus:border-primary"
                />
              )}
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-4 mt-4 border-t border-white/20">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-white bg-primary rounded-lg hover:bg-primary-dark disabled:bg-opacity-50"
            >
              {isLoading ? 'Yuborilmoqda...' : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleInputModal;