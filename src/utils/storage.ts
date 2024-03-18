import { ACCESS_TOKEN, AUTH_SESSION_KEY, REFRESH_TOKEN } from '../constants';

const clearAllToken = () => {
    window.localStorage.removeItem(AUTH_SESSION_KEY);
    window.localStorage.removeItem(ACCESS_TOKEN);
    window.localStorage.removeItem(REFRESH_TOKEN);
    return Promise.resolve();
};

const getToken = () => {
    return window.localStorage.getItem(ACCESS_TOKEN) ?? null;
};

interface ISetCookie {
    name: string;
    value: string;
    days: number;
}

const setCookie = (data: ISetCookie) => {
    let expires = '';
    if (data.days) {
        let date = new Date();
        date.setTime(date.getTime() + data.days * 24 * 60 * 60 * 1000);
        expires = '; expires=' + date.toUTCString();
    }
    document.cookie = data.name + '=' + (data.value || '') + expires + '; path=/';
};

const getCookie = (name: string) => {
    try {
        let nameEQ = name + '=';
        let cookieStore = document.cookie || window.parent.document.cookie;

        for (const value of cookieStore.split(';')) {
            let c = value;
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    } catch (error) {
        console.log(error);
    }
};

const eraseCookie = (name: string) => {
    document.cookie = name + '=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
};

export { clearAllToken, getToken, setCookie, getCookie, eraseCookie };
