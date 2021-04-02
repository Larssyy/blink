import { useMemo } from 'react'
import { Admin, Resource, EditGuesser, Layout, AppBar } from 'react-admin'
import { createBrowserHistory } from 'history'

import { createMuiTheme } from '@material-ui/core/styles'
import useMediaQuery from '@material-ui/core/useMediaQuery'
import LinkIcon from '@material-ui/icons/Link'

import Loginpage from './pages/login-page'
import Shortener from './components/shortener'
import authProvider from './providers/auth'
import dataProvider from './providers/data'
import * as link from './resources/link'

import './App.css'

const CustomAppBar = props => {
  return (
    <AppBar {...props}>
      <span style={{ flex: 1 }} />
      <Shortener />
    </AppBar>
  )
}
const CustomLayout = props => <Layout {...props} appBar={CustomAppBar} />

// browser history (rendering on / instead of /#/)
const history = createBrowserHistory({ basename: '/app' })

export default function App() {
  // theme that changes to dark mode according to system settings
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const theme = useMemo(
    () =>
      createMuiTheme({
        palette: {
          type: prefersDarkMode ? 'dark' : 'light'
        }
      }),
    [prefersDarkMode]
  )

  return (
    <Admin
      title="Lynx Admin"
      loginPage={Loginpage}
      authProvider={authProvider}
      dataProvider={dataProvider}
      theme={theme}
      history={history}
      layout={CustomLayout}
    >
      <Resource
        name="links"
        options={{ label: 'Links' }}
        icon={LinkIcon}
        list={link.List}
        show={link.Show}
        edit={EditGuesser}
      ></Resource>
    </Admin>
  )
}
