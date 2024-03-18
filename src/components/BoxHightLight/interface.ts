import { ReactNode } from 'react';

export interface IParameterHightlight {
    pY: number;
    hEl: number;
}

export interface BoxHightlightProps {
    selector: HTMLElement;
    tooltipData?: ReactNode;
    isLastSection?: boolean;
    height?: number;
}
