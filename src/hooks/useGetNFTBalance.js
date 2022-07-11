import React, {useState, useEffect} from 'react';
import ethers from "ethers";
import RobosNFT from "../contracts/RobosNFT.json"
import { useIPFS } from "../../hooks/useIPFS";
import { useMoralisWeb3Api, useMoralisWeb3ApiCall } from "react-moralis";

export default function MyRobosSection(props) {
    const { resolveLink } = useIPFS();
    
    const [NFTBalance, setNFTBalance] = useState([]);
    const [name, setName] = useState("");
    const {
        fetch: getNFTBalance,
        data,
        error,
        isLoading,
    } = useMoralisWeb3ApiCall(props.address.getNFTs, { chain: "rinkeby"});
        

    useEffect(async () => {
        if (data?.result) {
          const NFTs = data.result;
          for (let NFT of NFTs) {
            if (NFT?.metadata) {
              NFT.metadata = JSON.parse(NFT.metadata);
              // metadata is a string type
              NFT.image = resolveLink(NFT.metadata?.image);
            }else if (NFT?.token_uri){
              await fetch(NFT.token_uri)
              .then(response => response.json())
              .then(data => {
                NFT.image = resolveLink(data.image);
              });
            }
          }
          setNFTBalance(NFTs);
        }
      // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [data]);
    
      return { getNFTBalance, NFTBalance, error, isLoading };
}