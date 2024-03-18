import React, { useMemo } from 'react';
import './index.scss';

interface SplashProp {
    isOpen: boolean;
    style?: React.CSSProperties;
}

export const Splash: React.FC<SplashProp> = ({ isOpen, style }) => {
    const addClass = useMemo(() => {
        return isOpen ? 'open' : 'hide';
    }, [isOpen]);

    return <div className={`loadding-effect-wrapper ${addClass}`} style={style}></div>;
};

export default Splash;
