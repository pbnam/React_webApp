import { Drawer as AntDrawer, DrawerProps, Space } from 'antd';
import React, { ReactNode } from 'react';
import './index.scss';

interface IDrawerProps extends DrawerProps {
    icon?: ReactNode;
}

const defaultMaskStyle = {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
};

const defaultHeaderStyle = {
    border: 'none',
};

const Drawer: React.FC<IDrawerProps> = ({
    maskStyle = defaultMaskStyle,
    headerStyle = defaultHeaderStyle,
    height = 'auto',
    children,
    icon,
    closable = true,
    className = '',
    maskClosable = true,
    ...props
}) => {
    return (
        <AntDrawer
            maskClosable={maskClosable}
            className={`bill-drawer ${className}`}
            placement="bottom"
            height={height}
            maskStyle={maskStyle}
            headerStyle={headerStyle}
            extra={icon && <Space>{icon}</Space>}
            closable={closable}
            {...props}
        >
            {children}
        </AntDrawer>
    );
};

export default Drawer;
