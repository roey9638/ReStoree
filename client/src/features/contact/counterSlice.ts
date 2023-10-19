import { createSlice } from "@reduxjs/toolkit";

export interface CounterState {
    data: number;
    title: string;
}

const initialState: CounterState = {
    data: 42,
    title: 'YARC (Yet another redux counter with redux toolkit)'
}

export const counterSlice = createSlice({
    name: 'counter',
    initialState,
    reducers: {
        increment: (state, action) => {
            state.data += action.payload
        },

        decrement: (state, action) => {
            state.data -= action.payload
        }
    }
})

// This wil be are [Actions Creators]
export const {increment, decrement} = counterSlice.actions;