import {Canvas} from "@react-three/fiber";
import Particles from "./scene/Particles.jsx";
import './index.css'
function App() {

  return (
      <div style={{ width: '100vw', height: '100vh', position: 'relative', zIndex: 1 }}>

          <Canvas
              camera={{ position: [0, 0, 50], fov: 75 }}
              gl={{ alpha: true }}
          >
              <Particles />
          </Canvas>

      </div>
  )
}

export default App
