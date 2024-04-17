import {ConnectButton} from '@rainbow-me/rainbowkit';
import Logo from '../public/spaceId.svg'
import './App.css'
import {Link, Outlet} from "react-router-dom";

function App() {
    return (
        <>
            <header className='flex p-4 items-center justify-between sticky top-0 shadow-xl'>
                <Link to='/'>
                    <img src={Logo} className='logo' alt="SPACE ID logo"/>
                </Link>
                <ConnectButton/>
            </header>
            <main className='mt-10 flex flex-col items-center justify-start gap-2'>
                <Outlet/>
            </main>
        </>
    )
}

export default App
