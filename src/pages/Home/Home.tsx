import "./home.scss";
import Select, { components } from "react-select";
import BNBIcon from "./img/BNB.svg";
import USDTIcon from "./img/USDT.svg";
import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import { useAccount, useReadContract, useSendTransaction, useWriteContract } from "wagmi";
import { readContract, type WriteContractParameters } from "@wagmi/core";
import { config, wagmiConfig } from "../../config/wagmi";
import { presaleAbi } from "../../artifacts/PrivateSale.sol/PrivateSale";
import { LST_CONTRACT_ADDRESS, PRESALE_CONTRACT_ADDRESS, USDT_CONTRACT_ADDRESS } from "../../config";
import Web3 from "web3";
import { parseEther, zeroAddress } from "viem";
import { useWeb3Modal } from "@web3modal/wagmi/react";
import { bscTestnet } from "viem/chains";
import Loading from "../../components/Loading";
import { status } from "../../types/loader";
import { getTransactionReceipt, getTransactionConfirmations, waitForTransactionReceipt } from "@wagmi/core";
import { USDT_ABI } from "../../artifacts/USDT.sol/USDT";

const web3 = new Web3();

const cryptos = [
  { value: "BNB", label: " BNB ", icon: BNBIcon },
  { value: "USDT", label: "USDT", icon: USDTIcon },
];

const Option = (props: any) => (
  <components.Option {...props} className="crypto-option">
    <img src={props.data.icon} alt="logo" className="crypto-logo" />
    {props.data.label}
  </components.Option>
);

