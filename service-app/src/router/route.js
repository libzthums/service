import React, { createContext, useReducer } from "react";

export const UrlContext = createContext({});

const initialState = {
    url: "http://localhost:4005/api/",
};

const urlReducer = (state, action) => {
    switch (action.type) {
        case "SET_URL":
            return { ...state, url: action.payload };
        default:
            return state;
    }
};

export const UrlRoutes = ({ children }) => {
    const [state, dispatch] = useReducer(urlReducer, initialState);

    const setUrl = (newUrl) => dispatch({ type: "SET_URL", payload: newUrl });

    return (
        <UrlContext.Provider value={{ url: state.url, setUrl }}>
            {children}
        </UrlContext.Provider>
    );
};