import {
  SET_CHECKOUT_REQUEST,
  SET_CHECKOUT_SUCCESS,
  CLEAR_CHECKOUT,
} from '../types/checkoutType';

export const setCheckoutRequest = (payload: any) => ({
  type: SET_CHECKOUT_REQUEST,
  payload,
});

export const setCheckoutSuccess = (payload: any) => ({
  type: SET_CHECKOUT_SUCCESS,
  payload,
});

export const clearCheckout = () => ({
  type: CLEAR_CHECKOUT,
});
