/**
 * ════════════════════════════════════════════════════════════════
 * ANIMAÇÃO 01: Conecte em 5 Minutos
 * Conceito: QR Code 3D + Celular fazendo scan
 * ════════════════════════════════════════════════════════════════
 */

import { motion } from 'framer-motion'
import { MessageCircle, Smartphone, Check, Wifi } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function ConnectAnimation() {
  const [countdown, setCountdown] = useState(5)
  const [isScanning, setIsScanning] = useState(false)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 5))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const scanTimer = setTimeout(() => {
      setIsScanning(true)
      setTimeout(() => {
        setIsConnected(true)
        setTimeout(() => {
          setIsConnected(false)
          setIsScanning(false)
        }, 2000)
      }, 1500)
    }, 2000)

    return () => clearTimeout(scanTimer)
  }, [isConnected])

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {/* QR Code 3D */}
      <motion.div
        className="relative"
        initial={{ scale: 0, rotateY: -180 }}
        animate={{
          scale: 1,
          rotateY: 0
        }}
        transition={{
          duration: 1,
          type: 'spring',
          bounce: 0.4
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* QR Code Base */}
        <motion.div
          className="relative w-48 h-48 bg-white rounded-3xl shadow-2xl p-4"
          animate={{
            boxShadow: isScanning
              ? [
                  '0 0 40px rgba(16, 185, 129, 0.6)',
                  '0 0 80px rgba(16, 185, 129, 1)',
                  '0 0 40px rgba(16, 185, 129, 0.6)'
                ]
              : '0 20px 60px rgba(0, 0, 0, 0.3)',
            scale: isScanning ? [1, 1.05, 1] : 1
          }}
          transition={{
            boxShadow: { duration: 1, repeat: isScanning ? Infinity : 0 },
            scale: { duration: 0.5 }
          }}
        >
          {/* QR Code Pattern */}
          <div className="w-full h-full bg-black rounded-xl grid grid-cols-8 grid-rows-8 gap-[2px] p-2">
            {[...Array(64)].map((_, i) => (
              <motion.div
                key={i}
                className={`rounded-sm ${
                  Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
              />
            ))}

            {/* Logo WhatsApp no centro */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          {/* Scan Line Effect */}
          {isScanning && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent"
              animate={{
                top: ['0%', '100%', '0%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear'
              }}
            />
          )}

          {/* Success Check */}
          {isConnected && (
            <motion.div
              className="absolute inset-0 bg-green-500/90 rounded-3xl flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-24 h-24 text-white" strokeWidth={3} />
            </motion.div>
          )}
        </motion.div>

        {/* Corner Markers */}
        {[
          { top: '-8px', left: '-8px' },
          { top: '-8px', right: '-8px' },
          { bottom: '-8px', left: '-8px' },
          { bottom: '-8px', right: '-8px' }
        ].map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-8 h-8 border-4 border-green-500 rounded-md"
            style={{
              ...pos,
              borderRightColor: pos.right ? 'rgb(34, 197, 94)' : 'transparent',
              borderBottomColor: pos.bottom ? 'rgb(34, 197, 94)' : 'transparent',
              borderLeftColor: pos.left ? 'rgb(34, 197, 94)' : 'transparent',
              borderTopColor: pos.top ? 'rgb(34, 197, 94)' : 'transparent'
            }}
            animate={{
              opacity: isScanning ? [0.5, 1, 0.5] : 1
            }}
            transition={{
              duration: 1,
              repeat: isScanning ? Infinity : 0
            }}
          />
        ))}
      </motion.div>

      {/* Celular 3D fazendo Scan */}
      <motion.div
        className="absolute"
        initial={{ x: -200, y: -100, opacity: 0 }}
        animate={{
          x: isScanning ? 50 : -200,
          y: isScanning ? -80 : -100,
          opacity: isScanning ? 1 : 0,
          rotateY: isScanning ? 0 : -45,
          rotateX: isScanning ? 5 : 0
        }}
        transition={{
          duration: 1,
          type: 'spring',
          stiffness: 100
        }}
        style={{
          transformStyle: 'preserve-3d',
          perspective: '1000px'
        }}
      >
        {/* Smartphone 3D */}
        <div className="relative w-32 h-64 bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 rounded-3xl shadow-2xl border-4 border-gray-600 p-2">
          {/* Screen */}
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-black rounded-2xl overflow-hidden relative">
            {/* Status Bar */}
            <div className="h-6 bg-black/50 flex items-center justify-between px-2">
              <Wifi className="w-3 h-3 text-white" />
              <div className="text-[8px] text-white font-bold">12:30</div>
            </div>

            {/* Camera View - Mostrando QR Code como se estivesse filmando */}
            <div className="absolute inset-2 rounded-xl overflow-hidden bg-black/80">
              {/* QR Code sendo filmado pela câmera */}
              {isScanning && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 1.5, opacity: 0.5 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  {/* Mini QR Code na tela (visão da câmera) */}
                  <div className="relative w-20 h-20 bg-white rounded-lg p-1">
                    <div className="w-full h-full bg-black rounded grid grid-cols-4 grid-rows-4 gap-[1px]">
                      {[...Array(16)].map((_, i) => (
                        <div
                          key={i}
                          className={`rounded-sm ${
                            Math.random() > 0.5 ? 'bg-black' : 'bg-white'
                          }`}
                        />
                      ))}
                    </div>
                    {/* Logo WhatsApp */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded flex items-center justify-center">
                      <MessageCircle className="w-4 h-4 text-green-600" />
                    </div>
                  </div>

                  {/* Scanner Frame Corners */}
                  <div className="absolute inset-4 pointer-events-none">
                    {/* Top-left */}
                    <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-green-400" />
                    {/* Top-right */}
                    <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-green-400" />
                    {/* Bottom-left */}
                    <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-green-400" />
                    {/* Bottom-right */}
                    <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-green-400" />

                    {/* Scan Line */}
                    <motion.div
                      className="absolute left-0 right-0 h-0.5 bg-green-400 shadow-lg shadow-green-400/50"
                      animate={{
                        top: ['0%', '100%', '0%']
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'linear'
                      }}
                    />
                  </div>
                </motion.div>
              )}

              {/* Success Message */}
              {isConnected && (
                <motion.div
                  className="absolute inset-0 bg-green-500 rounded-lg flex flex-col items-center justify-center gap-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                >
                  <Check className="w-8 h-8 text-white" />
                  <div className="text-[10px] text-white font-bold">Conectado!</div>
                </motion.div>
              )}

              {/* Camera UI Elements */}
              {isScanning && (
                <>
                  {/* Top bar with camera icon */}
                  <div className="absolute top-1 left-1 right-1 flex items-center justify-between px-2 py-1">
                    <div className="text-[8px] text-green-400 font-bold">Escaneando...</div>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  </div>

                  {/* Bottom hint */}
                  <div className="absolute bottom-1 left-1 right-1 text-center">
                    <div className="text-[8px] text-white/80 bg-black/40 rounded px-2 py-0.5">
                      Aponte para o QR Code
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Home Button */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white/30 rounded-full" />
          </div>

          {/* Volume Buttons */}
          <div className="absolute -left-1 top-20 w-1 h-8 bg-gray-600 rounded-l-md" />
          <div className="absolute -left-1 top-32 w-1 h-12 bg-gray-600 rounded-l-md" />

          {/* Power Button */}
          <div className="absolute -right-1 top-24 w-1 h-12 bg-gray-600 rounded-r-md" />
        </div>

        {/* Glow Effect */}
        {isScanning && (
          <motion.div
            className="absolute inset-0 bg-green-400/20 rounded-3xl blur-xl"
            animate={{
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{
              duration: 1,
              repeat: Infinity
            }}
          />
        )}
      </motion.div>

      {/* Connection Particles */}
      {isScanning && (
        <>
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-green-400"
              style={{
                left: '30%',
                top: '40%'
              }}
              animate={{
                x: [0, 100],
                y: [0, -20 + i * 8],
                opacity: [0, 1, 0],
                scale: [0, 1.5, 0]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeOut'
              }}
            />
          ))}
        </>
      )}

      {/* Relógio Countdown */}
      <motion.div
        className="absolute bottom-0 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-xl border-2 border-green-500/50 rounded-2xl px-6 py-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-400 font-light">Tempo de setup:</div>
          <motion.div
            className="text-3xl font-black bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent"
            key={countdown}
            initial={{ scale: 1.5 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, type: 'spring' }}
          >
            {countdown}:00
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}
