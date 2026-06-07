import { useEffect, useState } from 'react'
import { useProjectStore } from '@/stores/projectStore'
import { setApiBaseUrl } from '@/services/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

export function Settings() {
  const { settings, loadSettings, saveSettings } = useProjectStore()
  const [apiUrl, setApiUrl] = useState('')
  const [scopusKey, setScopusKey] = useState('')
  const [wosKey, setWosKey] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    setApiUrl(settings.apiBaseUrl)
    setScopusKey(sessionStorage.getItem('srw-scopus-key') || '')
    setWosKey(sessionStorage.getItem('srw-wos-key') || '')
  }, [settings])

  const handleSave = async () => {
    await saveSettings({ ...settings, apiBaseUrl: apiUrl, scopusApiKey: scopusKey, wosApiKey: wosKey })
    setApiBaseUrl(apiUrl)
    if (scopusKey) sessionStorage.setItem('srw-scopus-key', scopusKey)
    else sessionStorage.removeItem('srw-scopus-key')
    if (wosKey) sessionStorage.setItem('srw-wos-key', wosKey)
    else sessionStorage.removeItem('srw-wos-key')
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure API connection and optional database keys.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Point to your Vercel serverless API deployment. Gemini keys are stored server-side on Vercel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Vercel API Base URL</Label>
            <Input
              className="mt-1"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="https://your-app.vercel.app"
            />
          </div>
          <div>
            <Label>Scopus API Key (optional, session only)</Label>
            <Input
              className="mt-1"
              type="password"
              value={scopusKey}
              onChange={(e) => setScopusKey(e.target.value)}
              placeholder="Elsevier API key"
            />
          </div>
          <div>
            <Label>Web of Science API Key (optional, session only)</Label>
            <Input
              className="mt-1"
              type="password"
              value={wosKey}
              onChange={(e) => setWosKey(e.target.value)}
              placeholder="Clarivate API key"
            />
          </div>
          <Button onClick={handleSave}>
            {saved && <Check className="h-4 w-4" />}
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
