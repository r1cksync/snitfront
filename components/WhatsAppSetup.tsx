'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface WhatsAppStatus {
  status: 'initializing' | 'qr_required' | 'ready' | 'unknown';
  qrCode?: string;
  message: string;
  clientInfo?: {
    phone?: string;
    platform?: string;
    name?: string;
  };
}

interface WhatsAppSetupProps {
  onStatusChange?: (status: WhatsAppStatus) => void;
}

export default function WhatsAppSetup({ onStatusChange }: WhatsAppSetupProps) {
  const [status, setStatus] = useState<WhatsAppStatus>({
    status: 'initializing',
    message: 'Loading...'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWhatsAppStatus();
    // Poll status every 5 seconds
    const interval = setInterval(fetchWhatsAppStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchWhatsAppStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/whatsapp/status`);
      const data = await response.json();
      setStatus(data);
      setLoading(false);
      onStatusChange?.(data);
    } catch (error) {
      console.error('Error fetching WhatsApp status:', error);
      setStatus({
        status: 'unknown',
        message: 'Failed to get WhatsApp status'
      });
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'ready':
        return 'from-green-500 to-emerald-600';
      case 'qr_required':
        return 'from-yellow-500 to-orange-600';
      case 'initializing':
        return 'from-blue-500 to-indigo-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'ready':
        return '✅';
      case 'qr_required':
        return '📱';
      case 'initializing':
        return '⏳';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
    >
      <div className="flex items-center mb-6">
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3">
          <span className="text-green-600 font-bold">W</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">WhatsApp Reports</h2>
      </div>

      {/* Status Card */}
      <div className={`bg-gradient-to-r ${getStatusColor()} rounded-lg p-4 mb-6`}>
        <div className="flex items-center">
          <span className="text-2xl mr-3">{getStatusIcon()}</span>
          <div>
            <h3 className="text-white font-semibold text-lg">
              {status.status === 'ready' ? 'Connected' : 
               status.status === 'qr_required' ? 'Setup Required' :
               status.status === 'initializing' ? 'Initializing' : 'Unknown'}
            </h3>
            <p className="text-white text-opacity-90 text-sm">{status.message}</p>
          </div>
        </div>
      </div>

      {/* QR Code Section */}
      {status.status === 'qr_required' && status.qrCode && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-6"
        >
          <h4 className="font-medium text-gray-900 mb-3">Scan QR Code with WhatsApp</h4>
          <div className="bg-gray-50 rounded-lg p-4 inline-block">
            <img 
              src={status.qrCode} 
              alt="WhatsApp QR Code"
              className="w-48 h-48 mx-auto"
            />
          </div>
          <div className="mt-4 text-sm text-gray-600 space-y-1">
            <p>📱 Open WhatsApp on your phone</p>
            <p>⚙️ Go to Settings → Linked Devices</p>
            <p>📷 Tap "Link a Device" and scan this QR code</p>
          </div>
        </motion.div>
      )}

      {/* Connected Status */}
      {status.status === 'ready' && status.clientInfo && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 rounded-lg p-4 mb-6"
        >
          <h4 className="font-medium text-green-900 mb-2">Connected Device</h4>
          <div className="text-sm text-green-700 space-y-1">
            {status.clientInfo.name && (
              <p><strong>Name:</strong> {status.clientInfo.name}</p>
            )}
            {status.clientInfo.phone && (
              <p><strong>Phone:</strong> +{status.clientInfo.phone}</p>
            )}
            {status.clientInfo.platform && (
              <p><strong>Platform:</strong> {status.clientInfo.platform}</p>
            )}
          </div>
        </motion.div>
      )}

      {/* Initializing Status */}
      {status.status === 'initializing' && (
        <div className="text-center py-6">
          <div className="animate-pulse">
            <div className="w-16 h-16 bg-blue-200 rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">Setting up WhatsApp connection...</p>
          </div>
        </div>
      )}

      {/* Error Status */}
      {status.status === 'unknown' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <span className="text-red-500 mr-2">⚠️</span>
            <div>
              <h4 className="font-medium text-red-900">Connection Issue</h4>
              <p className="text-red-700 text-sm mt-1">
                Unable to connect to WhatsApp. Please try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="text-center mt-6">
        <button
          onClick={fetchWhatsAppStatus}
          disabled={loading}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Refresh Status'}
        </button>
      </div>

      {/* Information */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">About WhatsApp Reports</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Receive detailed reports with PDF attachments on WhatsApp</li>
          <li>• More reliable than SMS in many regions</li>
          <li>• Works with any WhatsApp-enabled phone number</li>
          <li>• One-time setup with QR code scanning</li>
        </ul>
      </div>
    </motion.div>
  );
}