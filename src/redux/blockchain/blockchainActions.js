import { fetchData } from "../data/dataActions";

// import Web3EthContract from "web3-eth-contract";
require("dotenv").config();

const connectRequest = () => {
  return {
    type: "CONNECTION_REQUEST",
  };
};

const connectSuccess = (payload) => {
  return {
    type: "CONNECTION_SUCCESS",
    payload: payload,
  };
};

const disconnectRequest = () => {
  return {
    type: "DISCONNECTION_REQUEST",
  };
};

const disconnectSuccess = (payload) => {
  return {
    type: "DISCONNECTION_SUCCESS",
    payload: payload,
  };
};


const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

export const connect = (address) => {
  return async (dispatch) => {
    dispatch(connectRequest());
    try {
      console.log("--", address)
      dispatch(
        connectSuccess({
          account: address,
          // robosContract: SmartContractObj
          // injectedProvider: injectedProvider
        })
      );
    } catch (err) {
      dispatch(connectFailed("Something went wrong.", err));
    }
  };
};

export const disconnect = () =>{
  return async(dispatch)=>{
    dispatch(disconnectRequest());
    try{
      dispatch(disconnectSuccess())
      // await web3Modal.clearCachedProvider();
      // const provider = await web3Modal.connect();
      // const injectedProvider = new ethers.providers.Web3Provider(provider)
      // if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      //   await injectedProvider.provider.disconnect();
      // }
    }catch(err){

    }
  }
}

export const updateAccount = (account) => {
  return async (dispatch) => {
    //dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};