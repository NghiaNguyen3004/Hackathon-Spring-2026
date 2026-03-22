import { ReactNode } from "react";

interface ModalProps{
    isOpen : boolean;
    onClose: any;
    children : ReactNode;

}

export default function Modal({isOpen, onClose, children}:ModalProps){
    if (!isOpen) return null
 
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl p-6 w-full max-w-md mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>
 
        {/* Content passed in from parent */}
        {children}
      </div>
    </div>
  )
}