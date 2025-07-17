/**
 * Admin page for Event Bible cache management
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useEventBiblePriming } from '@/hooks/use-event-bible-priming';
import { EnvironmentStatus } from '@/components/event-bible/environment-status';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Database, 
  Clock, 
  Activity,
  Settings
} from 'lucide-react';

export default function EventBibleAdminPage() {
  const { 
    isLoading, 
    isReady, 
    error, 
    lastPriming, 
    eventsCount, 
    refresh, 
    reloadFromAirtable,
    getCacheStatus 
  } = useEventBiblePriming();

  const [cacheStatus, setCacheStatus] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [reloadingFromAirtable, setReloadingFromAirtable] = useState(false);
  const [debugData, setDebugData] = useState<any>(null);
  const [loadingDebug, setLoadingDebug] = useState(false);
  const [localFileInfo, setLocalFileInfo] = useState<any>(null);
  const [loadingLocalInfo, setLoadingLocalInfo] = useState(false);
  const [clearingLocalData, setClearingLocalData] = useState(false);

  // Load cache status
  useEffect(() => {
    const loadCacheStatus = () => {
      try {
        const status = getCacheStatus();
        setCacheStatus(status);
      } catch (error) {
        console.error('Failed to get cache status:', error);
      }
    };

    loadCacheStatus();
    const interval = setInterval(loadCacheStatus, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, [getCacheStatus]);

  // Load local file information
  useEffect(() => {
    const loadLocalFileInfo = async () => {
      setLoadingLocalInfo(true);
      try {
        const response = await fetch('/api/event-bible/local');
        const data = await response.json();
        setLocalFileInfo(data);
      } catch (error) {
        console.error('Failed to load local file info:', error);
      } finally {
        setLoadingLocalInfo(false);
      }
    };

    loadLocalFileInfo();
    const interval = setInterval(loadLocalFileInfo, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const refreshLocalFileInfo = async () => {
    try {
      const response = await fetch('/api/event-bible/local');
      const data = await response.json();
      setLocalFileInfo(data);
    } catch (error) {
      console.error('Failed to refresh local file info:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refresh();
      await refreshLocalFileInfo();
    } catch (error) {
      console.error('Failed to refresh:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleReloadFromAirtable = async () => {
    setReloadingFromAirtable(true);
    try {
      await reloadFromAirtable();
      await refreshLocalFileInfo();
    } catch (error) {
      console.error('Failed to reload from Airtable:', error);
    } finally {
      setReloadingFromAirtable(false);
    }
  };

  const handleDebugData = async () => {
    setLoadingDebug(true);
    try {
      const response = await fetch('/api/event-bible/debug');
      const data = await response.json();
      setDebugData(data);
    } catch (error) {
      console.error('Failed to load debug data:', error);
    } finally {
      setLoadingDebug(false);
    }
  };

  const handleClearLocalData = async () => {
    if (!confirm('Are you sure you want to clear the local Event Bible data? This will force the next request to load from Airtable.')) {
      return;
    }

    setClearingLocalData(true);
    try {
      const response = await fetch('/api/event-bible/local/clear', {
        method: 'POST',
      });
      const data = await response.json();
      
      if (data.success) {
        await refreshLocalFileInfo();
        // Refresh the cache status as well
        const status = getCacheStatus();
        setCacheStatus(status);
      } else {
        console.error('Failed to clear local data:', data.error);
      }
    } catch (error) {
      console.error('Failed to clear local data:', error);
    } finally {
      setClearingLocalData(false);
    }
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatTimestamp = (timestamp: Date | string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold">Event Bible Admin</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Monitor and manage the Event Bible cache priming system
        </p>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cache Status</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {isReady ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <Badge variant="default" className="bg-green-100 text-green-800">
                    Ready
                  </Badge>
                </>
              ) : isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
                  <Badge variant="secondary">Loading</Badge>
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <Badge variant="destructive">Error</Badge>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Events Count</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventsCount}</div>
            <p className="text-xs text-muted-foreground">
              Cached events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              {lastPriming?.timestamp ? formatTimestamp(lastPriming.timestamp) : 'Never'}
            </div>
            <p className="text-xs text-muted-foreground">
              {lastPriming?.duration ? `Took ${formatDuration(lastPriming.duration)}` : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Manage the Event Bible cache
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing || isLoading || reloadingFromAirtable}
              variant="default"
            >
              {refreshing ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Cache
            </Button>
            
            <Button 
              onClick={handleReloadFromAirtable} 
              disabled={reloadingFromAirtable || isLoading || refreshing}
              variant="secondary"
            >
              {reloadingFromAirtable ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Database className="h-4 w-4 mr-2" />
              )}
              Reload from Airtable
            </Button>
            
            <Button 
              onClick={handleDebugData} 
              disabled={loadingDebug}
              variant="outline"
            >
              {loadingDebug ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Debug Airtable Data
            </Button>
            
            <Button 
              onClick={handleClearLocalData} 
              disabled={clearingLocalData || !localFileInfo?.metadata?.exists}
              variant="destructive"
            >
              {clearingLocalData ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4 mr-2" />
              )}
              Clear Local Data
            </Button>
          </div>
          
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Data Source Information</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p><strong>Refresh Cache:</strong> Uses local JSON file if available, otherwise loads from Airtable</p>
              <p><strong>Reload from Airtable:</strong> Forces fresh data load from Airtable and updates local JSON file</p>
              <p><strong>Current Source:</strong> {lastPriming?.source ? (
                <Badge variant={lastPriming.source === 'local' ? 'secondary' : 'default'}>
                  {lastPriming.source === 'local' ? 'Local JSON File' : 'Airtable'}
                </Badge>
              ) : 'Unknown'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="mb-8" variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">Priming Error</p>
              <p className="text-sm">{error}</p>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Debug Data Display */}
      {debugData && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Airtable Debug Information</CardTitle>
            <CardDescription>
              Raw field structure from your Airtable base
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {debugData.success ? (
                <>
                  {/* Configuration Info */}
                  <div>
                    <h4 className="font-medium mb-2">Configuration Verification</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div>Base ID: <code className="bg-gray-100 px-1 rounded">{debugData.config.baseId}</code></div>
                        <div>Events Table ID: <code className="bg-gray-100 px-1 rounded">{debugData.config.eventsTableId}</code></div>
                        <div>Aliases Table ID: <code className="bg-gray-100 px-1 rounded">{debugData.config.aliasesTableId}</code></div>
                        <div>API Key: {debugData.config.hasApiKey ? '✅ Present' : '❌ Missing'}</div>
                      </div>
                      <div>
                        <div>Events Records: {debugData.debug.events.totalRecords}</div>
                        <div>Aliases Records: {debugData.debug.aliases.totalRecords}</div>
                      </div>
                    </div>
                  </div>

                  {/* Events Table Analysis */}
                  <div>
                    <h4 className="font-medium mb-2">Events Table Field Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Expected Fields:</h5>
                        <ul className="text-xs space-y-1">
                          {debugData.debug.events.expectedFields.map((field: string) => (
                            <li key={field} className={
                              debugData.debug.events.allFieldNames.includes(field) 
                                ? "text-green-600" 
                                : "text-red-600"
                            }>
                              {debugData.debug.events.allFieldNames.includes(field) ? '✅' : '❌'} {field}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Actual Fields in Events Table:</h5>
                        <ul className="text-xs space-y-1">
                          {debugData.debug.events.allFieldNames.map((field: string) => (
                            <li key={field}>{field}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Aliases Table Analysis */}
                  <div>
                    <h4 className="font-medium mb-2">Aliases Table Field Analysis</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-sm font-medium mb-1">Expected Fields:</h5>
                        <ul className="text-xs space-y-1">
                          {debugData.debug.aliases.expectedFields.map((field: string) => (
                            <li key={field} className={
                              debugData.debug.aliases.allFieldNames.includes(field) 
                                ? "text-green-600" 
                                : "text-red-600"
                            }>
                              {debugData.debug.aliases.allFieldNames.includes(field) ? '✅' : '❌'} {field}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="text-sm font-medium mb-1">Actual Fields in Aliases Table:</h5>
                        <ul className="text-xs space-y-1">
                          {debugData.debug.aliases.allFieldNames.map((field: string) => (
                            <li key={field}>{field}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                  
                  {/* Sample Records */}
                  <div>
                    <h4 className="font-medium mb-2">Sample Events Records</h4>
                    <div className="space-y-2">
                      {debugData.debug.events.sampleRecords.map((record: any, index: number) => (
                        <details key={record.id} className="border rounded p-2">
                          <summary className="cursor-pointer text-sm font-medium">
                            Events Record {index + 1} ({record.id})
                          </summary>
                          <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(record.fields, null, 2)}
                          </pre>
                        </details>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Sample Aliases Records</h4>
                    <div className="space-y-2">
                      {debugData.debug.aliases.sampleRecords.map((record: any, index: number) => (
                        <details key={record.id} className="border rounded p-2">
                          <summary className="cursor-pointer text-sm font-medium">
                            Aliases Record {index + 1} ({record.id})
                          </summary>
                          <pre className="text-xs mt-2 bg-gray-50 p-2 rounded overflow-auto">
                            {JSON.stringify(record.fields, null, 2)}
                          </pre>
                        </details>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>Failed to load debug data: {debugData.error}</p>
                      {debugData.config && (
                        <div className="text-sm">
                          <p>Configuration being used:</p>
                          <ul className="ml-4 list-disc">
                            <li>Base ID: {debugData.config.baseId || 'Missing'}</li>
                            <li>Events Table ID: {debugData.config.eventsTableId || 'Missing'}</li>
                            <li>Aliases Table ID: {debugData.config.aliasesTableId || 'Missing'}</li>
                            <li>API Key: {debugData.config.hasApiKey ? 'Present' : 'Missing'}</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Local File Status */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Local JSON File Status</CardTitle>
          <CardDescription>
            Information about the local Event Bible data file
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLocalInfo ? (
            <div className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Loading local file information...</span>
            </div>
          ) : localFileInfo?.success ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">File Information</h4>
                  <div className="space-y-1 text-sm">
                    <div>Exists: {localFileInfo.metadata.exists ? '✅' : '❌'}</div>
                    {localFileInfo.metadata.exists && (
                      <>
                        <div>Size: {Math.round((localFileInfo.metadata.size || 0) / 1024)} KB</div>
                        <div>Last Modified: {localFileInfo.metadata.lastModified ? formatTimestamp(localFileInfo.metadata.lastModified) : 'Unknown'}</div>
                        {localFileInfo.metadata.metadata && (
                          <>
                            <div>Events Count: {localFileInfo.metadata.metadata.eventsCount}</div>
                            <div>Last Updated: {formatTimestamp(localFileInfo.metadata.metadata.lastUpdated)}</div>
                            <div>Source: <Badge variant="secondary">{localFileInfo.metadata.metadata.source}</Badge></div>
                            <div>Version: {localFileInfo.metadata.metadata.version}</div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Backups ({localFileInfo.backups?.length || 0})</h4>
                  {localFileInfo.backups && localFileInfo.backups.length > 0 ? (
                    <div className="space-y-1 text-sm max-h-32 overflow-y-auto">
                      {localFileInfo.backups.slice(0, 5).map((backup: any, index: number) => (
                        <div key={backup.filename} className="flex justify-between items-center">
                          <span className="truncate">{backup.filename}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {Math.round(backup.size / 1024)} KB
                          </span>
                        </div>
                      ))}
                      {localFileInfo.backups.length > 5 && (
                        <div className="text-xs text-muted-foreground">
                          ... and {localFileInfo.backups.length - 5} more
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No backups available</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Failed to load local file information: {localFileInfo?.error || 'Unknown error'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Detailed Status */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Status</CardTitle>
          <CardDescription>
            Comprehensive cache information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Cache Statistics */}
            {cacheStatus && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Cache Statistics</h4>
                  <div className="space-y-1 text-sm">
                    <div>Size: {cacheStatus.cacheStats?.size || 0} entries</div>
                    <div>Max Size: {cacheStatus.cacheStats?.maxSize || 0}</div>
                    <div>Has All Events: {cacheStatus.hasAllEvents ? '✅' : '❌'}</div>
                    <div>Has Filter Options: {cacheStatus.hasFilterOptions ? '✅' : '❌'}</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Last Priming Result</h4>
                  {lastPriming ? (
                    <div className="space-y-1 text-sm">
                      <div>Success: {lastPriming.success ? '✅' : '❌'}</div>
                      <div>Events: {lastPriming.eventsCount}</div>
                      <div>Duration: {formatDuration(lastPriming.duration)}</div>
                      <div>Time: {formatTimestamp(lastPriming.timestamp)}</div>
                      {lastPriming.error && (
                        <div className="text-red-600">Error: {lastPriming.error}</div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No priming data available</div>
                  )}
                </div>
              </div>
            )}

            {/* Environment Info */}
            <div>
              <h4 className="font-medium mb-2">Environment Configuration</h4>
              <EnvironmentStatus />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}