'use client'
import React, { useState } from 'react';

const MultiPlatformCard = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const platforms = [
    {
      id: 1,
      name: 'Twitter',
      icon: (
        <svg width="32" height="32" viewBox="0 0 251 256" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200">
          <path d="M149.078767,108.398529 L242.331303,0 L220.233437,0 L139.262272,94.1209195 L74.5908396,0 L0,0 L97.7958952,142.3275 L0,256 L22.0991185,256 L107.606755,156.605109 L175.904525,256 L250.495364,256 L149.07334,108.398529 L149.078767,108.398529 Z M118.810995,143.581438 L108.902233,129.408828 L30.0617399,16.6358981 L64.0046968,16.6358981 L127.629893,107.647252 L137.538655,121.819862 L220.243874,240.120681 L186.300917,240.120681 L118.810995,143.586865 L118.810995,143.581438 Z" />
        </svg>
      ),
      color: '#181817',
      hoverColor: '#181817',
      borderRadius: '110px 5px 5px 5px',
      iconMargin: 'mt-6 ml-15'
    },
    {
      id: 2,
      name: 'Instagram',
      icon: (
        <svg width="64" height="64" viewBox="0,0,256,256" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200">
          <g transform="scale(8,8)">
            <path d="M11.46875,5c-3.55078,0 -6.46875,2.91406 -6.46875,6.46875v9.0625c0,3.55078 2.91406,6.46875 6.46875,6.46875h9.0625c3.55078,0 6.46875,-2.91406 6.46875,-6.46875v-9.0625c0,-3.55078 -2.91406,-6.46875 -6.46875,-6.46875zM11.46875,7h9.0625c2.47266,0 4.46875,1.99609 4.46875,4.46875v9.0625c0,2.47266 -1.99609,4.46875 -4.46875,4.46875h-9.0625c-2.47266,0 -4.46875,-1.99609 -4.46875,-4.46875v-9.0625c0,-2.47266 1.99609,-4.46875 4.46875,-4.46875zM21.90625,9.1875c-0.50391,0 -0.90625,0.40234 -0.90625,0.90625c0,0.50391 0.40234,0.90625 0.90625,0.90625c0.50391,0 0.90625,-0.40234 0.90625,-0.90625c0,-0.50391 -0.40234,-0.90625 -0.90625,-0.90625zM16,10c-3.30078,0 -6,2.69922 -6,6c0,3.30078 2.69922,6 6,6c3.30078,0 6,-2.69922 6,-6c0,-3.30078 -2.69922,-6 -6,-6zM16,12c2.22266,0 4,1.77734 4,4c0,2.22266 -1.77734,4 -4,4c-2.22266,0 -4,-1.77734 -4,-4c0,-2.22266 1.77734,-4 4,-4z" />
          </g>
        </svg>
      ),
      color: '#FF6E00',
      hoverColor: '#FF6E00',
      borderRadius: '5px 110px 5px 5px',
      iconMargin: 'mt-6 ml-4'
    },
    {
      id: 3,
      name: 'LinkedIn',
      icon: (
        <svg width="82" height="82" viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200">
          <path d="M 39.398,36.138L 39.4351,36.0839L 39.4351,36.138M 51.2177,50.8081L 45.478,50.8081L 45.478,41.6294C 45.478,39.3219 44.6462,37.7487 42.5706,37.7487C 40.983,37.7487 40.0402,38.8102 39.6264,39.8353C 39.4731,40.2018 39.4351,40.7136 39.4351,41.2257L 39.4351,50.8081L 33.6963,50.8081C 33.6963,50.8081 33.7715,35.261 33.6963,33.6519L 39.4351,33.6519L 39.4351,36.0839C 40.1968,34.9152 41.5585,33.2478 44.6074,33.2478C 48.385,33.2478 51.2177,35.6988 51.2177,40.9711M 27.6509,31.3081L 27.6121,31.3081C 25.6872,31.3081 24.4387,29.9912 24.4387,28.3425C 24.4387,26.6607 25.7235,25.3801 27.6872,25.3801C 29.6514,25.3801 30.8585,26.6607 30.8966,28.3425C 30.8966,29.9912 29.6514,31.3081 27.6509,31.3081 Z M 30.5208,50.8081L 24.7794,50.8081L 24.7794,33.6519L 30.5208,33.6519M 54.1939,18.9999L 21.8082,18.9999C 20.2578,18.9999 19,20.2185 19,21.7224L 19,54.2762C 19,55.7797 20.2578,56.9999 21.8082,56.9999L 54.1939,56.9999C 55.7452,56.9999 57,55.7797 57,54.2762L 57,21.7224C 57,20.2185 55.7452,18.9999 54.1939,18.9999 Z" />
        </svg>
      ),
      color: '#FF9B4F',
      hoverColor: '#FF9B4F',
      borderRadius: '5px 5px 5px 110px',
      iconMargin: '-mt-6 ml-8'
    },
    {
      id: 4,
      name: 'Facebook',
      icon: (
        <svg width="82" height="82" viewBox="0 0 76 76" xmlns="http://www.w3.org/2000/svg" className="transition-all duration-200">
          <path d="M 57.0001,25.3338C 57.0001,22.0059 53.9939,19.0001 50.6668,19.0001L 25.3343,19.0001C 22.0047,19.0001 19.0001,22.0059 19.0001,25.3338L 19.0001,50.6663C 19.0001,53.9943 22.0047,57.0001 25.3343,57.0001L 38,57L 38,42.9999L 33,42.9999L 33.0001,36.9998L 38.0001,36.9998L 38.0001,33.8437C 38.0001,29.5882 41.1963,25.7556 45.1272,25.7556L 50.2446,25.7556L 50.2446,32.089L 45.1272,32.089C 44.5657,32.089 44.0001,32.7307 44.0001,33.75L 44.0001,36.9998L 50.5001,36.9997L 50,42.9999L 44,42.9999L 44,57L 50.6668,57.0001C 53.9939,57.0001 57.0001,53.9943 57.0001,50.6663L 57.0001,25.3338 Z" />
        </svg>
      ),
      color: '#FF9B4F',
      hoverColor: '#FF9B4F',
      borderRadius: '5px 5px 110px 5px',
      iconMargin: '-mt-6 ml-2'
    }
  ];

  return (
    <div className="flex flex-col gap-2 ">
      <div className="flex gap-2">
        {platforms.slice(0, 2).map((platform) => (
          <button
            key={platform.id}
            onMouseEnter={() => setHoveredCard(platform.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="w-[120px] h-[120px] outline-none border-none bg-white transition-all duration-200 cursor-pointer shadow-[rgba(50,50,93,0.25)_0px_2px_5px_-1px,rgba(0,0,0,0.3)_0px_1px_3px_-1px] hover:scale-110"
            style={{
              borderRadius: platform.borderRadius,
              backgroundColor: hoveredCard === platform.id ? platform.hoverColor : 'white'
            }}
          >
            <div 
              className={`${platform.iconMargin} transition-all duration-200`}
              style={{
                fill: hoveredCard === platform.id ? 'white' : platform.color
              }}
            >
              {platform.icon}
            </div>
          </button>
        ))}
      </div>
      
      <div className="flex gap-2">
        {platforms.slice(2, 4).map((platform) => (
          <button
            key={platform.id}
            onMouseEnter={() => setHoveredCard(platform.id)}
            onMouseLeave={() => setHoveredCard(null)}
            className="w-[120px] h-[120px] outline-none border-none bg-white transition-all duration-200 cursor-pointer shadow-[rgba(50,50,93,0.25)_0px_2px_5px_-1px,rgba(0,0,0,0.3)_0px_1px_3px_-1px] hover:scale-110"
            style={{
              borderRadius: platform.borderRadius,
              backgroundColor: hoveredCard === platform.id ? platform.hoverColor : 'white'
            }}
          >
            <div 
              className={`${platform.iconMargin} transition-all duration-200`}
              style={{
                fill: hoveredCard === platform.id ? 'white' : platform.color
              }}
            >
              {platform.icon}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MultiPlatformCard;