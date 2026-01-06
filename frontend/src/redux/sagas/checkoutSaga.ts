import { takeLatest, put } from 'redux-saga/effects';
import { SET_CHECKOUT_REQUEST } from '../types/checkoutType';
import { setCheckoutSuccess } from '../actions/checkoutAction';

function* setCheckoutSaga(action: any): Generator {
  try {
    // You can validate or normalize data here if needed
    yield put(setCheckoutSuccess(action.payload));
  } catch (error) {
    console.error('Checkout saga error:', error);
  }
}

export default function* checkoutSaga() {
  yield takeLatest(SET_CHECKOUT_REQUEST, setCheckoutSaga);
}
