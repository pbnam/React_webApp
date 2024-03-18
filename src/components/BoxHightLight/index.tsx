import React, { useEffect, useState } from 'react';
import './index.scss';
import { BoxHightlightProps, IParameterHightlight } from './interface';

const hightlightStylesBot = {
    top: 0,
    height: 0,
};

const hightlightStylesMid = {
    top: 0,
    height: 0,
};

const hightlightStylesTop = {
    top: 0,
    height: 0,
};

const BoxHightLight: React.FC<BoxHightlightProps> = ({ selector, tooltipData, isLastSection = false, height = selector?.offsetHeight }) => {
    const [hightlightStyleBot, setHightlightStyleBot] = useState(hightlightStylesBot);
    const [hightlightStyleTop, setHightlightStyleTop] = useState(hightlightStylesTop);
    const [hightlightStyleMid, setHightlightStyleMid] = useState(hightlightStylesMid);

    const handleHightlight = ({ pY, hEl }: IParameterHightlight) => {
        setHightlightStyleTop({
            top: 0,
            height: pY,
        });

        setHightlightStyleMid({
            top: pY,
            height: hEl,
        });

        setHightlightStyleBot({
            top: pY + hEl,
            height: window.innerHeight - pY,
        });
    };

    useEffect(() => {
        if (selector) {
            try {
                const offsetTop = window.innerHeight < selector?.offsetTop + height * 2 ? selector?.offsetTop + height * 2 - window.innerHeight : 0;
                if (!isLastSection) {
                    window.scrollTo({
                        top: offsetTop,
                        left: 100,
                        behavior: 'smooth',
                    });
                } else {
                    selector.scrollIntoView();
                }

                setTimeout(() => {
                    handleHightlight({
                        pY: selector.offsetTop - offsetTop,
                        hEl: height as number,
                    });
                }, 300);

                setTimeout(() => {
                    document.body.classList.add('hightlight-open');
                }, 500);
            } catch (error) {
                console.log(error);
            }
        }
    }, [selector]);

    return (
        <div className="hightlight-overlay" id="hightlight-overlay">
            <div className="hightlight-overlay__backout-top" style={hightlightStyleTop}></div>
            <div className="hightlight-overlay__box" style={hightlightStyleMid}>
                <div className="box-hightlight"></div>
                {tooltipData && <div className="box-tooltip">{tooltipData}</div>}
            </div>
            <div className="hightlight-overlay__backout-bot" style={hightlightStyleBot}></div>
        </div>
    );
};

export default BoxHightLight;