const Home = () => {
  const [selectedCoin, setSelectedCoin] = useState(cryptos[0]);
  const [presaleSupply, setPresaleSupply] = useState(0);
  const [curSoldAmount, setCurSoldAmount] = useState(0);
  const [totalRaisedUSD, setTotalRaisedUSD] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [investorsAmount, setInvestorsAmount] = useState(0);
  const [diff, setDiff] = useState(0);
  const [openLoading, setOpenLoading] = useState(false);
  const [approveStatus, setApproveStatus] = useState(status.NONE);
  const [signStatus, setSignStatus] = useState(status.NONE);
  const [estimatedAmount, setEstimatedAmount] = useState({ raw: 0, bonus: 0 });
  const debounceTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [buyTokenAmount, setBuyTokenAmount] = useState(0);

  const { address, isConnected } = useAccount();
  const { open } = useWeb3Modal();
  const {
    data: hash,
    writeContractAsync,
    isPending,
  } = useWriteContract({
    mutation: {
      onError: (e) => {
        console.log(e);
      },
    },
  });

  const { data: startTime } = useReadContract({
    abi: presaleAbi,
    address: PRESALE_CONTRACT_ADDRESS,
    functionName: "startTime",
  });
  const { data: endTime } = useReadContract({
    abi: presaleAbi,
    address: PRESALE_CONTRACT_ADDRESS,
    functionName: "endTime",
  });

  const { data: currentSoldAmount } = useReadContract({
    abi: presaleAbi,
    address: PRESALE_CONTRACT_ADDRESS,
    functionName: "currentSoldAmount",
  });

  const { data: totalRaised } = useReadContract({
    abi: presaleAbi,
    address: PRESALE_CONTRACT_ADDRESS,
    functionName: "totalRaised",
  });

  const { data: presaleSupplyAmount } = useReadContract({
    abi: presaleAbi,
    address: PRESALE_CONTRACT_ADDRESS,
    functionName: "presaleSupplyAmount",
  });

  const { data: investorCount } = useReadContract({
    abi: presaleAbi,
    address: PRESALE_CONTRACT_ADDRESS,
    functionName: "investorCount",
  });

  const handleChange = (value: any) => {
    setSelectedCoin(value);
  };

  const SingleValue = ({ children, ...props }: any) => (
    <components.SingleValue {...props}>
      <img src={selectedCoin.icon} alt="s-logo" className="selected-logo" />
      {children}
    </components.SingleValue>
  );

  const currentUnixTime = useMemo(() => {
    return Math.floor(Date.now() / 1000);
  }, []);

  useEffect(() => {
    investorCount && setInvestorsAmount(Number(investorCount));
  }, [investorCount]);

  useEffect(() => {
    if (typeof presaleSupplyAmount == "bigint" && typeof totalRaised == "bigint" && typeof currentSoldAmount == "bigint") {
      const presaleSupplyAmountEther = web3.utils.fromWei(String(presaleSupplyAmount), "ether");
      const currentSoldAmountEther = web3.utils.fromWei(String(currentSoldAmount), "ether");
      const totalRaisedEther = web3.utils.fromWei(String(totalRaised), "ether");

      setPresaleSupply(Number(presaleSupplyAmountEther));
      setCurSoldAmount(Number(currentSoldAmountEther));
      setTotalRaisedUSD(Number(Number(Number(totalRaisedEther) / 10 ** 8).toFixed(2)));
    }
  }, [currentSoldAmount, totalRaised, presaleSupplyAmount]);

  useEffect(() => {
    let timer: any;

    if (!startTime && !endTime) return;

    if (Number(startTime) > currentUnixTime) {
      setIsStarted(false);
      setDiff(Number(startTime) - Number(currentUnixTime));
      timer = setInterval(() => {
        setDiff((state) => {
          state = state - 1;
          return state;
        });
      }, 1000);
    } else {
      setIsStarted(true);
      setDiff(Number(endTime) - Number(currentUnixTime));
      timer = setInterval(() => {
        setDiff((state) => {
          state = state - 1;
          return state;
        });
      }, 1000);
    }

    return () => {
      clearInterval(timer);
    };
  }, [startTime, endTime]);

  const onInputChange = (eve: any) => {
    setBuyTokenAmount(eve.target.value);
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    if (selectedCoin.value == "BNB") {
      debounceTimeout.current = setTimeout(async () => {
        const result: any = await readContract(wagmiConfig, {
          abi: presaleAbi,
          address: PRESALE_CONTRACT_ADDRESS,
          functionName: "getTokenAmountFromEth",
          args: [parseEther(eve.target.value)],
        });

        setEstimatedAmount({
          raw: Math.floor(Number(web3.utils.fromWei(Number(result[0]), "ether"))),
          bonus: investorsAmount > 1000 ? 0 : Math.floor(Number(web3.utils.fromWei(Number(result[1]), "ether"))),
        });
      }, 2000);
    } else if (selectedCoin.value == "USDT") {
      debounceTimeout.current = setTimeout(() => {
        const bonus = Number(eve.target.value) > 20000 ? Number(eve.target.value) * 1.5 : Number(eve.target.value) * 1.25;
        setEstimatedAmount({ raw: Number(eve.target.value) / 0.1, bonus: investorsAmount > 1000 ? 0 : bonus });
      }, 2000);
    }
    console.log(selectedCoin);
  };

  const buyToken = async () => {
    try {
      if (selectedCoin.value == "BNB") {
        try {
          setOpenLoading(true);
          setSignStatus(status.PENDING);
          const result = await writeContractAsync({
            abi: presaleAbi,
            address: PRESALE_CONTRACT_ADDRESS,
            functionName: "buyTokenWithEth",
            args: [zeroAddress],
            value: parseEther(buyTokenAmount.toString()),
            chainId: bscTestnet.id,
          });

          const confirmed = await waitForTransactionReceipt(wagmiConfig, { hash: result });
          console.log(confirmed);
          setSignStatus(status.FINISHED);
          setTimeout(() => {
            setOpenLoading(false);
          }, 1000);
        } catch (err) {
          console.log(err);
          setSignStatus(status.FAILED);
          setTimeout(() => {
            setOpenLoading(false);
          }, 500);
        }
      } else if (selectedCoin.value == "USDT") {
        setOpenLoading(true);
        setApproveStatus(status.PENDING);
        setSignStatus(status.NORMAL);
        const approveHash = await writeContractAsync({
          abi: USDT_ABI,
          address: USDT_CONTRACT_ADDRESS,
          functionName: "approve",
          args: [PRESALE_CONTRACT_ADDRESS, parseEther(buyTokenAmount.toString())],
        });

        const approveConfirm = await waitForTransactionReceipt(wagmiConfig, { hash: approveHash });
        setApproveStatus(status.FINISHED);
        setSignStatus(status.PENDING);
        const signHash = await writeContractAsync({
          abi: presaleAbi,
          address: PRESALE_CONTRACT_ADDRESS,
          functionName: "buyTokenWithCoin",
          args: [USDT_CONTRACT_ADDRESS, parseEther(buyTokenAmount.toString()), zeroAddress],
        });

        const signConfirm = await waitForTransactionReceipt(wagmiConfig, { hash: signHash });
        setSignStatus(status.FINISHED);

        setTimeout(() => {
          setApproveStatus(status.NONE);
          setSignStatus(status.NONE);
          setOpenLoading(false);
        }, 1000);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <Loading open={openLoading} approveStatus={approveStatus} signStatus={signStatus} />
      <div className="flex flex-wrap  gap-40 justify-center items-center">
        <div className="mt-40 lg:mt-0">
          <h2 className="text-[1.5em] sm:text-[1.9em] font-bold mb-10 text-white">Welcome to the Pre-sale of LST</h2>
          <div className="flex flex-col gap-6 px-6 font-semibold text-[1em] sm:text-[1.2em] text-start text-[#B0B0B0]">
            <p>Pre-sale Price: $0.10</p>
            <p>Public-sale Price: $0.50</p>
            <p>Linearly vested for 6 months</p>
          </div>
        </div>
        <div>
          <div className="pre-sale-box">
            <div className="title-bar">
              {isStarted ? (
                <h5 className="uppercase">pre-sale ending soon</h5>
              ) : (
                <h5 className="uppercase">pre-sale beginning soon</h5>
              )}
            </div>
            <div className="px-5 pb-10">
              <div className="time-left-bar">
                <div className="flex gap-1">
                  <span className="inline-block w-[30px] text-end">{Math.floor(diff / (3600 * 24))}d</span>
                  <span className="inline-block w-[30px]">{Math.floor((diff % (3600 * 24)) / 3600)}h</span>
                  <span className="inline-block w-[30px]">{Math.floor((diff % 3600) / 60)}m</span>
                  <span className="inline-block w-[30px]">{Math.floor(diff % 60)}s</span>
                </div>
              </div>
              <p className="token-price">1LST = $0.1 USDT</p>
              <p className="sold-amount mb-1">{Number(curSoldAmount / presaleSupply).toFixed(6)}% SOLD</p>
              <div className="w-full h-[10px] bg-white bg-opacity-70">
                <div
                  className={`h-[10px] bg-[#3994fe] bg-opacity-80`}
                  style={{ width: `${Number(curSoldAmount / presaleSupply).toFixed(4)}%` }}
                ></div>
              </div>
              <p className="my-3 text-[#999] font-semibold">Total Raised: ${totalRaisedUSD}</p>
              <p className="text-[#ccc] font-semibold">{investorsAmount >= 1000 ? 1000 : investorsAmount} / 1000 whitelisted</p>
              <div className="flex justify-center items-center gap-2 mt-5">
                <div className="input-effect">
                  <input
                    type="number"
                    onChange={onInputChange}
                    className="w-[150px] sm:w-[220px] amount-input text-[0.8em] sm:text-[1em]"
                    placeholder={`Enter Amount in ${selectedCoin.value}`}
                  />
                  {/* <label>First Name</label> */}
                  <span className="focus-bg"></span>
                </div>

                <Select
                  value={selectedCoin}
                  options={cryptos}
                  onChange={handleChange}
                  styles={{
                    control: (baseStyles) => ({
                      ...baseStyles,
                      background: "transparent",
                      color: "#333",
                      borderColor: "#7b7575",
                      padding: "1px 0",
                    }),
                    singleValue: (base) => ({
                      ...base,
                      display: "flex",
                      color: "#d7d7d7",
                      alignItems: "center",
                      width: "75px",
                    }),
                  }}
                  components={{
                    Option,
                    SingleValue,
                  }}
                />
              </div>

              <p className="text-[#c3c3c3] mb-2 mt-1 text-[13px]">
                ~{estimatedAmount.raw} + {estimatedAmount.bonus}(bonus) LST
              </p>
              {!isConnected ? (
                <button className="btn-connect-outline" onClick={() => open()}>
                  Connect Wallet
                </button>
              ) : (
                <button className="btn-connect" onClick={() => buyToken()}>
                  BUY
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
