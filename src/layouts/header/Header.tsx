import { useWeb3Modal } from "@web3modal/wagmi/react";
import "./Header.scss";
import { useAccount } from "wagmi";

const Header = () => {
  const { open } = useWeb3Modal();
  const { address, isConnected } = useAccount();
  return (
    <>
      <div className="flex justify-end px-4 pt-3 relative z-10">
        {!isConnected ? (
          <button className="btn-connect tracking-normal" onClick={() => open()}>
            Connect Wallet
          </button>
        ) : (
          <button className="btn-connect-outline tracking-normal" onClick={() => open()}>
            {address?.slice(0, 6) + "..." + address?.slice(-3)}
          </button>
        )}
      </div>
    </>
  );
};

export default Header;
