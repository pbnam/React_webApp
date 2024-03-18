import { createSlice } from '@reduxjs/toolkit';
import { IBiller, IBillerCat } from '../../api/biller/interface';
import { getBillers } from './thunk';

export interface Biller {
    id: string;
    name: string;
    catagoryName: string;
    thumbnail: string;
    sampleBill: string;
    statusNew: boolean;
    tagName: string;
}

type ICategoryBillerSupport = '' | 'water' | 'electricity';

export interface Billerstate {
    billerData: IBiller[];
    billerPopularData: IBiller[];
    billerCat: IBillerCat[];
    isHanding: boolean;
    isLoaded: boolean | null;
    categoryBillerSelected: ICategoryBillerSupport;
}

const initialState: Billerstate = {
    billerData: [],
    billerPopularData: [],
    billerCat: [],
    isHanding: false,
    isLoaded: null,
    categoryBillerSelected: '',
};

const billerSlice = createSlice({
    name: 'biller',
    initialState,
    reducers: {
        selectedBiller(state, action) {
            state.categoryBillerSelected = action.payload;
        },
        clearSelectedBiller(state) {
            state.categoryBillerSelected = '';
        },
    },
    extraReducers: (buider) => {
        buider
            .addCase(getBillers.pending, (state) => {
                state.isHanding = true;
            })
            .addCase(getBillers.fulfilled, (state, action) => {
                state.billerData = action.payload?.allBillers;
                state.billerPopularData = action.payload?.popularBillers;
                state.billerCat = action.payload?.billerCat;
                state.isHanding = false;
                state.isLoaded = true;
            })
            .addCase(getBillers.rejected, (state) => {
                state.isHanding = false;
                state.isLoaded = false;
            });
    },
});

export const billerActions = billerSlice.actions;

const billerReducer = billerSlice.reducer;

export default billerReducer;
