import React from 'react';
import Navigation from '../components/Navigation';

type PublicLayoutProps = {
    children: React.ReactNode;
};

const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
    return (
        <>
            {children}
            <Navigation />
        </>
    );
};

export default PublicLayout;
