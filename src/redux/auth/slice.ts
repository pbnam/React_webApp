import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { IPinLogPayload } from '../../api/interface';
import { IDataGetWalletApiRes } from '../../api/wallet';
import { checkAuthentication, getValidationPin, postRepresentmentConsent, updateAccountSettings, verifyRepresentmentConsent } from './thunk';

export interface IPlatformAccess {
    type: 'Web' | 'App';
    device: 'ios' | 'android' | 'window' | 'other';
}

export interface IAccountSetting {
    consentUpdated: boolean | null;
    saveBillerShowed: boolean | null;
    tutorialShowed: boolean | null;
}

interface IPinLog extends IPinLogPayload {
    message: string;
    checked: boolean;
}

//
export interface AuthState {
    isLogging: boolean;
    auth?: boolean | null;
    currentUser?: IDataGetWalletApiRes;
    platformAccess: IPlatformAccess;
    accountSetting: IAccountSetting;
    pinLog: IPinLog;
}

const initialState: AuthState = {
    isLogging: false,
    auth: null,
    currentUser: {} as IDataGetWalletApiRes,
    platformAccess: {
        type: 'App',
        device: 'other',
    },
    accountSetting: {
        consentUpdated: null,
        saveBillerShowed: null,
        tutorialShowed: null,
    },
    pinLog: {
        isBlocked: null,
        lastTime: '',
        message: '',
        checked: false,
    },
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        closeIntroducation(state) {
            state.currentUser!.statusNew = false;
        },
        checkedPinLog(state) {
            state.pinLog.checked = true;
        },
        verifyPlatForm(state, action) {
            state.platformAccess = action.payload;
        },
    },
    extraReducers: (buider) => {
        buider
            .addCase(checkAuthentication.pending, (state) => {
                state.isLogging = true;
            })
            .addCase(
                checkAuthentication.fulfilled,
                (
                    state,
                    action: PayloadAction<
                        IDataGetWalletApiRes,
                        string,
                        {
                            arg: string;
                            requestId: string;
                            requestStatus: 'fulfilled';
                        },
                        never
                    >,
                ) => {
                    state.auth = true;
                    state.isLogging = false;
                    state.currentUser = action.payload;
                },
            )
            .addCase(checkAuthentication.rejected, (state) => {
                state.auth = false;
                state.isLogging = false;
            })

            .addCase(postRepresentmentConsent.fulfilled, (state, action) => {
                state.currentUser!.statusNew = action.payload;
                state.accountSetting.consentUpdated = action.payload;
            })

            .addCase(verifyRepresentmentConsent.fulfilled, (state, action) => {
                state.accountSetting = action.payload;
                state.currentUser!.statusNew = false;
            })
            .addCase(updateAccountSettings.fulfilled, (state, action) => {
                state.accountSetting = {
                    ...state.accountSetting,
                    ...action.payload,
                };
            })

            .addCase(getValidationPin.fulfilled, (state, action) => {
                let payload = action.payload as IPinLog;

                state.pinLog = {
                    ...state.pinLog,
                    ...action.payload,
                    message: payload.isBlocked ? `Your bill account is blocked for 2 hours. Please try again later.` : '',
                };
            })
            .addCase(getValidationPin.rejected, (state) => {
                state.pinLog.isBlocked = false;
            });
    },
});

export const authActions = authSlice.actions;

const authReducer = authSlice.reducer;

export default authReducer;
