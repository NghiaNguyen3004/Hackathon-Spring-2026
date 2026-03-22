"use client";
import {ReactElement, ReactNode, useEffect} from "react";

interface RequestModalProps {
    children :ReactNode;
    isOpen: boolean;
    onClose: () => void; //to handle when to close the modal
}

export default function RequestModal({
    children,
    isOpen,
    onClose
} : RequestModalProps){

    if (!isOpen) return null;
    const handleClose = (e)=>{
       if (e.target.id === 'wrapper') onClose();
    }

    //Disable the behind when open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return(): void => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    

    return(
        <main>
            <div className = "fixed top-0 left-0 w-screen h-screen z-40 bg-black bg-opacity-50" onClick={handleClose} id ='wrapper'/>
            <div className="w-[600px] flex flex-col">
                <button className = "text-black text-xl place-self-end" onClick={() => onClose()}>X</button>
                <div className ="bg-black p-10 text-center">
                    <div className= "bg-white p-2 rounded">{children}</div>
                </div>
            </div>
            
        </main>
        
        
    );
    
}