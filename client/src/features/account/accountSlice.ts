import { createAsyncThunk, createSlice, isAnyOf } from "@reduxjs/toolkit";
import { User } from "../../app/models/user";
import { FieldValues } from "react-hook-form";
import agent from "../../app/api/agent";
import { router } from "../../app/router/Routes";
import { toast } from "react-toastify";
import { setBasket } from "../basket/basketSlice";

interface AccountState {
    user: User | null;
}

const initialState: AccountState = {
    user: null
}

export const signInUser = createAsyncThunk<User, FieldValues>(
    'account/signInUser',
    async (data, thunkAPI) => {
        try {
            const userDto = await agent.Account.login(data);
            // Here I'm getting the [basket] out from the [userDto] [If] we [got] a [basket] back from the [agent.Account.login] which [goes] to the [API] [from] the [line] Above^^
            // The [...user] will [still] be the [userDto]. And the [basket] we just [Destruct] it [into] [it's] own [property] from the [...user]
            const {basket, ...user} = userDto;
            // Here I'm Checking if i have a [basket] that we got from the [agent.Account.login] which [goes] to the [API]
            if (basket) {
                thunkAPI.dispatch(setBasket(basket));
            }
            //#region Comments
            // Every time the [browser] is [refreshed] then [anything] [insdie] our [Redux states]. Continue DownVV
            // Gets [re-Initialized] with it's [initial values]. And [everything] inside our [components] get [destroyed]. Continue DownVV
            // So We [did] this. Continue DownVV
            // We Used [localStorage] to [Persist] our [data] in are [Browser]!!!
            //#endregion
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error:any) {
            return thunkAPI.rejectWithValue({error: error.data});
        }
    }
)


export const fetchCurrentUser = createAsyncThunk<User>(
    'account/fetchCurrentUser',
    async (_, thunkAPI) => {
        // We do this so if we [have] a [token] in [localStorage] will [set] it [inside] are [state]
        // Then in the the [agent.ts] [file] will be [able] to [take] the [token] in the [Line] [axios.interceptors.request] 
        thunkAPI.dispatch(setUser(JSON.parse(localStorage.getItem('user')!)))
        try {
            const userDto = await agent.Account.currentUser();
            const {basket, ...user} = userDto;
            if (basket) {
                thunkAPI.dispatch(setBasket(basket));
            }
            // In this [case]. Here i will [overwrite] the [user] in the [localStorage]. Continue DownVV
            // Will [Replace] it with the [Updated] [Token] that will [get] back from the [API].
            localStorage.setItem('user', JSON.stringify(user));
            return user;
        } catch (error:any) {
            return thunkAPI.rejectWithValue({error: error.data});
        }
    },
    {
        // This wil make sure that this [request] [agent.Account.currentUser()]. Continue DownVV
        // Will [Happen] [Only If] we [Have] [something] in [localStorage]!!!
        condition : () => {
            if (!localStorage.getItem('user')) {
                return false;
            }
        }
    }
)

export const accountSlice = createSlice({
    name: 'account',
    initialState,
    reducers: {
        signOut: (state) => {
            state.user = null;
            // In This [Case] We Used [localStorage] to [Remove] our [data] that is [Persist] in are [Browser]!!!
            localStorage.removeItem('user');
            router.navigate('/');
        },
        setUser: (state, action) => {
            state.user = action.payload;
        }
    },
    extraReducers: (builder => {
        builder.addCase(fetchCurrentUser.rejected, (state) => {
            state.user = null;
            localStorage.removeItem('user');
            toast.error('Session expired - please login again');
            router.navigate('/');
        });

        builder.addMatcher(isAnyOf(signInUser.fulfilled, fetchCurrentUser.fulfilled), (state, action) => {
            state.user = action.payload;
        });

        builder.addMatcher(isAnyOf(signInUser.rejected), (state, action) => {
            throw action.payload;
        });
    })
})

export const {signOut, setUser} = accountSlice.actions;