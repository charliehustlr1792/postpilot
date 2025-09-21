import React from 'react'

const LoginButton = () => {
    return (
        <button className="flex w-[81px] h-9 px-5 py-[9px] justify-center items-center flex-shrink-0 rounded-full bg-gradient-to-b from-[rgba(255,255,255,0.16)] to-[rgba(255,255,255,0.16)] bg-[#FF6E00] shadow-[0_1px_0_0_#FFA76A_inset,0_1px_3px_-1px_#A84D09,0_0_0_1px_#F46F0B]">
            <span className="text-white text-shadow-[0_0.8px_0.7px_#D96F1D] font-inter text-sm font-[560] leading-[18px]">
                Log in
            </span>
        </button>
    )
}

export default LoginButton