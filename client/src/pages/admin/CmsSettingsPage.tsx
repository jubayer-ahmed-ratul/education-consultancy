import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronRight, RefreshCw, Save } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Textarea } from '../../components/ui/textarea';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api-client';
import { queryKeys } from '../../lib/query-keys';

const SINGLETON_TABS = [
  { key: 'hero-content', label: 'Hero Banner' },
  { key: 'hero-stats', label: 'Hero Stats' },
  { key: 'about', label: 'Homepage About' },
  { key: 'about-page', label: 'About Page' },
  { key: 'contact-page', label: 'Contact & Map' },
  { key: 'footer', label: 'Footer' },
  { key: 'whatsapp', label: 'WhatsApp' },
  { key: 'success-stories-page', label: 'Stories Page' },
  { key: 'gallery/settings', label: 'Gallery Header' },
] as const;

type SingletonKey = (typeof SINGLETON_TABS)[number]['key'];

export default function CmsSettingsPage() {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<SingletonKey>('hero-content');
  const [jsonText, setJsonText] = useState('{}');
  const [originalText, setOriginalText] = useState('{}');

  const { data, isLoading } = useQuery({
    queryKey: queryKeys.cms.section(`singleton:${activeTab}`),
    queryFn: () => apiRequest<unknown>(`/admin/content/${activeTab}`),
  });

  useEffect(() => {
    if (data?.data !== undefined) {
      const formatted =
        activeTab === 'hero-stats' && Array.isArray(data.data)
          ? JSON.stringify({ stats: data.data }, null, 2)
          : JSON.stringify(data.data ?? {}, null, 2);
      setJsonText(formatted);
      setOriginalText(formatted);
    }
  }, [data, activeTab]);

  const isDirty = jsonText !== originalText;

  const saveMutation = useMutation({
    mutationFn: (payload: unknown) =>
      apiRequest(`/admin/content/${activeTab}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      setOriginalText(jsonText);
      addToast('success', `Saved ${activeTab} settings.`);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cms.section(`singleton:${activeTab}`) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.cms.publicBundle });
    },
    onError: (err) => addToast('error', err instanceof Error ? err.message : 'Save failed.'),
  });

  const revalidateMutation = useMutation({
    mutationFn: () => apiRequest('/revalidate-all', { method: 'POST' }),
    onSuccess: () => {
      addToast('success', 'Global cache purged.');
      void queryClient.invalidateQueries();
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    try {
      const parsed = JSON.parse(jsonText) as Record<string, unknown>;
      delete parsed.id;
      delete parsed.key;
      delete parsed.singletonKey;
      delete parsed.updatedAt;
      saveMutation.mutate(parsed);
    } catch {
      addToast('error', 'Invalid JSON syntax. Please check your formatting.');
    }
  }

  return (
    <div className="space-y-5">
      <Helmet>
        <title>Page Content & Settings â€” StudySphere Admin</title>
      </Helmet>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span>Settings</span>
            <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
            <span className="text-gray-900">CMS Singletons</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Page Content & Settings</h1>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => revalidateMutation.mutate()}
          disabled={revalidateMutation.isPending}
        >
          <RefreshCw className="h-3.5 w-3.5 text-teal-600" />
          {revalidateMutation.isPending ? 'Purging...' : 'Purge All Cache'}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as SingletonKey)}>
        <TabsList>
          {SINGLETON_TABS.map((tab) => (
            <TabsTrigger key={tab.key} value={tab.key}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle className="capitalize">{activeTab.replace(/[-/]/g, ' ')}</CardTitle>
                <CardDescription>
                  Endpoint: <code>PUT /api/admin/content/{activeTab}</code>
                </CardDescription>
              </div>
              {isDirty && <Badge variant="amber">Unsaved Changes</Badge>}
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-sm text-gray-500">Loading configuration...</div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    rows={18}
                    value={jsonText}
                    onChange={(e) => setJsonText(e.target.value)}
                    className="bg-gray-50 font-mono text-xs"
                  />
                  <div className="flex justify-end gap-2">
                    {isDirty && (
                      <Button type="button" variant="secondary" onClick={() => setJsonText(originalText)}>
                        Discard
                      </Button>
                    )}
                    <Button type="submit" disabled={saveMutation.isPending}>
                      <Save className="h-3.5 w-3.5" />
                      {saveMutation.isPending ? 'Saving...' : 'Save changes'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
