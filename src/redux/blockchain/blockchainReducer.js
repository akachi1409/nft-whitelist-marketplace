const initialState = {
  loading: false,
  account: null,
  injectedProvider: null,
  errorMsg: "",
};

const blockchainReducer = (state = initialState, action) => {
  switch (action.type) {
    case "CONNECTION_REQUEST":
      return {
        ...initialState,
        loading: true,
      };
    case "CONNECTION_SUCCESS":
      return {
        ...state,
        loading: false,
        account: action.payload.account,
        injectedProvider: action.payload.injectedProvider
      };
      case "DISCONNECTION_REQUEST":
        return {
          ...initialState,
          loading: true,
        };
      case "DISCONNECTION_SUCCESS":
        return {
          ...state,
          loading: false,
          account: null,
          injectedProvider: null
        };
    case "CONNECTION_FAILED":
      return {
        ...initialState,
        loading: false,
        errorMsg: action.payload,
      };
    case "UPDATE_ACCOUNT":
      return {
        ...state,
        account: action.payload.account,
      };
    default:
      return state;
  }
};

export default blockchainReducer;
