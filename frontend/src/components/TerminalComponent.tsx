"use client"

import { FitAddon } from '@xterm/addon-fit'
import { useEffect, useRef, useState } from 'react'
import { useXTerm } from 'react-xtermjs'
import ssh_auth from '@/types/ssh_auth'

export default function TerminalComponent({ auth }: { auth: ssh_auth }) {
  const { instance, ref } = useXTerm()
  const fitAddon = new FitAddon()
  const wsRef = useRef<WebSocket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    if (!instance) return

    // Load the fit addon
    instance.loadAddon(fitAddon)

    // Initialize WebSocket connection
    const ws = new WebSocket('ws://localhost:8000/ws/ssh')
    wsRef.current = ws

    ws.binaryType = "arraybuffer";

    ws.onopen = () => {
      setConnected(true);
      instance.writeln("Connected to terminal server");

      // 1) SEND CREDENTIALS FIRST
      ws.send(JSON.stringify({ ip: auth.ip, username: auth.username, password: auth.password }));

      // 2) Tell server our terminal size (optional but recommended)
      ws.send(JSON.stringify({ type: "resize", cols: instance.cols, rows: instance.rows }));
    };


    ws.onmessage = (event) => {
      const data = event.data;
      if (data instanceof ArrayBuffer) {
        instance.write(new Uint8Array(data));  // raw SSH output
      } else if (typeof data === "string") {
        instance.write(data);                   // status/error strings
      }
    };

    // 4) Forward keystrokes as binary bytes
    instance.onData((input) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(new TextEncoder().encode(input));
      }
    });

    // 5) Keep size in sync (so programs like vim/top draw correctly)
    const ro = new ResizeObserver(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: "resize", cols: instance.cols, rows: instance.rows }));
      }
    });
    ro.observe(instance.element!);


    ws.onclose = () => {
      setConnected(false)
      instance.writeln('Connection to terminal server lost')
    }

    ws.onerror = (error) => {
      instance.writeln('WebSocket error: ' + error)
    }


    const handleResize = () => fitAddon.fit()
    window.addEventListener('resize', handleResize)
    
    // Initial fit
    setTimeout(() => fitAddon.fit(), 100)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [instance])

  return (
    <div style={{ 
      height: '100%', 
      width: '100%',
      border: '1px solid #404040', // border color from theme
      borderRadius: '12px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
      background: '#171717' // card color from theme
    }}>
      {/* Terminal Content */}
      <div ref={ref} style={{ 
        height: '100%', 
        width: '100%',
        padding: '0 16px'
      }} />
      
      {!connected && (
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          color: '#dc2626', // destructive color from theme
          background: '#262626', // muted color from theme
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '500',
          border: '1px solid #dc2626'
        }}>
          Disconnected
        </div>
      )}
    </div>
  )
}