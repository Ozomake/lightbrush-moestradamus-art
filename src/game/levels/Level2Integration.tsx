import React from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Level2ParkingLot from './Level2ParkingLot'

// Test integration component for Level 2
const Level2Integration = () => {
  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas
        shadows
        camera={{ position: [0, 8, 20], fov: 60 }}
        gl={{
          antialias: true,
          alpha: false,
          powerPreference: "high-performance"
        }}
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
          gl.physicallyCorrectLights = true
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <Level2ParkingLot />
      </Canvas>

      {/* Level 2 HUD Overlay */}
      <div className="absolute top-4 left-4 z-10">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white">
          <h2 className="text-xl font-bold mb-2 text-cyan-400">
            Level 2: Renegade Parking Lot
          </h2>
          <p className="text-sm text-gray-300 mb-4">
            Master the art of guerrilla projection mapping in this urban stealth challenge.
          </p>

          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span>Setup your projector in strategic locations</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              <span>Avoid security guard patrols and detection</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
              <span>Create viral projections for social media</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Build your street art reputation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Guide */}
      <div className="absolute bottom-4 right-4 z-10">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-4 text-white max-w-sm">
          <h3 className="font-semibold mb-2 text-cyan-400">Controls</h3>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Camera:</span>
              <span>Mouse + Drag</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Zoom:</span>
              <span>Mouse Wheel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Setup Projector:</span>
              <span>Equipment Panel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Photo Mode:</span>
              <span>Equipment Panel</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Select Pattern:</span>
              <span>Pattern Selector</span>
            </div>
          </div>
        </div>
      </div>

      {/* Achievement Progress Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="bg-black/80 backdrop-blur-sm rounded-lg p-3 text-white">
          <h4 className="font-semibold mb-2 text-yellow-400 text-sm">Achievements</h4>
          <div className="space-y-1 text-xs">
            {LEVEL2_ACHIEVEMENTS.map((achievement, index) => (
              <div key={achievement.id} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                <span className="text-gray-400 truncate">{achievement.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Development Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 left-4 z-10">
          <div className="bg-red-900/80 backdrop-blur-sm rounded-lg p-3 text-white text-xs">
            <h4 className="font-semibold mb-1 text-red-400">Debug Info</h4>
            <div>Level 2: Urban Guerrilla Projections</div>
            <div>Status: Integration Test</div>
            <div>Components: All systems loaded</div>
          </div>
        </div>
      )}
    </div>
  )
}

// Achievement definitions (moved here for the integration)
const LEVEL2_ACHIEVEMENTS = [
  { id: 'street-artist', name: 'Street Artist', description: 'Complete your first guerrilla projection' },
  { id: 'stealth-master', name: 'Stealth Master', description: 'Complete 5 projections without being detected' },
  { id: 'viral-moment', name: 'Viral Moment', description: 'Get 1000+ views on a social media post' },
  { id: 'lightbomb-specialist', name: 'Lightbomb Specialist', description: 'Create a spectacular multi-surface projection' },
  { id: 'shadow-walker', name: 'Shadow Walker', description: 'Hide in shadows for 60 cumulative seconds' },
  { id: 'time-pressure-pro', name: 'Time Pressure Pro', description: 'Complete a projection with less than 10 seconds to spare' }
]

export default Level2Integration