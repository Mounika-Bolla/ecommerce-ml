import { createBrowserRouter } from 'react-router'
import ErrorPage from './error-page'
import { HydrateFallback } from './fallback'
import Recommendations from './routes/recommendations'
import DemandDashboard from './routes/demand'
import Root from './routes/root'

export const routes = [
  {
    path: '/',
    Component: Root,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        Component: Recommendations,
        HydrateFallback: HydrateFallback,
      },
      {
        path: 'demand',
        Component: DemandDashboard,
        HydrateFallback: HydrateFallback,
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
