import { SET_CHECKOUT_SUCCESS, CLEAR_CHECKOUT } from '../types/checkoutType';

const initialState = {
  data: null,
};

export const checkoutReducer = (state = initialState, action: any) => {
  switch (action.type) {
    case SET_CHECKOUT_SUCCESS:
      return { ...state, data: action.payload };

    case CLEAR_CHECKOUT:
      return { ...state, data: null };

    default:
      return state;
  }
};
