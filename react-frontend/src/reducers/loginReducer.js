export const initialLoginState = { error: '', loading: false };

export function loginReducer(state, action) {
  switch (action.type) {
    case 'LOADING': return { ...state, loading: true, error: '' };
    case 'ERROR': return { ...state, loading: false, error: action.payload };
    case 'SUCCESS': return { ...state, loading: false, error: '' };
    default: return state;
  }
} 