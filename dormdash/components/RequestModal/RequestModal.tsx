"use client";
import { ReactNode, useEffect } from "react";
import styles from "./RequestModal.module.css";

interface RequestModalProps {
    children: ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export default function RequestModal({
    children,
    isOpen,
    onClose,
}: RequestModalProps) {
    useEffect(() => {
        if (!isOpen) return;

        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div
                className={styles.modal}
                onClick={(event) => event.stopPropagation()}
                role="dialog"
                aria-modal="true"
            >
                <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
                    x
                </button>
                <div className={styles.content}>{children}</div>
            </div>
        </div>
    );
}