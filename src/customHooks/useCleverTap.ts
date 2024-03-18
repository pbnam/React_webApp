import { useEffect } from 'react';
import clevertap from 'clevertap-web-sdk';
import { useSelector } from 'react-redux';
import { RootState } from '../redux';
import { BuildVariants } from '../config';
import { CLEVER_TAP_ACCOUNT_ID, CLEVER_TAP_PROD_ACCOUNT_ID } from '../constants';

export interface ICleverTagData {
    [x: string]: any;
    channel: string;
    section: string;
    screen?: string;
    action?: string;
    payload?: any;
}

const useCleverTap = () => {
    const authData = useSelector((state: RootState) => state.auth);

    const initCleverTap = () => {
        clevertap.init(process.env.REACT_APP_ENV === BuildVariants.PRODUCTION ? CLEVER_TAP_PROD_ACCOUNT_ID : CLEVER_TAP_ACCOUNT_ID);
        clevertap.privacy.push({ optOut: false });
        clevertap.privacy.push({ useIP: false });
        process.env.REACT_APP_ENV !== BuildVariants.PRODUCTION && clevertap.setLogLevel(3);
    };

    const logoutCleverTap = () => {
        clevertap.logout();
    };

    const handlePushEventCleverTap = (data: ICleverTagData) => {
        // format as channel_section_screen_action
        try {
            let eventName = [];
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    key !== 'payload' && data[key] && eventName.push(data[key]);
                }
            }
            let formatEvent = eventName.toString().replace(/,/g, '-');

            if (formatEvent) {
                data.payload ? clevertap.event.push(formatEvent, data.payload) : clevertap.event.push(formatEvent);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (authData.auth) {
            initCleverTap();

            return () => {
                logoutCleverTap();
            };
        }
    }, [authData.auth]);

    return {
        handlePushEventCleverTap,
    };
};

export default useCleverTap;
