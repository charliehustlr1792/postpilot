import Button from '@/components/ui/Button'
import Image from 'next/image'
import React from 'react'

const HomePage = () => {
  return (
    <div className='relative w-full min-h-screen bg-[#F3EFEC] overflow-hidden pt-[90px]'>
      <div
        className="absolute -left-[400px] top-[221px] w-[542px] h-[758px] inline-flex flex-col items-center rounded-[18px] border border-[#FFD4B2] bg-[#F3EFEC] overflow-hidden"
        style={{
          transform: 'rotate(34.44deg)',
          padding: '0 0 459.005px 197.471px'
        }}
      >
        <div
          className="absolute left-[360px] -top-[200px] w-[277px] h-[469px] rounded-[18px]"
          style={{
            background: 'radial-gradient(71.91% 70.92% at 57.34% 25.91%, #FFB67D 0%, #F3EFEC 100%)',
            filter: 'blur(50px)'
          }}
        ></div>
      </div>

      <div
        className="absolute -right-[400px] top-[221px] w-[542px] h-[758px] inline-flex flex-col items-center rounded-[18px] border border-[#FFD4B2] bg-[#F3EFEC] overflow-hidden"
        style={{
          transform: 'rotate(-34.44deg)',
          padding: '0 197.733px 457.972px 0'
        }}
      >
        <div
          className="absolute -left-[100px] -top-[150px] w-[177px] h-[469px] rounded-[18px]"
          style={{
            background: 'radial-gradient(71.91% 70.92% at 57.34% 25.91%, #FFB57C 0%, #F3EFEC 100%)',
            filter: 'blur(50px)'
          }}
        ></div>
      </div>

      <svg className="absolute left-[731px] top-[168px] w-[50px] h-[1px] flex-shrink-0" width="50" height="1" viewBox="0 0 50 1" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0 0.5L50 0V1L0 0.5Z" fill="#FF9B4F" />
      </svg>
      <svg className="absolute left-[1201px] top-[175px] w-[39px] h-[34px]" width="39" height="34" viewBox="0 0 39 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M38.5211 0.618022L0.645958 33.2634L0.000689864 32.4995L38.5211 0.618022Z" fill="#FF9B4F" />
      </svg>
      <svg className="absolute left-[1127px] top-[365px] w-[39px] h-[34px]" width="39" height="34" viewBox="0 0 39 34" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M38.5211 0.618022L0.645958 33.2634L0.000689864 32.4995L38.5211 0.618022Z" fill="#FF9B4F" />
      </svg>
      <svg className="absolute left-[274px] top-[365px] w-[40px] h-[33px]" width="40" height="33" viewBox="0 0 40 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.178491 0.714628L39.2907 31.8672L38.6599 32.6432L0.178491 0.714628Z" fill="#FF9B4F" />
      </svg>
      <svg className="absolute left-[201px] top-[175px] w-[40px] h-[33px]" width="40" height="33" viewBox="0 0 40 33" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M0.176782 0.387968L39.289 31.5406L38.6582 32.3165L0.176782 0.387968Z" fill="#FF9B4F" />
      </svg>

      <div className="relative w-full flex flex-col items-center px-4 md:px-8">
        <div className="flex flex-col items-center gap-[42px] w-[734px] max-w-full mt-[78px]">
          <div className="flex flex-col items-center gap-[18px] w-full">
            <div className="flex h-[34px] px-[14px] py-2 justify-center items-center gap-1 rounded-[100px] border border-[#EAE7E4] bg-white">
              <span className="text-[#4D4946] text-base font-[420] leading-[19px]" style={{ fontFamily: 'Inter, -apple-system, Roboto, Helvetica, sans-serif' }}>
                Create. Schedule. Relax
              </span>
              <svg width="24" height="24" viewBox="0 0 25 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15.5001 17L20.5 12L15.5 7" stroke="#FF9B4F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M4.5 12H20.5" stroke="#FF9B4F" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>

            <div className="flex flex-col items-center gap-5 w-full">
              <h1
                className="w-full text-[#181817] text-center text-[82px] md:text-[64px] sm:text-[48px] font-bold leading-[86px] md:leading-[68px] sm:leading-[52px]"
                style={{ fontFamily: 'Helvetica Neue, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Your Social Media,<br />On Autopilot
              </h1>
              <p
                className="w-[518px] max-w-full text-[#4D4946] text-center text-xl leading-7"
                style={{ fontFamily: 'Helvetica Neue, -apple-system, Roboto, Helvetica, sans-serif' }}
              >
                Schedule smarter, post faster, and grow effortlessly<br />with PostPilot, your AI-powered social media copilot.
              </p>
            </div>
          </div>
        </div>

        <Button
          text="Get Started"
          className="w-[163px] h-[52px] py-[10px] px-[26px] text-xl font-[520] leading-8 mt-[34px]"
        />

        <div className='flex flex-col items-center gap-10 w-[1028px] max-w-full mt-[231px] mb-20'>
          <p
            className='w-full text-[#4D4946] text-center text-xl leading-[18px]'
            style={{ fontFamily: 'Helvetica Neue, -apple-system, Roboto, Helvetica, sans-serif' }}
          >
            One Platform for Every Platform
          </p>

          {/* Company logos */}
          <div className='flex justify-center items-center gap-[65px] md:gap-10 sm:gap-8 flex-wrap w-full'>
            {/* LinkedIn logo */}
            <svg width="64px" height="64px" viewBox="0 0 76.00 76.00" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enableBackground="new 0 0 76.00 76.00" xmlSpace="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#000000" fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round" d="M 39.398,36.138L 39.4351,36.0839L 39.4351,36.138M 51.2177,50.8081L 45.478,50.8081L 45.478,41.6294C 45.478,39.3219 44.6462,37.7487 42.5706,37.7487C 40.983,37.7487 40.0402,38.8102 39.6264,39.8353C 39.4731,40.2018 39.4351,40.7136 39.4351,41.2257L 39.4351,50.8081L 33.6963,50.8081C 33.6963,50.8081 33.7715,35.261 33.6963,33.6519L 39.4351,33.6519L 39.4351,36.0839C 40.1968,34.9152 41.5585,33.2478 44.6074,33.2478C 48.385,33.2478 51.2177,35.6988 51.2177,40.9711M 27.6509,31.3081L 27.6121,31.3081C 25.6872,31.3081 24.4387,29.9912 24.4387,28.3425C 24.4387,26.6607 25.7235,25.3801 27.6872,25.3801C 29.6514,25.3801 30.8585,26.6607 30.8966,28.3425C 30.8966,29.9912 29.6514,31.3081 27.6509,31.3081 Z M 30.5208,50.8081L 24.7794,50.8081L 24.7794,33.6519L 30.5208,33.6519M 54.1939,18.9999L 21.8082,18.9999C 20.2578,18.9999 19,20.2185 19,21.7224L 19,54.2762C 19,55.7797 20.2578,56.9999 21.8082,56.9999L 54.1939,56.9999C 55.7452,56.9999 57,55.7797 57,54.2762L 57,21.7224C 57,20.2185 55.7452,18.9999 54.1939,18.9999 Z "></path> </g></svg>
            {/* Facebook logo */}
            <svg width="64px" height="64px" viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" baseProfile="full" enableBackground="new 0 0 76.00 76.00" xmlSpace="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path fill="#000000" fillOpacity="1" strokeWidth="0.2" strokeLinejoin="round" d="M 57.0001,25.3338C 57.0001,22.0059 53.9939,19.0001 50.6668,19.0001L 25.3343,19.0001C 22.0047,19.0001 19.0001,22.0059 19.0001,25.3338L 19.0001,50.6663C 19.0001,53.9943 22.0047,57.0001 25.3343,57.0001L 38,57L 38,42.9999L 33,42.9999L 33.0001,36.9998L 38.0001,36.9998L 38.0001,33.8437C 38.0001,29.5882 41.1963,25.7556 45.1272,25.7556L 50.2446,25.7556L 50.2446,32.089L 45.1272,32.089C 44.5657,32.089 44.0001,32.7307 44.0001,33.75L 44.0001,36.9998L 50.5001,36.9997L 50,42.9999L 44,42.9999L 44,57L 50.6668,57.0001C 53.9939,57.0001 57.0001,53.9943 57.0001,50.6663L 57.0001,25.3338 Z "></path> </g></svg>

            {/* X logo */}
            <svg width="32px" height="32px" viewBox="0 0 251 256" version="1.1" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
              <title>X</title>
              <g>
                <path d="M149.078767,108.398529 L242.331303,0 L220.233437,0 L139.262272,94.1209195 L74.5908396,0 L0,0 L97.7958952,142.3275 L0,256 L22.0991185,256 L107.606755,156.605109 L175.904525,256 L250.495364,256 L149.07334,108.398529 L149.078767,108.398529 Z M118.810995,143.581438 L108.902233,129.408828 L30.0617399,16.6358981 L64.0046968,16.6358981 L127.629893,107.647252 L137.538655,121.819862 L220.243874,240.120681 L186.300917,240.120681 L118.810995,143.586865 L118.810995,143.581438 Z" fill="#000000" />
              </g>
            </svg>

            {/* Reddit logo */}
            <svg fill="#000000" width="42px" height="64px" viewBox="0 0 256 256" id="Flat" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M248,104a31.99228,31.99228,0,0,0-52.9375-24.19043c-16.75439-8.90112-36.76172-14.279-57.666-15.52539l5.19581-31.17578,21.83105,3.3584a24.00409,24.00409,0,1,0,2.43506-15.814l-29.64209-4.56006a7.996,7.996,0,0,0-9.10742,6.5918l-6.91309,41.478c-21.83887.94165-42.813,6.37891-60.2583,15.647a31.99266,31.99266,0,0,0-42.59229,47.74024A59.04669,59.04669,0,0,0,16,144c0,21.93457,12.042,42.35156,33.90723,57.48926C70.875,216.00588,98.60938,224,128,224s57.125-7.99414,78.09277-22.51074C227.958,186.35158,240,165.93459,240,144a59.01726,59.01726,0,0,0-2.3457-16.44922A32.17163,32.17163,0,0,0,248,104ZM72,132a16,16,0,1,1,16,16A16.01833,16.01833,0,0,1,72,132Zm92.69629,51.10938a80.122,80.122,0,0,1-73.39209,0,8,8,0,0,1,7.34033-14.2168,64.09433,64.09433,0,0,0,58.71094,0,8.00008,8.00008,0,0,1,7.34082,14.2168ZM168,148a16,16,0,1,1,16-16A16.01833,16.01833,0,0,1,168,148Z"></path> </g></svg>

            {/* Pinterest logo */}
            <svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" width="35px" height="35px" viewBox="0 0 579.148 579.148" xmlSpace="preserve"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <g> <path d="M434.924,38.847C390.561,12.954,342.107,0.01,289.574,0.01c-52.54,0-100.992,12.944-145.356,38.837 C99.854,64.741,64.725,99.87,38.837,144.228C12.944,188.597,0,237.049,0,289.584c0,58.568,15.955,111.732,47.883,159.486 c31.922,47.768,73.771,83.08,125.558,105.949c-1.01-26.896,0.625-49.137,4.902-66.732l37.326-157.607 c-6.285-12.314-9.425-27.645-9.425-45.999c0-21.365,5.404-39.217,16.212-53.538c10.802-14.333,24.003-21.5,39.59-21.5 c12.564,0,22.246,4.143,29.034,12.448c6.787,8.292,10.184,18.727,10.184,31.292c0,7.797-1.451,17.289-4.334,28.47 c-2.895,11.187-6.665,24.13-11.31,38.837c-4.651,14.701-7.98,26.451-9.994,35.252c-3.525,15.33-0.63,28.463,8.672,39.4 c9.295,10.936,21.616,16.4,36.952,16.4c26.898,0,48.955-14.951,66.176-44.865c17.217-29.914,25.826-66.236,25.826-108.973 c0-32.925-10.617-59.701-31.859-80.312c-21.242-20.606-50.846-30.918-88.795-30.918c-42.486,0-76.862,13.642-103.123,40.906 c-26.267,27.277-39.401,59.896-39.401,97.84c0,22.625,6.414,41.609,19.229,56.941c4.272,5.029,5.655,10.428,4.149,16.205 c-0.508,1.512-1.511,5.281-3.017,11.309c-1.505,6.029-2.515,9.934-3.017,11.689c-2.014,8.049-6.787,10.564-14.333,7.541 c-19.357-8.043-34.064-21.99-44.113-41.85c-10.055-19.854-15.08-42.852-15.08-68.996c0-16.842,2.699-33.685,8.103-50.527 c5.404-16.842,13.819-33.115,25.264-48.832c11.432-15.698,25.135-29.596,41.102-41.659c15.961-12.069,35.38-21.738,58.256-29.04 c22.871-7.283,47.51-10.93,73.904-10.93c35.693,0,67.744,7.919,96.146,23.751c28.402,15.839,50.086,36.329,65.043,61.463 c14.951,25.135,22.436,52.026,22.436,80.692c0,37.705-6.541,71.641-19.607,101.807c-13.072,30.166-31.549,53.855-55.43,71.072 c-23.887,17.215-51.035,25.826-81.445,25.826c-15.336,0-29.664-3.58-42.986-10.748c-13.33-7.166-22.503-15.648-27.528-25.453 c-11.31,44.486-18.097,71.018-20.361,79.555c-4.78,17.852-14.584,38.457-29.413,61.836c26.897,8.043,54.296,12.062,82.198,12.062 c52.534,0,100.987-12.943,145.35-38.83c44.363-25.895,79.492-61.023,105.387-105.393c25.887-44.365,38.838-92.811,38.838-145.352 c0-52.54-12.951-100.985-38.838-145.355C514.422,99.87,479.287,64.741,434.924,38.847z"></path> </g> </g> </g></svg>

          </div>
        </div>
      </div>

      {/*Pricing*/}

    </div>
  )
}

export default HomePage
