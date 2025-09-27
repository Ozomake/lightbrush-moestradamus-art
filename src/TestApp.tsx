import { Canvas } from '@react-three/fiber'
import { Box, Sphere } from '@react-three/drei'

function SimpleScene() {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Box position={[-1.2, 0, 0]} args={[1, 1, 1]}>
        <meshStandardMaterial color={'orange'} />
      </Box>
      <Sphere position={[1.2, 0, 0]} args={[1, 32, 32]}>
        <meshStandardMaterial color={'hotpink'} />
      </Sphere>
    </>
  )
}

function TestApp() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <h1 style={{ position: 'absolute', top: '10px', left: '10px', color: 'white', zIndex: 1000 }}>
        Test App - 3D Scene
      </h1>
      <Canvas>
        <SimpleScene />
      </Canvas>
    </div>
  )
}

export default TestApp