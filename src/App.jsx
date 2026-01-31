import {Canvas} from "@react-three/fiber";
import Particles from "./scene/Particles.jsx";
import './index.css'
function App() {

  return (
    <div style={{width:'100vw', height:'100vh',background:'black'}}>
        <Canvas camera={{position:[0,0,10],fov:50}}>
            <Particles/>
        </Canvas>
    </div>
  )
}

export default App
