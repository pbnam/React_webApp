import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftSVG } from '../../allSvg';

import './index.scss';

interface IBreadcrumbProps {
    className?: string;
    breadName?: string;
    verticalStyle?: boolean;
    onClick?: () => void;
}

const Breadcrumb: React.FC<IBreadcrumbProps> = ({ className = '', breadName, verticalStyle, onClick }) => {
    const navigate = useNavigate();

    const handclick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1);
        }
    };

    const addClass = useMemo(() => {
        return verticalStyle ? 'site-breadcrumb--vertical' : '';
    }, []);

    return (
        <div className={`site-breadcrumb container ${addClass} ${className}`}>
            <div className="site-breadcrumb__icon" onClick={handclick}>
                <ArrowLeftSVG />
            </div>
            {breadName && <h2 className="site-breadcrumb__name">{breadName}</h2>}
        </div>
    );
};

export default Breadcrumb;
