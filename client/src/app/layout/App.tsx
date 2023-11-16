import { useCallback, useEffect, useState } from "react";
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { useAppDispatch } from "../store/configureStore";
import { fetchBasketAsync } from "../../features/basket/basketSlice";
import { fetchCurrentUser } from "../../features/account/accountSlice";
import { CssBaseline, Container } from "@mui/material";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Header from "./Header";
import LoadingComponent from "./LoadingComponent";

function App() {

  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  const initApp = useCallback(async () => {
    try {
      await dispatch(fetchCurrentUser());
      await dispatch(fetchBasketAsync());
    } catch (error) {
      console.log(error);
    }
  }, [dispatch])

  //#region Comments
  // [IMPORTANT]!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // I will know and see what [items] [i have] in the [basket] becuase i will have the [cookie]. Continue DownVV
  // Beacuse in the [ProductCard] i [call] the [function] [handlAddItem()] that's calling the [Function] from the [API]. Continue DownVV
  // And the [Function] from the [API] will either [get] the a [basket] with the [cookie] and his [items] wand the [prodcuts] . Continue DownVV
  // Or will create a [basket] with a new [cookie] And then [add] the [new item]
  //#endregion
  useEffect(() => {
    initApp().then(() => setLoading(false));
  }, [initApp])


  const [darkMode, setDarkMode] = useState(false);

  const paletteType = darkMode ? 'dark' : 'light';

  const theme = createTheme({
    palette: {
      mode: paletteType,
      background: {
        default: paletteType === 'light' ? '#eaeaea' : '#121212'
      }
    }
  })

  function handleThemeChange() {
    setDarkMode(!darkMode);
  }

  if (loading) {
    return <LoadingComponent message="Initialising app..." />
  }

  return (
    <ThemeProvider theme={theme}>
      <ToastContainer position="bottom-right" hideProgressBar theme="colored" />
      <CssBaseline />
      <Header darkMode={darkMode} handleThemeChange={handleThemeChange} />
      <Container>
        <Outlet />
      </Container>
    </ThemeProvider>
  );
}

export default App;
