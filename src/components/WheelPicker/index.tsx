import React, { useEffect, useMemo, useRef, useState } from 'react';

import './index.scss';

export interface IDataWheelType {
    id: number;
    name: string;
    values: any[];
}

export interface IWheelOptionType {
    pickerOpen: boolean;
    data: IDataWheelType[];
    defaultSelection: number;
    defaultItemIndex: number;
    selection: string;
}

type Props = {
    height: number;
    scrollerId: any;
    defaultSelection: number;
    defaultItemIndex: number;
    data: IDataWheelType[];
    updateSelection: (index: any, sectionIndex: any) => void;
    fontSize: number;
    parentHeight: number;
};

export const WheelPicker: React.FC<Props> = (props) => {
    const [sectionDataIndex, setSectionDataIndex] = useState(props.defaultSelection);
    const [itemIndex, setItemIndex] = useState(props.defaultItemIndex);

    const sectionData = useMemo(() => {
        return props.data[sectionDataIndex];
    }, [props.data, sectionDataIndex]);

    const _scrollTimer = useRef<any | null>(null);

    const scrollSectionYEl = useMemo(() => {
        return sectionDataIndex === 0 ? 0 : sectionDataIndex * props.height - 1;
    }, [sectionDataIndex, props.height]);

    const scrollYEl = useMemo(() => {
        return itemIndex === 0 ? 0 : itemIndex * props.height - 1;
    }, [itemIndex, props.height]);

    const parentHeight = useMemo(() => {
        return props.parentHeight || props.height * sectionData.values.length;
    }, [props.height, sectionData.values, props.parentHeight]);

    const handleScroll = (e: any) => {
        e.preventDefault();

        if (_scrollTimer.current) clearTimeout(_scrollTimer.current);

        let scroll = e.srcElement.scrollTop as number; // scroll value
        let itemInSelectorArea = parseInt(String((scroll + props.height / 2) / props.height), 10); // add (height/2) to adjust error

        let currentEl = document.getElementById(`${e.srcElement.id}-scroll-item--${itemInSelectorArea}`) as HTMLElement;

        const childrentEls = e.target.querySelectorAll('.scroll-item');
        childrentEls.forEach((item: HTMLSpanElement) => {
            item.classList.remove('selected-time');
        });
        currentEl.classList.add('selected-time');

        function finishedScrolling() {
            if (e.srcElement.id === `${props.scrollerId}--left`) {
                setSectionDataIndex(itemInSelectorArea);
            } else if (e.srcElement.id === `${props.scrollerId}--right` || e.srcElement.id === `${props.scrollerId}`) {
                setItemIndex(itemInSelectorArea);
            }

            let targetEl = document.getElementById(e.srcElement.id) as HTMLElement;
            let scrollHeight = itemInSelectorArea * props.height;
            targetEl &&
                targetEl.scroll({
                    top: scrollHeight,
                    behavior: 'smooth',
                });
        }
        _scrollTimer.current = window.setTimeout(() => finishedScrolling(), 150);
    };

    const contentPadding: React.CSSProperties = useMemo(() => {
        return {
            paddingTop: parentHeight / 2 - props.height / 2,
            paddingBottom: parentHeight / 2 - props.height / 2,
        };
    }, [parentHeight]);

    const itemStyle: React.CSSProperties = useMemo(() => {
        return {
            minHeight: props.height,
            maxHeight: props.height,
        };
    }, []);

    const handleClickItem = (m: number, align = 'right') => {
        let el = document.getElementById(props.data.length === 1 ? props.scrollerId : `${props.scrollerId}--${align}`) as HTMLElement;
        el.scroll({ top: m * props.height, behavior: 'smooth' });
    };

    const renderListItems = useMemo(() => {
        const preFixId = props.data.length === 1 ? props.scrollerId : `${props.scrollerId}--right`;
        return sectionData.values.map((item: any, index: any) => (
            <div
                key={index}
                style={itemStyle}
                id={`${preFixId}-scroll-item--${index}`}
                className={`scroll-item ${index === 0 ? 'selected-time' : ''}`}
                onClick={(e: any) => {
                    handleClickItem(Number(e.target.id.split('item--')[1]));
                }}
            >
                {item}
            </div>
        ));
    }, [sectionData.values]);

    const renderListLabel = useMemo(() => {
        return props.data.map((item: IDataWheelType, index: any) => {
            return (
                <div
                    key={item.id}
                    id={`${props.scrollerId}--left-scroll-item--${index}`}
                    className="scroll-item"
                    style={itemStyle}
                    onClick={(e: any) => {
                        handleClickItem(Number(e.target.id.split('item--')[1]), 'left');
                    }}
                >
                    {item.name}
                </div>
            );
        });
    }, [props.data]);

    // Add class selected for label
    useEffect(() => {
        props.data.length > 1 && document.getElementById(`${props.scrollerId}--left-scroll-item--${sectionDataIndex}`)?.classList.add('selected-time');
    }, []);

    // Update data
    useEffect(() => {
        props.updateSelection(itemIndex, sectionDataIndex);
    }, [itemIndex, sectionDataIndex]);

    // sccroll to default data
    useEffect(() => {
        if (props.data.length === 1) {
            let scroller = document.getElementById(props.scrollerId) as HTMLElement;
            scroller.addEventListener('scroll', handleScroll);

            scroller.scrollTo({
                top: scrollYEl,
            });

            return () => {
                scroller.removeEventListener('scroll', handleScroll);
            };
        } else {
            let scroller1 = document.getElementById(`${props.scrollerId}--left`) as HTMLElement;
            let scroller2 = document.getElementById(`${props.scrollerId}--right`) as HTMLElement;
            scroller1.addEventListener('scroll', handleScroll);
            scroller1.scrollTo({
                top: scrollSectionYEl,
            });

            scroller2.addEventListener('scroll', handleScroll);
            scroller2.scrollTo({
                top: scrollYEl,
            });

            return () => {
                scroller1 && scroller1.removeEventListener('scroll', handleScroll);
                scroller2 && scroller2.removeEventListener('scroll', handleScroll);
            };
        }
    }, []);

    return (
        <div className="wheelPicker-scroll-wrapper fadeInAndOut" style={{ height: parentHeight + 'px' }}>
            <div
                className="wheelPicker-scroll-wrapper__area"
                style={{
                    height: props.height + 'px',
                    top: `${parentHeight / 2 - props.height / 2}px`,
                }}
                id={props.scrollerId + '--scroll-selector-area'}
            ></div>
            <div className={`wheelPicker-scroll-wrapper__list ${props.data.length === 1 ? 'open-scroll' : ''}`} id={props.scrollerId}>
                {props.data.length === 1 ? (
                    <div style={contentPadding}>{renderListItems}</div>
                ) : (
                    <div className="row-flex" style={{ height: parentHeight + 'px' }}>
                        <div className="col-flex-2 open-scroll" id={`${props.scrollerId}--left`}>
                            <div style={contentPadding}> {renderListLabel} </div>
                        </div>
                        <div className="col-flex-2 open-scroll" id={`${props.scrollerId}--right`}>
                            <div style={contentPadding}>{renderListItems} </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WheelPicker;
