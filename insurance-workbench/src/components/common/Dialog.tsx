import React from 'react';


export interface DialogProps {
  open: boolean;
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  actions?: React.ReactNode;
}

export const Dialog: React.FC<DialogProps> = ({
  open,
  title,
  children,
  onClose,
  actions,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-[1000] animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-lg min-w-[400px] max-w-[90vw] max-h-[90vh] flex flex-col shadow-2xl animate-zoomIn" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100">
          {title && <h2 className="m-0 text-base font-semibold text-gray-900">{title}</h2>}
          <button className="text-2xl text-gray-500 hover:text-gray-700 p-0 w-6 h-6 flex items-center justify-center" onClick={onClose}>
            &times;
          </button>
        </div>
        <div className="px-8 py-6 overflow-y-auto flex-1">
          {children}
        </div>
        {actions && (
          <div className="px-8 py-6 flex justify-end gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
