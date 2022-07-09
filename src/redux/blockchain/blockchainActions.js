// constants
// import Web3EthContract from "web3-eth-contract";
// import Web3 from "web3";
import { fetchData } from "../data/dataActions";
import getWeb3 from '../../util/getWeb3'

require('dotenv').config()
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

const connectFailed = (payload) => {
  return {
    type: "CONNECTION_FAILED",
    payload: payload,
  };
};

// const updateAccountRequest = (payload) => {
//   return {
//     type: "UPDATE_ACCOUNT",
//     payload: payload,
//   };
// };

export const connect = () => {
  return async (dispatch) => {
    dispatch(connectRequest());
    try {
      const web3 = await getWeb3()
      const accounts = await web3.eth.getAccounts();
      console.log("-web3----", web3);
      dispatch(
        connectSuccess({
          account: accounts[0],
          // smartContract: SmartContractObj,
          web3: web3,
        })
      );
      // Add listeners start
      // ethereum.on("accountsChanged", (accounts) => {
      //   dispatch(updateAccount(accounts[0]));
      // });
      // ethereum.on("chainChanged", () => {
      //   window.location.reload();
      // });
        // Add listeners end
     
    } catch (err) {
      dispatch(connectFailed("Something went wrong."));
    }
  };
};

export const updateAccount = (account) => {
  return async (dispatch) => {
    //dispatch(updateAccountRequest({ account: account }));
    dispatch(fetchData(account));
  };
};
