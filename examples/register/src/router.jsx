import {createBrowserRouter} from "react-router-dom";
import App from "./App";
import Home from "./home.jsx";
import Register from "./Register.jsx";

const router = createBrowserRouter([
    {
        path: "/",
        element: <App/>,
        children: [
            {
                path: "/",
                element: <Home/>
            },
            {
                path: "/register",
                element: <Register/>
            }
        ]
    }
])

export default router
