"use client"

import dynamic from 'next/dynamic'

// Dynamically import the actual terminal component to prevent SSR issues
const TerminalComponent = dynamic(() => import('./TerminalComponent'), { 
  ssr: false,
  loading: () => <div>Loading terminal...</div>
})

export default function Terminal() {
  return <TerminalComponent />
}