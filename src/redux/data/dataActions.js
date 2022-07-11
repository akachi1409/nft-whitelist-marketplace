// log
import store from "../store";

const fetchDataRequest = () => {
  return {
    type: "CHECK_DATA_REQUEST",
  };
};

const fetchDataSuccess = (payload) => {
  return {
    type: "CHECK_DATA_SUCCESS",
    payload: payload,
  };
};

const fetchDataFailed = (payload) => {
  return {
    type: "CHECK_DATA_FAILED",
    payload: payload,
  };
};

export const fetchData = (account) => {
  return async (dispatch) => {
    dispatch(fetchDataRequest());
    try {
      let balance = await store
        .getState()
        .blockchain.robosContract.methods.balanceOf(account)
        .call();
      console.log("balance: ", balance);
      // for (let index = 0 ; index<length ; index++) {
      //   let add = await getAddress(index);
      //   let id = await getId(index);
      //   // console.log("id", id);
      //   auctionAddress.push(add);
      //   auctionId.push(id)
      // }

      dispatch(
        fetchDataSuccess({
          balance: balance
        })
      );
    } catch (err) {
      console.log(err);
      dispatch(fetchDataFailed("Could not load data from contract."));
    }
  };
};

// const getAddress = id => {
//   return getAddresscall(id);
// }

// const getAddresscall = id => {
//   return new Promise(resolve =>{
//    return resolve(store
//         .getState()
//         .blockchain.smartContract.methods.liveAuctionAddress(id)
//         .call())
//   })
// }

// const getId = id =>{
//   return getIdcall(id);
// }

// const getIdcall = id => {
//   return new Promise(resolve =>{
//     return resolve(store
//       .getState()
//       .blockchain.smartContract.methods.liveAuctionId(id)
//       .call())
//   })
// }