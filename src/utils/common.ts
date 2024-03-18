import moment from 'moment';
import { CURRENCY_CURRENT, DATE_FROM_API_FORMAT, FORMAT_DATE_SHORT, SEN_UNIT } from '../constants';
import html2canvas from 'html2canvas';
import { IDataDefaultField } from '../api/bill/interface';
import { IPlatformAccess } from '../redux/auth/slice';
import { statusBill } from '../redux/bill/silce';

export function convertCurrency(price: number, cur?: string, locales?: string) {
    const localesCurrent = !locales ? 'en-US' : locales;
    const curCurrent = !cur ? CURRENCY_CURRENT : cur;
    const formatter = new Intl.NumberFormat(localesCurrent, {
        style: 'currency',
        currency: curCurrent,
    });

    if (curCurrent === CURRENCY_CURRENT) {
        return 'RM' + formatter.format(price).substring(3);
    }

    return formatter.format(price);
}

export function randomDate(start: Date, end: Date) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

//Format time from api to below format
export const getFormattedTransactionTime = (date: string): string => {
    const time = moment(date, DATE_FROM_API_FORMAT);
    return time.format('D MMM YYYY , h:mmA');
};

export async function makeScreenshot(selector: any) {
    return new Promise((resolve) => {
        html2canvas(selector, { foreignObjectRendering: true, scale: 1 })
            .then((canvas) => {
                let pngUrl = canvas.toDataURL('image/png', 1.0);
                resolve(pngUrl);
            })
            .catch((err) => console.log(err));
    });
}

export const convertArrayToObject = (arr: IDataDefaultField[]) => {
    return arr.reduce((acc: any, { name, value }) => {
        acc[name] = value;
        return acc;
    }, {});
};

export const formatAccountNumber = (str: string) => {
    try {
        return str
            .replace(/[^\dA-Z]/g, '')
            .replace(/(.{4})/g, '$1 ')
            .trim();
    } catch (error) {
        return str;
    }
};

export const formatISODate = (date: string, format = FORMAT_DATE_SHORT) => {
    try {
        return moment(date).format(format);
    } catch (error) {
        return date;
    }
};

export const formatCustomDate = (date: string, formatFrom: string, formatTo = FORMAT_DATE_SHORT) => {
    try {
        return moment(date, formatFrom).format(formatTo);
    } catch (error) {
        return date;
    }
};

export const detectWebView = () => {
    try {
        let userAgent = window.navigator.userAgent.toLowerCase();

        let deviceData = {
            ios: /iphone|ipod|ipad/.test(userAgent),
            android: /android/.test(userAgent),
            win: /windows/.test(userAgent),
        };

        let platformAccess: IPlatformAccess = {
            type: deviceData.ios || deviceData.android ? 'App' : 'Web',
            device: 'other',
        };

        for (const [key, value] of Object.entries(deviceData)) {
            if (value) {
                platformAccess.device = key as IPlatformAccess['device'];
            }
        }

        return platformAccess;
    } catch (error) {
        console.log(error);
    }
};

export const convertSenToRM = (sen: number) => {
    return sen / SEN_UNIT;
};

export const makeid = (length: number): string => {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
};

export const checkingBillType = (outstandingAmount: string): statusBill => {
    if (outstandingAmount) {
        return Number(outstandingAmount.slice(3)) <= 0 ? 'paid' : 'due';
    } else {
        return null;
    }
};

export const convertData = (data: any) => {
    return data === 'N/A' || !data ? null : data;
};

export const debounce = (fn: (value: any) => void, timeOut: number) => {
    let timer: any;

    return (...arg: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arg);
        }, timeOut);
    };
};
