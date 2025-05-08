import React from 'react';
import  HomePage from '../components/Hero';
import { Features } from '../components/Features';
import { Pricing } from '../components/Pricing';
import { Testimonials } from '../components/Testimonials';
export function Home() {
  return <div className="bg-white w-full">
      <HomePage />
      <Features />
      <Testimonials />
      <Pricing />
    </div>;
}