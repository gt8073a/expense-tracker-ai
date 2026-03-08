'use client';

import { useState } from 'react';
import { Integration, IntegrationId, saveIntegration, getIntegrations } from '@/lib/exportHistory';

interface Props {
  integrations: Integration[];
  onUpdate: (integrations: Integration[]) => void;
}

const SERVICE_META: Record<IntegrationId, {
  name: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  authLabel: string;
  features: string[];
}> = {
  google_sheets: {
    name: 'Google Sheets',
    description: 'Auto-sync your expenses to a Google Sheets spreadsheet. Each export creates a new tab with a timestamp.',
    icon: '📗',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    authLabel: 'Connect with Google',
    features: ['Auto-sync on export', 'Timestamped tabs', 'Formula-friendly format'],
  },
  dropbox: {
    name: 'Dropbox',
    description: 'Save export files directly to your Dropbox folder. Organized by year/month automatically.',
    icon: '📦',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    authLabel: 'Connect with Dropbox',
    features: ['Auto-organize by month', 'Version history', 'Shared folder support'],
  },
  onedrive: {
    name: 'OneDrive',
    description: 'Store exports in Microsoft OneDrive. Works seamlessly with Excel Online for instant viewing.',
    icon: '☁️',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    authLabel: 'Connect with Microsoft',
    features: ['Excel Online preview', 'SharePoint compatible', 'Teams integration'],
  },
  email: {
    name: 'Email',
    description: 'Send exports directly to any email address. Schedule recurring reports to your inbox.',
    icon: '📧',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    authLabel: 'Configure Email',
    features: ['Any email address', 'HTML & attachment options', 'Recurring delivery'],
  },
};

const FAKE_ACCOUNTS: Record<IntegrationId, string> = {
  google_sheets: 'user@gmail.com',
  dropbox: 'user@dropbox.com',
  onedrive: 'user@outlook.com',
  email: 'user@example.com',
};

export default function IntegrationsPanel({ integrations, onUpdate }: Props) {
  const [connecting, setConnecting] = useState<IntegrationId | null>(null);
  const [disconnecting, setDisconnecting] = useState<IntegrationId | null>(null);

  function getIntegration(id: IntegrationId) {
    return integrations.find((i) => i.id === id)!;
  }

  async function handleConnect(id: IntegrationId) {
    setConnecting(id);
    // Simulate OAuth flow
    await new Promise((r) => setTimeout(r, 1800));
    const updated: Integration = {
      id,
      status: 'connected',
      connectedAs: FAKE_ACCOUNTS[id],
      connectedAt: new Date().toISOString(),
    };
    saveIntegration(updated);
    onUpdate(getIntegrations());
    setConnecting(null);
  }

  async function handleDisconnect(id: IntegrationId) {
    setDisconnecting(id);
    await new Promise((r) => setTimeout(r, 600));
    const updated: Integration = { id, status: 'disconnected' };
    saveIntegration(updated);
    onUpdate(getIntegrations());
    setDisconnecting(null);
  }

  const connectedCount = integrations.filter((i) => i.status === 'connected').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
        <div>
          <p className="text-sm font-semibold text-gray-900">Connected Services</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {connectedCount === 0
              ? 'No services connected — connect one to enable cloud exports.'
              : `${connectedCount} of ${integrations.length} services connected`}
          </p>
        </div>
        <div className="flex gap-1">
          {integrations.map((i) => (
            <span
              key={i.id}
              className={`w-2.5 h-2.5 rounded-full ${i.status === 'connected' ? 'bg-green-500' : 'bg-gray-200'}`}
              title={SERVICE_META[i.id].name}
            />
          ))}
        </div>
      </div>

      {/* Integration cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {(Object.keys(SERVICE_META) as IntegrationId[]).map((id) => {
          const meta = SERVICE_META[id];
          const integration = getIntegration(id);
          const isConnected = integration.status === 'connected';
          const isConnecting = connecting === id;
          const isDisconnecting = disconnecting === id;

          return (
            <div key={id} className={`bg-white rounded-xl border-2 overflow-hidden transition-all ${isConnected ? 'border-green-200' : 'border-gray-100'}`}>
              {/* Card header */}
              <div className={`px-4 py-3 flex items-center justify-between ${isConnected ? 'bg-green-50' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{meta.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{meta.name}</p>
                    {isConnected && integration.connectedAs && (
                      <p className="text-xs text-green-600">{integration.connectedAs}</p>
                    )}
                  </div>
                </div>
                <StatusBadge status={integration.status} />
              </div>

              {/* Card body */}
              <div className="px-4 py-3">
                <p className="text-xs text-gray-500 mb-3 leading-relaxed">{meta.description}</p>
                <ul className="space-y-1 mb-4">
                  {meta.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                      <svg className="w-3 h-3 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>

                {isConnected ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-1.5 px-3 py-1.5 bg-green-50 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      <span className="text-xs text-green-700 font-medium">Active</span>
                      {integration.connectedAt && (
                        <span className="text-xs text-green-500 ml-auto">
                          {new Date(integration.connectedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleDisconnect(id)}
                      disabled={isDisconnecting}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                    >
                      {isDisconnecting ? 'Removing...' : 'Disconnect'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleConnect(id)}
                    disabled={isConnecting}
                    className="w-full py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                  >
                    {isConnecting ? (
                      <>
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      <>
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        {meta.authLabel}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-400 text-center">
        Connections are simulated for this demo. In production, these would use OAuth 2.0.
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: Integration['status'] }) {
  if (status === 'connected') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Connected
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Not connected
    </span>
  );
}
