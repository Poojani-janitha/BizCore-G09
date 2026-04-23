import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';

const Portal = ({ children, targetElement }) => {
    const [mounted, setMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        setMounted(true);

        const updatePosition = () => {
            if (targetElement && targetElement.current) {
                const rect = targetElement.current.getBoundingClientRect();
                setPosition({
                    top: rect.bottom + window.scrollY,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                });
            }
        };

        updatePosition();

        window.addEventListener('resize', updatePosition);
        const scrollableParent = document.querySelector('.table-responsive');
        if (scrollableParent) {
            scrollableParent.addEventListener('scroll', updatePosition);
        }


        return () => {
            setMounted(false);
            window.removeEventListener('resize', updatePosition);
            if (scrollableParent) {
                scrollableParent.removeEventListener('scroll', updatePosition);
            }
        };
    }, [targetElement]);

    if (!mounted) return null;

    const portalElement = document.getElementById('portal-container');
    if (!portalElement) return null;

    return createPortal(
        <div style={{ position: 'absolute', top: `${position.top}px`, left: `${position.left}px`, width: `${position.width}px`, zIndex: 9999 }}>
            {children}
        </div>,
        portalElement
    );
};

export default Portal;
