import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Layout } from '@/components/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { ProjectWizard } from '@/pages/ProjectWizard'
import { Toolkit } from '@/pages/Toolkit'
import { ToolkitModule } from '@/pages/ToolkitModule'
import { Settings } from '@/pages/Settings'

const queryClient = new QueryClient()
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter basename={basename}>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/project/:id" element={<ProjectWizard />} />
            <Route path="/toolkit" element={<Toolkit />} />
            <Route path="/toolkit/:module" element={<ToolkitModule />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
