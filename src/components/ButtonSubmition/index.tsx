import { Button } from 'antd';
import React, { useMemo } from 'react';
import './index.scss';

interface ButtonSubmitionProps {
    isDisabled: boolean;
    loadingAnimation?: boolean;
    children: React.ReactNode | string;
}

const ButtonSubmition: React.FC<ButtonSubmitionProps> = ({ isDisabled, loadingAnimation = false, children }) => {
    const loadingClass = useMemo(() => {
        return loadingAnimation ? 'bill-submit-btn--loading' : '';
    }, [loadingAnimation]);

    return (
        <Button className={`bill-submit-btn ${loadingClass}`} type="primary" htmlType="submit" disabled={isDisabled}>
            {children}
        </Button>
    );
};

export default ButtonSubmition;
