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

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (ws.readyState === WebSocket.OPEN) {
        ws.close()
      }
    }
  }, [instance])

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <div ref={ref} style={{ height: '100%', width: '100%' }} />
      {!connected && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          color: 'red',
          background: 'rgba(0,0,0,0.8)',
          padding: '5px'
        }}>
          Disconnected
        </div>
      )}
    </div>
  )
}