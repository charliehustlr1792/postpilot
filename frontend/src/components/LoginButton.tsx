import React from 'react'

const LoginButton = () => {
    return (
        <div className="w-[81px] h-9 flex-shrink-0">
            <div 
                className="flex w-[81px] h-9 px-5 py-[9px] justify-center items-center flex-shrink-0 rounded-full cursor-pointer"
                style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.16) 0%, rgba(255, 255, 255, 0.16) 100%), #FF6E00',
                    boxShadow: '0 1px 0 0 #FFA76A inset, 0 1px 3px -1px #A84D09, 0 0 0 1px #F46F0B'
                }}
            >
                <span 
                    className="text-white text-sm font-[560] leading-[18px] w-[41px] h-[18px]" 
                    style={{
                        fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif',
                        textShadow: '0 0.8px 0.7px #D96F1D'
                    }}
                >
                    Log in
                </span>
            </div>
        </div>
    )
}

export default LoginButton
