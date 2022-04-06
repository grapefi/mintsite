import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
  input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button`
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 100px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button`
  padding: 10px;
  border-radius: 4px;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: #fff;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
    
  }
`;

export const StyledLogo = styled.img`
  width: 400px;
  @media (min-width: 767px) {
    width: 500px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img`
  box-shadow: 0px 5px 11px 2px rgba(0, 0, 0, 0.7);
  border: 0px dashed var(--secondary);
  background-color: var(--accent);
  border-radius: 0%;
  width: 300px;
  @media (min-width: 900px) {
    width: 350px;
  }
  @media (min-width: 1000px) {
    width: 400px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a`
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
  const dispatch = useDispatch();
  const blockchain = useSelector((state) => state.blockchain);
  const data = useSelector((state) => state.data);
  const [claimingNft, setClaimingNft] = useState(false);
  const [feedback, setFeedback] = useState(`Click to mint your NFT`);
  const [mintAmount, setMintAmount] = useState(1);
  const [CONFIG, SET_CONFIG] = useState({
    CONTRACT_ADDRESS: "",
    SCAN_LINK: "",
    NETWORK: {
      NAME: "",
      SYMBOL: "",
      ID: 0,
    },
    NFT_NAME: "",
    SYMBOL: "",
    MAX_SUPPLY: 1,
    WEI_COST: 0,
    DISPLAY_COST: 0,
    GAS_LIMIT: 0,
    MARKETPLACE: "",
    MARKETPLACE_LINK: "",
    SHOW_BACKGROUND: false,
  });

  const claimNFTs = () => {
    let cost = CONFIG.WEI_COST;
    let gasLimit = CONFIG.GAS_LIMIT;
    let totalCostWei = String(cost * mintAmount);
    let totalGasLimit = String(gasLimit * mintAmount);
    console.log("Cost: ", totalCostWei);
    console.log("Gas limit: ", totalGasLimit);
    setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
    setClaimingNft(true);
    blockchain.smartContract.methods
      .mint(mintAmount)
      .send({
        gasLimit: String(totalGasLimit),
        to: CONFIG.CONTRACT_ADDRESS,
        from: blockchain.account,
        value: totalCostWei,
      })
      .once("error", (err) => {
        console.log(err);
        setFeedback("Sorry, something went wrong please try again later.");
        setClaimingNft(false);
      })
      .then((receipt) => {
        console.log(receipt);
        setFeedback(
          `Noice! The Winery Collection NFT is yours! Visit NFTtrade.com to view it.`
        );
        setClaimingNft(false);
        dispatch(fetchData(blockchain.account));
      });
  };

  const decrementMintAmount = () => {
    let newMintAmount = mintAmount - 1;
    if (newMintAmount < 1) {
      newMintAmount = 1;
    }
    setMintAmount(newMintAmount);
  };

  const incrementMintAmount = () => {
    let newMintAmount = mintAmount + 1;
    if (newMintAmount > 20) {
      newMintAmount = 20;
    }
    setMintAmount(newMintAmount);
  };

  const getData = () => {
    if (blockchain.account !== "" && blockchain.smartContract !== null) {
      dispatch(fetchData(blockchain.account));
    }
  };

  const getConfig = async () => {
    const configResponse = await fetch("/config/config.json", {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });
    const config = await configResponse.json();
    SET_CONFIG(config);
  };

  useEffect(() => {
    getConfig();
  }, []);

  useEffect(() => {
    getData();
  }, [blockchain.account]);

  return (
    <s.Screen>
      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 24, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
        <a href="https://grapefinance.app/"><StyledLogo alt={"logo"} src={"/config/images/logo.png"} /></a>
        
        <ResponsiveWrapper flex={1} style={{ padding: 85 }} test>
        
          <s.SpacerLarge />
          <s.Container
            flex={2}
            jc={"center"}
            ai={"center"}
            style={{
              backgroundColor: "var(--accent)",
              padding: 4,
              borderRadius: 4,
              border: "0px dashed var(--secondary)",
              boxShadow: "0px 5px 11px 2px rgba(0,0,0,0.6)",
            }}
          ><s.TextTitle
          style={{
            textAlign: "center",
            fontSize: 50,
            fontWeight: "bold",
            color: "#930993",
          }}
        >
          The Winery NFT Collection
        </s.TextTitle>
            <s.TextTitle
              style={{
                textAlign: "center",
                fontSize: 50,
                fontWeight: "bold",
                color: "#1b1b1b",
              }}
            >
              {data.totalSupply} / {CONFIG.MAX_SUPPLY}
            </s.TextTitle>
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              {/*<StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
            </StyledLink>*/}
            </s.TextDescription>
            <s.SpacerSmall />
            {Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  The sale has ended.
                </s.TextTitle>
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  You can still find {CONFIG.NFT_NAME} on
                </s.TextDescription>
                <s.SpacerSmall />
                <StyledLink target={"_blank"} href={CONFIG.MARKETPLACE_LINK}>
                  {CONFIG.MARKETPLACE}
                </StyledLink>
              </>
            ) : (
              <>
                <s.TextTitle
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  1 {CONFIG.SYMBOL} costs {CONFIG.DISPLAY_COST}{" "}
                  {CONFIG.NETWORK.SYMBOL} (Randomized mint)
                </s.TextTitle>
                <s.SpacerXSmall />
                <s.TextDescription
                  style={{ textAlign: "center", color: "var(--accent-text)" }}
                >
                  Excluding gas fees
                </s.TextDescription>
                <s.SpacerSmall />
                {blockchain.account === "" ||
                blockchain.smartContract === null ? (
                  <s.Container ai={"center"} jc={"center"}>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      Connect to the {CONFIG.NETWORK.NAME} network
                    </s.TextDescription>
                    <s.SpacerSmall />
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                      }}
                    >
                      CONNECT
                    </StyledButton>
                    {blockchain.errorMsg !== "" ? (
                      <>
                        <s.SpacerSmall />
                        <s.TextDescription
                          style={{
                            textAlign: "center",
                            color: "var(--accent-text)",
                          }}
                        >
                          {blockchain.errorMsg}
                        </s.TextDescription>
                      </>
                    ) : null}
                  </s.Container>
                ) : (
                  <>
                    <s.TextDescription
                      style={{
                        textAlign: "center",
                        color: "var(--accent-text)",
                      }}
                    >
                      {feedback}
                    </s.TextDescription>
                    <s.SpacerMedium />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledRoundButton
                        style={{ lineHeight: 0.4 }}
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          decrementMintAmount();
                        }}
                      >
                        -
                      </StyledRoundButton>
                      <s.SpacerMedium />
                      <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "var(--accent-text)",
                        }}
                      >
                        {mintAmount}
                      </s.TextDescription>
                      <s.SpacerMedium />
                      <StyledRoundButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          incrementMintAmount();
                        }}
                      >
                        +
                      </StyledRoundButton>
                    </s.Container>
                    <s.SpacerSmall />
                    <s.Container ai={"center"} jc={"center"} fd={"row"}>
                      <StyledButton
                        disabled={claimingNft ? 1 : 0}
                        onClick={(e) => {
                          e.preventDefault();
                          claimNFTs();
                          getData();
                        }}
                      >
                        {claimingNft ? "BUSY" : "MINT"}
                      </StyledButton>
                    </s.Container>
                  </>
                )}
              </>
            )}
            <s.SpacerMedium />
          </s.Container>
          <s.SpacerLarge />
          <s.Container flex={1} jc={"center"} ai={"center"}>
            <StyledImg
              alt={"example"}
              src={"/config/images/example.gif"}
              style={{}}
            />
          </s.Container>
        </ResponsiveWrapper>
        <s.SpacerMedium />
   
       
      </s.Container>


      <s.Container
        flex={1}
        ai={"center"}
        style={{ padding: 0, backgroundColor: "var(--primary)" }}
        image={CONFIG.SHOW_BACKGROUND ? "/config/images/bg.png" : null}
      >
                 
        <s.TextTitle
          style={{
            textAlign: "center",
            fontSize: 50,
            fontWeight: "bold",
            color: "#930993",
          }}
        >
          Collection Details
        </s.TextTitle>

        <p style={{
            textAlign: "center",
            fontFamily: 'monospace',
            fontSize: 18,
            fontWeight: "bold",
            color: "#000",
            paddingLeft:30,
            paddingRight:30,
            maxWidth:1200,
            lineHeight: 1.6
          }}>NFT holders are entitled to monthly passive yield from all our node systems, in this respect our NFTs becoming passive yielding nodes in their own right. As well as this initial benefit NFT holders become exclusive shareholders of Grape Finance and are granted rights that encompass all aspects of Grape's present and future platform additions. Limited to 2700 in total forever.</p>
   
  
        <StyledButton
                      onClick={''}
                      style={{marginTop: '20px'}}
                    >
                      <a target={'_blank'} href="https://grapefinance.gitbook.io/grape-finance-docs/unique-features/the-winery-nft-collection" style={{color: '#fff', textDecoration: 'none'}}>Our Docs</a>
            </StyledButton>

        <ResponsiveWrapper flex={1} style={{ padding: 85, maxWidth:'1000px' }} test>
        
        <s.Container flex={4} jc={"center"} ai={"center"}>
        <s.TextTitle
          style={{
            textAlign: "center",
            fontSize: 40,
            fontWeight: "bold",
            color: "#930993",
          }}
        >
          The Goon Bag (Tier 1)
        </s.TextTitle>
     
        <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "#000",
                          fontFamily: 'monospace',
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
          Limited to 1500 the Goon Bag or more commonly know worldwide as the cask wine sack is the most common tier of the collection yet still grants holders the same benefits as the remaining less common tiers just at a smaller multiplier. 
          </s.TextDescription>
         
          <s.TextDescription
                        style={{
                          textAlign: "left",
                          color: "#000",
                          fontFamily: 'monospace',
                          fontWeight: "bold",
                          fontSize: 18,
                          paddingBottom: 30,
                          paddingTop: 30
                        }}
                      >
              Node reward share multiplier (per NFT): 1 <br></br>
              Lottery entries per NFT in tier held (per NFT): 1
            </s.TextDescription>
          <StyledImg
            alt={"example"}
            src={"/config/images/GoonBag.png"}
            style={{width: '500px'}}
          />
        </s.Container>
       
      </ResponsiveWrapper>

      <ResponsiveWrapper flex={1} style={{ padding: 85, maxWidth:'1000px' }} test>
        
        <s.Container flex={4} jc={"center"} ai={"center"}>
        <s.TextTitle
          style={{
            textAlign: "center",
            fontSize: 40,
            fontWeight: "bold",
            color: "#930993",
          }}
        >
          The Wine Glass (Tier 2)
        </s.TextTitle>
     
        <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "#000",
                          fontFamily: 'monospace',
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
         Limited to 800 the Wine Glass is the regular person's way to consume wine, nothing fancy but a little more classy than drinking from a sack. It is the second most common tier of the collection yet still grants holders the same benefits as the remaining tiers with a smaller base multiplier. 
          </s.TextDescription>
         
          <s.TextDescription
                        style={{
                          textAlign: "left",
                          color: "#000",
                          fontFamily: 'monospace',
                          fontWeight: "bold",
                          fontSize: 18,
                          paddingBottom: 30,
                          paddingTop: 30
                        }}
                      >
              Node reward share multiplier (per NFT): 3 <br></br>
              Lottery entries per NFT in tier held (per NFT): 3
            </s.TextDescription>
          <StyledImg
            alt={"example"}
            src={"/config/images/WineGlass.png"}
            style={{width: '500px'}}
          />
        </s.Container>
       
      </ResponsiveWrapper>

      <ResponsiveWrapper flex={1} style={{ padding: 85, maxWidth:'1000px' }} test>
        
        <s.Container flex={4} jc={"center"} ai={"center"}>
        <s.TextTitle
          style={{
            textAlign: "center",
            fontSize: 40,
            fontWeight: "bold",
            color: "#930993",
          }}
        >
          The Decanter (Tier 3)
        </s.TextTitle>
     
        <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "#000",
                          fontFamily: 'monospace',
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
         Limited to 300 the Decanter is how those with a palate aerate their wine before enjoying in order to bring out the full taste and set of aromas, something the regular person or plebeian couldn't be bothered with. One of the most rare NFTs with the second highest multiplier.
          </s.TextDescription>
         
          <s.TextDescription
                        style={{
                          textAlign: "left",
                          color: "#000",
                          fontFamily: 'monospace',
                          fontWeight: "bold",
                          fontSize: 18,
                          paddingBottom: 30,
                          paddingTop: 30
                        }}
                      >
              Node reward share multiplier (per NFT): 9 <br></br>
              Lottery entries per NFT in tier held (per NFT): 9
            </s.TextDescription>
          <StyledImg
            alt={"example"}
            src={"/config/images/Decanter.png"}
            style={{width: '500px'}}
          />
        </s.Container>
       
      </ResponsiveWrapper>

      <ResponsiveWrapper flex={1} style={{ padding: 85, maxWidth:'1000px' }} test>
        
        <s.Container flex={4} jc={"center"} ai={"center"}>
        <s.TextTitle
          style={{
            textAlign: "center",
            fontSize: 40,
            fontWeight: "bold",
            color: "#930993",
          }}
        >
          The Goblet (King Tier)
        </s.TextTitle>
     
        <s.TextDescription
                        style={{
                          textAlign: "center",
                          color: "#000",
                          fontFamily: 'monospace',
                          fontWeight: "bold",
                          fontSize: 18,
                        }}
                      >
         Limited to 100 the Goblet speaks for itself and is reserved for only the top of the top, the king of kings. Don't even think of setting your eyes on it unless you've proven to be worthy. The highest multipliers seen in the collection.
          </s.TextDescription>
         
          <s.TextDescription
                        style={{
                          textAlign: "left",
                          color: "#000",
                          fontFamily: 'monospace',
                          fontWeight: "bold",
                          fontSize: 18,
                          paddingBottom: 30,
                          paddingTop: 30
                        }}
                      >
              Node reward share multiplier (per NFT): 30 <br></br>
              Lottery entries per NFT in tier held (per NFT): 30
            </s.TextDescription>
          <StyledImg
            alt={"example"}
            src={"/config/images/Goblet.png"}
            style={{width: '500px'}}
          />
        </s.Container>
       
      </ResponsiveWrapper>
     
      </s.Container>

    </s.Screen>
  );
}

export default App;
