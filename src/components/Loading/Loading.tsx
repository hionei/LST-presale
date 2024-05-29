import Spinner from "./tube-spinner.svg";
import CheckMark from "./check-mark.svg";
import Error from "./error.svg";
import { useEffect, useState } from "react";
import { status } from "../../types/loader";

type LoadingSpinType = {
  open: boolean;
  approveStatus: number;
  signStatus: number;
};

const Loading = ({ open, approveStatus, signStatus }: LoadingSpinType) => {
  return (
    <div
      className={`${
        !open ? "hidden" : "flex"
      } fixed left-0 top-0 w-full h-[100vh] z-10  justify-center items-center bg-[#333333b3]`}
    >
      <div className=" flex flex-col gap-1  bg-[#838383] p-1 rounded">
        <div
          className={`${approveStatus == status.NONE ? "hidden" : "flex"} gap-2 items-center bg-[#4b4b4b] p-2 text-white rounded`}
        >
          {approveStatus == status.NORMAL && <span className="inline-block w-[15px] h-[15px] bg-[#838383] rounded-full"></span>}
          {approveStatus == status.PENDING && <img src={Spinner} width={"25px"} />}
          {approveStatus == status.FINISHED && <img src={CheckMark} width={"25px"} />}
          {approveStatus == status.FAILED && <img src={Error} width={"25px"} />}
          <span>Approving 1000 USDT</span>
        </div>

        <div
          className={`${signStatus == status.NONE ? "hidden" : "flex"} gap-2 items-center bg-[#4b4b4b] p-2 text-white rounded`}
        >
          {signStatus == status.NORMAL && <span className="inline-block w-[15px] h-[15px] bg-[#838383] rounded-full"></span>}
          {signStatus == status.PENDING && <img src={Spinner} width={"25px"} />}
          {signStatus == status.FINISHED && <img src={CheckMark} width={"25px"} />}
          {signStatus == status.FAILED && <img src={Error} width={"25px"} />}
          <span>Signing Transaction</span>
        </div>
      </div>
    </div>
  );
};

export default Loading;
