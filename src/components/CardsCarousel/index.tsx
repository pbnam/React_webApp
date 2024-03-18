import React from 'react';
import AliceCarousel from 'react-alice-carousel';
import { CARDS_CAROUSEL_PADDING } from '../../constants';

type CardsCarouselProps = {
    children: React.ReactNode;
};

const CardCarousel: React.FC<CardsCarouselProps> = ({ children }) => {
    const responsive = {
        0: { items: 1 },
    };

    return (
        <AliceCarousel
            mouseTracking
            paddingLeft={CARDS_CAROUSEL_PADDING}
            paddingRight={CARDS_CAROUSEL_PADDING}
            disableDotsControls={true}
            disableButtonsControls={true}
            responsive={responsive}
        >
            {children}
        </AliceCarousel>
    );
};

export default CardCarousel;
