import { useRef, useEffect, useCallback, MutableRefObject } from 'react';
import axios, { CancelTokenSource } from 'axios';

const useCancelToken = () => {
    const axiosSource = useRef() as MutableRefObject<CancelTokenSource>;
    const newCancelToken = useCallback(() => {
        axiosSource.current = axios.CancelToken.source();
        return axiosSource.current.token;
    }, []);

    useEffect(
        () => () => {
            axiosSource.current && axiosSource.current.cancel();
        },
        [],
    );

    return { newCancelToken };
};

export default useCancelToken;
