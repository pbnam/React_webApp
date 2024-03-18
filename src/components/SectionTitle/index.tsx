import React from 'react';

interface SectionTitleProps {
    title: string;
    labelButton?: string;
    onClick?: () => void;
}
const SectionTitle: React.FC<SectionTitleProps> = ({ title, labelButton, onClick }) => {
    return (
        <div className="bill-section-title">
            <h5 className="bill-section-title__name">{title}</h5>
            <button className="bill-section-title__btn" onClick={onClick}>
                {labelButton}
            </button>
        </div>
    );
};

export default SectionTitle;
