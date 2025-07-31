// components/DoubleTick.js
import React from 'react';

const DoubleTick = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"  // ✅ allow stroke to be overridden by CSS
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M1 14l5 5L20 5" />
    <path d="M10 14l5 5L23 7" />
  </svg>
);

export default DoubleTick;
