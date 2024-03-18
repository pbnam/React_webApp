import React from 'react';

interface IHighLightTextProps {
    text: string;
    highlight: string;
    onHandle: () => void;
    className: string;
}

const HighLightText: React.FC<IHighLightTextProps> = ({ text, highlight, onHandle, className }) => {
    if (!highlight.trim()) {
        return (
            <span onClick={onHandle} className={className}>
                {text}
            </span>
        );
    }
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);

    return (
        <span onClick={onHandle} className={className}>
            {parts.filter(String).map((part, i) => {
                return regex.test(part) ? <mark key={i}>{part}</mark> : <span key={i}>{part}</span>;
            })}
        </span>
    );
};

export default HighLightText;
