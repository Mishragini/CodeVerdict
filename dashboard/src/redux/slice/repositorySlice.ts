import { createSlice } from "@reduxjs/toolkit";
import type { RootState } from "../store";

const intialRepoState = {
    id: null,
    name: null
}

export const repositorySlice = createSlice({
    name: 'repository',
    initialState: intialRepoState,
    reducers: {
        setRepo: (state, action) => {
            state.id = action.payload.id
            state.name = action.payload.name
        }
    }
})

export const { setRepo } = repositorySlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectRepo = (state: RootState) => state.repository

export default repositorySlice.reducer