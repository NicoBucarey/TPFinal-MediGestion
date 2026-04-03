import React from 'react';

const DocumentPreviewModal = ({ open, onClose, url, type, title = 'Vista previa' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>
        <div className="p-4 h-[70vh]">
          {type === 'pdf' ? (
            <embed src={url} type="application/pdf" className="w-full h-full rounded-lg" />
          ) : (
            <img src={url} alt="Documento" className="max-h-full mx-auto rounded-lg" />
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentPreviewModal;
