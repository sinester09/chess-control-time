import React from 'react';

export const PlayIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PauseIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const CheckIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export const PlusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
);

export const TrophyIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 8v5a3 3 0 01-3 3H11a3 3 0 01-3-3V8m2 8h4m-7 4h10M5 8h14a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V9a1 1 0 011-1z" />
    </svg>
);

export const CoffeeIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4a2 2 0 012 2v2a2 2 0 01-2 2h-4v3a2 2 0 01-2 2H8a2 2 0 01-2-2v-3H4a2 2 0 01-2-2v-2a2 2 0 012-2h4V7a3 3 0 013-3h2a3 3 0 013 3v3z" />
  </svg>
);

export const ClockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export const PlayCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        <path strokeLinecap="round" strokeLinejoin="round"d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
    </svg>
);

export const StopCircleIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563h6v4.874H9V9.563Z" />
    </svg>
);

export const DownloadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

export const UploadIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
    </svg>
);

export const FocusIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

export const MenuIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);

export const LogOutIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6A2.25 2.25 0 005.25 5.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H9" />
    </svg>
);


export const CalendarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-18 0h16.5m-11.25-6.75h4.5m-7.5 3.75h4.5" />
  </svg>
);

export const LogoEmpresas = ({ 
  size = 100, 
  primaryColor = "#1e3a8a", // Azul oscuro
  backgroundColor = "#ffffff", // Blanco
  className = "",
  ...props 
}) => {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 500 500" 
      className={className}
      {...props}
    >
      {/* Fondo blanco */}
      <path 
        d="M 0 250.002 L 0 500.004 250.250 499.752 L 500.500 499.500 500.752 249.750 L 501.004 0 250.502 0 L 0 0 0 250.002 M 0.492 250.500 C 0.492 388, 0.608 444.101, 0.750 375.170 C 0.892 306.238, 0.892 193.738, 0.750 125.170 C 0.608 56.601, 0.492 113, 0.492 250.500"
        stroke="none" 
        fill={backgroundColor} 
        fillRule="evenodd"
      />
      
      {/* Elementos principales en azul oscuro */}
      <path 
        d="M 318.401 36.750 C 318.749 38.263, 319.453 44.132, 319.963 49.793 C 320.474 55.453, 321.172 60.966, 321.514 62.043 C 322.994 66.706, 318.341 63.450, 305 50.486 C 294.948 40.718, 290 36.877, 290 38.842 C 290 39.344, 290.705 40.340, 291.567 41.056 C 292.429 41.771, 295.855 46.329, 299.181 51.185 C 305.500 60.411, 310.021 65, 312.791 65 C 314.271 65, 314.262 65.167, 312.696 66.733 C 310.072 69.357, 308.496 67.845, 299 53.594 C 286.121 34.264, 282.341 32.531, 283.292 46.391 C 284.052 57.487, 287.183 68.985, 291.994 78.358 L 296.028 86.216 287.764 94.715 C 283.219 99.389, 277.094 104.763, 274.153 106.656 C 268.080 110.567, 267.674 113.205, 271.609 123.222 C 273.901 129.056, 274.146 128.569, 258.634 149 C 242.350 170.450, 236.544 177.269, 230.433 182.126 C 227.407 184.532, 224.660 187.561, 224.330 188.858 C 223.185 193.350, 224.730 206.810, 226.905 211.303 C 228.057 213.684, 229 217.454, 229 219.681 C 229 224.582, 231.614 228.252, 237.095 231.048 C 239.243 232.144, 241 233.637, 241 234.365 C 241 237.944, 254.703 242.579, 264.629 242.357 C 274.837 242.129, 287.765 228.638, 286.337 219.705 C 284.831 210.289, 312.194 192.666, 330.888 191.012 C 335.625 190.593, 340.800 189.732, 342.389 189.097 C 346.498 187.457, 346.566 187.941, 343.568 197.555 C 338.998 212.214, 332.023 224.116, 316.057 244.500 C 301.979 262.475, 294.837 274.121, 291.925 283.850 C 291.209 286.243, 289.610 288.865, 288.371 289.676 C 287.133 290.488, 285.980 292.071, 285.810 293.194 C 285.592 294.629, 283.948 295.813, 280.275 297.178 C 266.759 302.204, 267.915 315.034, 282.292 319.566 C 289.537 321.850, 290.440 325.255, 284.250 326.949 C 273.094 330.002, 270.044 337.641, 278.085 342.391 C 286.362 347.280, 274.513 371.983, 260.408 379.248 C 254.643 382.216, 252.662 384.814, 252.788 389.237 C 252.850 391.439, 252.035 392.610, 249.077 394.568 C 243.101 398.522, 239.216 432.334, 244.505 434.363 C 247.375 435.465, 468.842 435.065, 469.526 433.958 C 469.880 433.385, 469.850 425.848, 469.460 417.209 L 468.750 401.500 464.375 397.267 C 461.164 394.160, 460 392.253, 460 390.099 C 460 385.546, 459.190 384.330, 453.888 380.928 C 440.490 372.331, 426.449 347.463, 432.935 343.817 C 439.925 339.887, 436.610 332.831, 426.434 329.981 C 418.509 327.763, 417.903 323.862, 425.199 322.017 C 444.911 317.033, 450.732 306.688, 437.020 301.008 C 435.176 300.244, 434 299.026, 434 297.879 C 434 296.845, 433.054 295.054, 431.898 293.898 C 427.687 289.687, 428.035 278.608, 432.869 263.060 C 435.141 255.752, 437 249.394, 437 248.931 C 437 248.468, 438.125 246.431, 439.500 244.405 C 440.875 242.379, 442 239.979, 442 239.072 C 442 238.165, 442.900 235.658, 444 233.500 C 445.100 231.342, 446 228.574, 446 227.348 C 446 226.121, 446.450 224.840, 447 224.500 C 447.550 224.160, 448 223.109, 448 222.163 C 448 221.218, 448.875 219.696, 449.944 218.780 C 451.013 217.865, 452.154 215.402, 452.479 213.308 C 452.805 211.214, 453.505 207.062, 454.035 204.083 C 454.566 201.104, 455.014 197.279, 455.032 195.583 C 455.049 193.887, 455.724 191.626, 456.532 190.559 C 458.185 188.374, 458.603 168.298, 457.128 161.956 C 456.669 159.984, 456.702 157.333, 457.202 155.982 C 457.815 154.325, 457.648 152.430, 456.677 150.026 C 454.034 143.486, 451 132.380, 451 129.244 C 451 123.676, 449.230 120.317, 447.500 122.602 C 446.248 124.257, 446.060 124.287, 446.032 122.833 C 446.014 121.916, 445.098 118.991, 443.995 116.333 L 441.990 111.500 443.995 113.861 C 449.692 120.569, 440.761 103.301, 432.172 91 C 424.935 80.637, 404.738 65.033, 392.750 60.545 C 385.274 57.745, 385.062 57.813, 388.165 62.010 C 390.668 65.395, 391.734 74.154, 390.111 78 C 389.261 80.017, 389.171 79.495, 389.650 75.303 C 390.963 63.809, 382.980 55.036, 371.218 55.047 C 353.392 55.063, 353.199 55.078, 357.890 56.042 C 367.841 58.086, 368.881 63.038, 359.250 62.520 L 352.500 62.157 350 57.600 C 346.282 50.822, 340.678 44.580, 333.292 38.989 C 326.220 33.636, 323.179 32.432, 327 36.500 C 328.292 37.875, 329.021 39, 328.621 39 C 328.221 39, 326.238 37.875, 324.215 36.500 C 319.279 33.146, 317.587 33.219, 318.401 36.750"
        stroke="none" 
        fill={primaryColor} 
        fillRule="evenodd"
      />

      {/* Resto de elementos en azul oscuro */}
      <path 
        d="M 116.189 236.039 C 110.067 241.742, 113.725 253, 121.700 253 L 127 253 127 258.893 C 127 265.059, 126.310 266, 121.787 266 C 120.660 266, 115.722 267.379, 110.815 269.063 L 101.893 272.127 97.391 269.947 C 80.946 261.987, 61.242 280.521, 69.441 296.238 C 70.778 298.802, 70.650 299.338, 67.435 304.678 C 35.854 357.124, 74.629 426.760, 135.597 427.090 C 198.888 427.433, 238.321 363.036, 208.997 307.223 C 204.629 298.909, 204.233 297.631, 205.180 294.913 C 211.002 278.213, 192.505 262.252, 176.379 270.058 C 172.476 271.948, 171.888 271.994, 169.218 270.613 C 165.992 268.945, 151.651 265, 148.812 265 C 147.266 265, 147 264.127, 147 259.048 L 147 253.095 153.250 252.798 L 159.500 252.500 159.793 244.086 C 160.146 233.961, 125.318 227.534, 116.189 236.039 M 121 243.500 L 121 246 137 246 L 153 246 153 243.500 L 153 241 137 241 L 121 241 121 243.500 M 134 258.500 C 134 263.944, 134.030 264, 137 264 C 139.970 264, 140 263.944, 140 258.500 C 140 253.056, 139.970 253, 137 253 C 134.030 253, 134 253.056, 134 258.500 M 119.241 273.956 C 63.051 289.112, 44.550 357.515, 85.546 398.536 C 128.688 441.703, 202.643 416.067, 210.994 355.050 C 217.940 304.293, 168.564 260.652, 119.241 273.956 M 131 282.069 C 98.804 285.202, 73.823 312.409, 73.676 344.500 C 73.408 403.261, 142.610 431.980, 183.602 390.118 C 225.023 347.817, 190.210 276.307, 131 282.069 M 152.490 336.010 L 134.501 354.020 129.500 348.282 C 118.409 335.556, 119.504 336.449, 116.615 337.766 C 112.403 339.685, 113.435 342.203, 123.034 353.432 C 134.442 366.776, 132.031 367.490, 155.759 343.741 C 175.497 323.985, 177.283 321.683, 174.800 319.200 C 172.322 316.722, 170.035 318.444, 152.490 336.010"
        stroke="none" 
        fill={primaryColor} 
        fillRule="evenodd"
      />
    </svg>
  );
};


