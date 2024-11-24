import Login from './auth/login';
import Signup from './auth/Signup';
import Dashboard from './dashboard/dashboard';
import FishCatchMap from './FishCatchMap';
import './App.css';

function App() {
  return (
    <>

    {/* Have to work on the logic on how to print all components  */}
       <Login />
       <Signup />
       <Dashboard/>
       <FishCatchMap/>
    </>
  )
}

export default App ;
