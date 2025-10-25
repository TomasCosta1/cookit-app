import "./Modal.css";

export default function Modal({
    open,
    onClose,
    title,
    children,
    closeOnOverlayClick = true,
}) {
    if (!open) return null;

    const handleOverlayClick = () => {
        if (closeOnOverlayClick) onClose?.();
    };

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    {title ? <h3>{title}</h3> : <span />}
                    <button className="modal-close" onClick={onClose} aria-label="Cerrar">
                        ×
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}
