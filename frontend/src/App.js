import { useEffect, useState } from "react";
import {
  useMoralis,
  useMoralisSolanaApi,
  useMoralisSolanaCall,
} from "react-moralis";
import {
  Blockie,
  Button,
  Loading,
  Table,
  Avatar,
  Tag,
  Icon,
  getEllipsisTxt,
} from "web3uikit";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams
} from "react-router-dom";
import styles from "./styles.module.css";

const Idle = require('react-idle').default
const config = require('./config.json');

function App(){
  return(
    <Router>
  <Routes>
  <Route path="/" element={<Main />} />
    <Route path="/:string/:id" element={<Main />} />
  </Routes>
  </Router>
  );
  
}


function Main() {
  let { string, id } = useParams();
  const [network, setNetwork] = useState(config.network);
  const [verified, setVerified] = useState(false);
  const [verifiedAll, setVerifiedAll] = useState(false);
  
  const [verifiedNFTs, setVerifiedNFTs] = useState([]);
  const [userNFTs, setUserNFTs] = useState([]);
  const [synced, setSynced] = useState(false);
  const {
    isAuthenticated,
    authenticate,
    user,
    isInitializing,
    isInitialized,
    isAuthenticating,
    logout,
  } = useMoralis();
  const { account } = useMoralisSolanaApi();
  const { fetch, data, isLoading } = useMoralisSolanaCall(account.getNFTs);
  const fetcht = require('node-fetch');
  /**
   * @description the function handles authentication with phantom wallet
   */
  const onConnectPhantomWallet = async () => {
    await authenticate({
      type: "sol",
      signingMessage: "Welcome to Solana NFT Verifier! This app requires your permission to display your NFTs.",
    });
    
  };

  async function postRequest(body){
    const dcResponse = await fetcht(config.discordURL, {
      method: 'post',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json'}
    });
  const res = await dcResponse;
  console.log(res);
  }

  function verify(){
    let urls = [];
    let metadataRes = [];
    const result = [];
    const updateAuthorities = []; 
    const options = {
      headers:{'X-API-Key': 'QxZqUF0BzgZ5XhvxiKd3PozPbpYHbol87Uk3hiwy5pv5sDvYkUqqWS2WHcsO2rGZ',
              'accept': 'application/json'},
      method: 'GET',
    };
    data.forEach(nft => {
      const mintHash = nft.mint;

      urls.push("https://solana-gateway.moralis.io/nft/" + config.network + "/" + mintHash + "/metadata");
    });
    
    async function getVerifiedNFT() {
       
      try{
       
      await Promise.all(
        urls.map(async (url) => {
          const response = await fetcht(url,options)
          const body = await response.json()
          result.push({metaDataUri: body?.metaplex?.metadataUri, updateAuthority: body?.metaplex?.updateAuthority});
        })
      )
      await Promise.all(
        result.map(async (nft) => {
          const response = await fetcht(nft?.metaDataUri,{headers:{'accept': 'application/json'}, method: 'GET'});
          const json = await response.json()
          metadataRes.push({ metaData: json, updateAuthority: nft?.updateAuthority });
        })
      )
      let flag = false;
      metadataRes.forEach((nft) => {
  
        console.log("updateAuthority::: " + nft?.updateAuthority);
        if(nft?.updateAuthority === config.updateAuthority){
          flag=true;
          setVerifiedNFTs(verifiedNFTs => [...verifiedNFTs, {name: nft?.metaData?.name, imgUrl:nft?.metaData?.image}]);
          //If there is no unique string and discord id attached to the url then data is not posted to discord server. This is to use the app as web-only.
          if(string && id && (id!=="") && (string!=="")){
          const body = {str: string, id: id, name:nft?.metaData?.name, verified: true, image: nft?.metaData?.image};
          
            
          postRequest(body);
        }
       
        }
        else{
          if(string && id && (id!=="") && (string!=="")){
          const body = {str:string, id: id, verified: false, image:null};
          postRequest(body);
          }
        }
      });
      if(flag){
        setVerifiedAll(true);  
        return true;
      }
      else{
        return false;
      }

    }
      catch(error){
        alert("An error occured due to SOLANA API request failure. Please try again.");
        console.log(error);
        return false;
      }
    }

  const maxTry = 10;
  var success = getVerifiedNFT();
  
  for(var counter=0;counter<maxTry;counter++)
  {
    if(success){
      break;
    }
    else{
      success = getVerifiedNFT();
    }
  } 
  if(success){
    setVerified(true);
  }
  else{
    alert("An error occured due to SOLANA API request failure. Please refresh the page and try again."); 
  }
  
  }

  function getUserNFTs(data){
    
    const urls = [];
    const metadataUris = [];
    const options = {
      headers:{'X-API-Key': 'QxZqUF0BzgZ5XhvxiKd3PozPbpYHbol87Uk3hiwy5pv5sDvYkUqqWS2WHcsO2rGZ',
              'accept': 'application/json'},
      method: 'GET',
    };

    data.forEach(nft => {
      const mintHash = nft.mint;
      urls.push("https://solana-gateway.moralis.io/nft/" + config.network + "/" + mintHash + "/metadata");
    });
    async function getThatNFT() {
      try{
          await Promise.all(
            urls.map(async (url) => {
              const response = await fetcht(url,options)
              const body = await response.json()
              metadataUris.push(body?.metaplex?.metadataUri);

              })
           )
           await Promise.all(
            metadataUris.map(async (metadata) => {
              
              const response = await fetcht(metadata,{headers:{'accept': 'application/json'}, method: 'GET'});
              const body = await response.json()
              setUserNFTs(userNFTs => [...userNFTs, {name: body?.name, imgUrl:body?.image}]);
              return true;
    
              })
          )
        return true;
      }
      catch(error){

        return false;
      }

      
  }
 
  const maxTry = 10;
  var success = getThatNFT();
  
  for(var counter=0;counter<maxTry;counter++)
  {
    if(success){
      break;
    }
    else{
      success = getThatNFT();
    }
  }
  if(success){
    setSynced(true);
  }
  else{
    alert("An error occured due to SOLANA API request failure. Please refresh the page and try again."); 
  }
}

function resetStates(){
  setVerified(false); setSynced(false); setUserNFTs([]); setVerifiedNFTs([]); setVerifiedAll(false);
}




  useEffect(() => {
    if (isAuthenticated && user.get("solAddress")) {
      // Fetch only when authenticated
     
        fetch({
        params: {
          address: user.get("solAddress"),
          network
        },
      });

      
    }
  }, [fetch, isAuthenticated, user, network]);

  return (
    <div className={styles.bodyy}>
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "1rem",
      }}
    >
    <Idle
    timeout={100000}
    render={({ idle }) =>
      <h1>
        {idle &&
          "You are idle."
        }
      </h1>
    }
    onChange={({ idle}) => {
            if (idle) {
              logout();
            }
          }}
  />
      {!isInitialized || isInitializing ? (
        <Loading spinnerColor="#2E7DAF" size={50} />
      ) : (
        <>
          {isAuthenticated ? (
            <>
              <Blockie seed={user?.get("solAddress")} size={20} />
              <p >{getEllipsisTxt(user?.get("solAddress"), 4)}</p>
              <div id={styles.dcButton}>
              <Button onClick={() => {logout(); resetStates(); }} text="Disconnect Wallet" />
              </div>
              {isLoading ? (
                <Loading spinnerColor="#2E7DAF" text="Fetching Data..." />
              ) : (
                <div>
                
                {!verified && synced && userNFTs.length===data.length &&
                <div className={styles.table1}>
                <Table
                  customNoDataComponent={<Loading size={60} spinnerColor="#2E7DAF" text="Fetching" />}
                  columnsConfig="80px 3fr 2fr 2fr"
                  data={[
                    ...userNFTs?.map((nft) => {
                      return [
                        <div className={styles.tableDataIcon}><Avatar isRounded theme="image" image={nft?.imgUrl} /></div>,
                        <div className={styles.tableData}>{nft?.name}</div>,
                        <div className={styles.tableData}><Tag color="yellow" text="SPL NFT" /></div>,
                        <div className={styles.tableDataR}><Icon
                      fill="#c7b422"
                      size={28}
                      svg="xCircle"
                    /></div>,,
                      ];
                    }),
                  ]}
                  header={[
                    "",
                    
                    
                    <span>Name</span>,
                    <span>Type</span>,
                    <span>Verified</span>,

                  ]}
                  maxPages={3}
                  noPagination
                  onPageNumberChanged={function noRefCheck() {}}
                  pageSize={5}
                /></div>}
                {verified && verifiedAll &&
                <div>
                <Table
                  columnsConfig="80px 3fr 2fr 2fr"
                  data={[
                    ...verifiedNFTs?.map((nft) => {
                     
                      return [
                        <div className={styles.tableDataIcon}><Avatar isRounded theme="image" image={nft?.imgUrl}/></div>,
                        <div className={styles.tableData}>{nft?.name}</div>,
                        <div className={styles.tableData}><Tag color="yellow" text="SPL NFT" /></div>,
                        
                      <div className={styles.tableDataR}><Icon
                      fill="#078f07"
                      size={28}
                      svg="checkmark"
                    /></div>,,
                      ];
                    }),
                  ]}
                  header={[
                    "",
                    
                    
                    <span>Name</span>,
                    <span>Type</span>,
                    <span>Verified</span>,

                  ]}
                  maxPages={3}
                  noPagination
                  onPageNumberChanged={function noRefCheck() {}}
                  pageSize={5}
                />
                <div style={{textAlign:"center"}}>
                <p style={{color: "#9457FB", fontSize:"1rem"}}>You have been verified !</p>  
                <p style={{color: "#9457FB", fontSize:"1rem"}}>You can now check your role in discord.</p>
                </div>

                </div>
                }
                <div className="styled-button">
                {!verified && synced && userNFTs.length>0 && <div className={styles.connectButton}><Button onClick={() => verify()} text="Verify Your NFT" /></div>}
                {!synced && <div className={styles.connectButton}><Button onClick={() => getUserNFTs(data)} text="Sync Inventory" /></div>}
                </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className={styles.h1}>Solana NFT Verifier </h1>
              <div className={styles.connectButton}>
              <Button 
                onClick={onConnectPhantomWallet}
                isLoading={isAuthenticating}
                loadingText="Authenticating..."
                text="Connect Wallet"
              />
              </div>
            </>
          )}
        </>
      )}
    </div>
    </div>
  );
}

export default App;
