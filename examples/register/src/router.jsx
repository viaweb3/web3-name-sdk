import {createBrowserRouter} from "react-router-dom";
import App from "./App";
import Home from "./home.jsx";
// import Register from "./Register.jsx";
// import RegisterV3 from './RegisterV3.jsx'

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                path: "/",
                element: <Home/>
            },
            // {
            //     path: "/register",
            //     element: <Register/>
            // },
            // {
            //     path: "/registerv3",
            //     element: <RegisterV3/>
            // }
        ]
    }
])

export default router
