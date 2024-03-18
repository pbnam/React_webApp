import React, { useMemo } from 'react';
import './index.scss';

export enum sizeButton {
    // eslint-disable-next-line no-unused-vars
    sizeL = 'medium',
    // eslint-disable-next-line no-unused-vars
    sizeXL = 'large',
}

interface IButtonProps {
    fullWidth?: boolean;
    size?: sizeButton;
    children: React.ReactNode | string;
    hasOutline?: boolean;
    onClick?: React.MouseEventHandler<HTMLButtonElement> | undefined;
    className?: string;
    style?: React.CSSProperties;
}

const BillButton: React.FC<IButtonProps> = ({ children, fullWidth, size, hasOutline = false, className, ...props }) => {
    const mutilClass = useMemo(() => {
        const prefix = 'bill-button--';
        const attrData = {
            width: fullWidth ? 'fullWidtth' : 'default',
            size: size || sizeButton.sizeL,
            outline: hasOutline ? 'outline' : 'none',
        };

        return Object.values(attrData)
            .map((item) => prefix + item)
            .join(' ');
    }, [fullWidth, size, hasOutline]);

    return (
        <button className={`bill-button ${mutilClass} ${className || ''}`} {...props}>
            {children}
        </button>
    );
};

export default BillButton;
