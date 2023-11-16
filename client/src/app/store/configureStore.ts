import { configureStore } from "@reduxjs/toolkit";
import { counterSlice } from "../../features/contact/counterSlice";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { basketSlice } from "../../features/basket/basketSlice";
import { catalogSlice } from "../../features/catalog/catalogSlice";
import { accountSlice } from "../../features/account/accountSlice";

// export default function configureStore() {
//     return createStore(counterReducer); 
// }

export const store = configureStore({
    reducer: {
        counter: counterSlice.reducer,
        basket: basketSlice.reducer,
        catalog: catalogSlice.reducer,
        account: accountSlice.reducer
    }
}) 

// This will set the [RootState] to the [specife] [state] from the [store] in the [counterSlice.ts] Which is [CounterState]
export type RootState = ReturnType<typeof store.getState>;

// This will set the [AppDispatch] to the [specife] [dispatch/actions] from the [store] in the [counterSlice.ts] Which is [CounterState]
export type AppDispatch = typeof store.dispatch;

// This will just set up and export are [dispatch/actions]
export const useAppDispatch = () => useDispatch<AppDispatch>();

// This will just set up and export are [state]
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;