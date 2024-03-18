import React, { memo } from 'react';
import './index.scss';

interface IBoxThumbnail {
    src: string;
    height?: number | 'auto';
    spacing?: number;
    className?: string;
}

const BoxThumbnail: React.FC<IBoxThumbnail> = ({ src, height, spacing, className }) => {
    let style = { '--height': height, '--spacing': spacing } as any;

    Object.keys(style).forEach((item) => {
        if (style[item] !== 'auto') {
            style[item] = style[item] ? style[item] + 'px' : null;
        }
    });

    return (
        <div className={`box-thumbnail ${className || ''}`} style={style}>
            <img className="box-thumbnail__img" src={src} alt="Can't load image" />
        </div>
    );
};

export default memo(BoxThumbnail);
