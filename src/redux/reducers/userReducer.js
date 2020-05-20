import {
    SET_USER,
    SET_TOKEN,
    SET_AUTHENTICATED,
    SET_UNAUTHENTICATED,
    SET_OTHER_USERS,
    LOADING_USER,
  } from '../types';
  import jwtDecode from 'jwt-decode';
  
  const initialState = {
    otherUsers: [],
    authenticated: false,
    loading: false
  };
  
  export default function(state = initialState, action) {
    switch (action.type) {
      case SET_AUTHENTICATED:
        return {
          ...state,
          authenticated: true
        };
      case SET_UNAUTHENTICATED:
        return {...initialState};
      case SET_TOKEN:        
        const decodedToken = jwtDecode(action.payload);
        return{
          ...state,
          token: {...action.payload},
          decodedToken: decodedToken
        }
      case SET_USER:
        return {
          ...state,
          authenticated: true,
          loading: false,
          ...action.payload,
        };
      case SET_OTHER_USERS:
        return{
          ...state,
          ...action.payload
        }
      case LOADING_USER:
        return {
          ...state,
          loading: true
        };
      default:
        return state;
    }
  }
  