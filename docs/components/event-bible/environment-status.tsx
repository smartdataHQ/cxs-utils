/**
 * Environment Status Component
 * Shows the current Airtable configuration status
 */

'use client';

import React, { useState, useEffect } from 'react';
import { getAirtableConfigStatus } from '@/lib/airtable-service';

export function EnvironmentStatus() {
  const [configStatus, setConfigStatus] = useState<any>(null);

  useEffect(() => {
    try {
      const status = getAirtableConfigStatus();
      setConfigStatus(status);
    } catch (error) {
      console.error('Failed to get config status:', error);
    }
  }, []);

  if (!configStatus) {
    return <div className="text-sm text-muted-foreground">Loading configuration status...</div>;
  }

  return (
    <div className="space-y-1 text-sm">
      <div>Environment: {configStatus.environment}</div>
      <div>API Key: {configStatus.hasApiKey ? '✅ Configured' : '❌ Missing'}</div>
      <div>Base ID: {configStatus.hasBaseId ? '✅ Configured' : '❌ Missing'}</div>
      <div>Events Table: {configStatus.hasEventsTableId ? '✅ Configured' : '❌ Missing'}</div>
      <div>Aliases Table: {configStatus.hasAliasesTableId ? '✅ Configured' : '❌ Missing'}</div>
    </div>
  );
}