'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Mail, Phone, Download, Send, Settings, Bell, Clock, User, MessageCircle } from 'lucide-react';
import WhatsAppSetup from '@/components/WhatsAppSetup';

interface ReportSettings {
  emailReportsEnabled: boolean;
  emailReportsFrequency: 'daily' | 'weekly' | 'monthly';
  phoneNumber: string;
  smsReportsEnabled: boolean;
  smsReportsFrequency: 'daily' | 'weekly' | 'monthly';
  whatsappReportsEnabled: boolean;
  whatsappReportsFrequency: 'daily' | 'weekly' | 'monthly';
}

export default function ReportsSettingsPage() {
  const { data: session } = useSession();
  const [settings, setSettings] = useState<ReportSettings>({
    emailReportsEnabled: false,
    emailReportsFrequency: 'weekly',
    phoneNumber: '',
    smsReportsEnabled: false,
    smsReportsFrequency: 'weekly',
    whatsappReportsEnabled: false,
    whatsappReportsFrequency: 'weekly'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [sendingSMS, setSendingSMS] = useState(false);
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);
  const [message, setMessage] = useState('');
  const [whatsappReady, setWhatsappReady] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/reports/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage('Error loading settings');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<ReportSettings>) => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/reports/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        setSettings(prev => ({ ...prev, ...newSettings }));
        setMessage('Settings updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error updating settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      setMessage('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const sendInstantEmailReport = async () => {
    setSendingEmail(true);
    setMessage('');

    try {
      const response = await fetch('/api/reports/instant', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('📧 Email report sent successfully! Check your inbox.');
      } else {
        setMessage(data.error || 'Error sending email report');
      }
    } catch (error) {
      console.error('Error sending email report:', error);
      setMessage('Error sending email report');
    } finally {
      setSendingEmail(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const sendInstantSMSReport = async () => {
    setSendingSMS(true);
    setMessage('');

    try {
      const response = await fetch('/api/reports/sms', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('📱 SMS report sent successfully! Check your phone.');
      } else {
        setMessage(data.error || 'Error sending SMS report');
      }
    } catch (error) {
      console.error('Error sending SMS report:', error);
      setMessage('Error sending SMS report');
    } finally {
      setSendingSMS(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const sendInstantWhatsAppReport = async () => {
    setSendingWhatsApp(true);
    setMessage('');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'}/api/whatsapp/send-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('💚 WhatsApp report sent successfully! Check your WhatsApp.');
      } else {
        if (data.needsQR) {
          setMessage('❌ WhatsApp not connected. Please scan the QR code in the WhatsApp section below.');
        } else {
          setMessage(data.error || 'Error sending WhatsApp report');
        }
      }
    } catch (error) {
      console.error('Error sending WhatsApp report:', error);
      setMessage('Error sending WhatsApp report');
    } finally {
      setSendingWhatsApp(false);
      setTimeout(() => setMessage(''), 5000);
    }
  };

  const handleWhatsAppStatusChange = (status: any) => {
    setWhatsappReady(status.status === 'ready');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center mb-4">
            <Settings className="h-8 w-8 text-blue-600 mr-3" />
            <h1 className="text-3xl font-bold text-gray-900">Report Settings</h1>
          </div>
          <p className="text-lg text-gray-600">
            Customize how and when you receive your productivity reports
          </p>
        </motion.div>

        {/* Message Display */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg text-center font-medium ${
              message.includes('Error') || message.includes('failed')
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-green-100 text-green-700 border border-green-200'
            }`}
          >
            {message}
          </motion.div>
        )}

        <div className="space-y-8">
          {/* Email Reports Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <Mail className="h-6 w-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Email Reports</h2>
            </div>

            {/* Email Toggle */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable Email Reports</h3>
                  <p className="text-sm text-gray-600">Receive detailed analytics via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailReportsEnabled}
                    onChange={(e) => updateSettings({ emailReportsEnabled: e.target.checked })}
                    className="sr-only peer"
                    disabled={saving}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Frequency Selection */}
              {settings.emailReportsEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Report Frequency
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => updateSettings({ emailReportsFrequency: freq })}
                        disabled={saving}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          settings.emailReportsFrequency === freq
                            ? 'bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Instant Email Report */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={sendInstantEmailReport}
                  disabled={sendingEmail || saving}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Report Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>

          {/* SMS Reports Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <Phone className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">SMS Reports</h2>
            </div>

            <div className="space-y-6">
              {/* Phone Number Input */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={settings.phoneNumber}
                  onChange={(e) => setSettings(prev => ({ ...prev, phoneNumber: e.target.value }))}
                  onBlur={(e) => updateSettings({ phoneNumber: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
                />
              </div>

              {/* SMS Toggle */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Enable SMS Reports</h3>
                  <p className="text-sm text-gray-600">Quick summaries via text message</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.smsReportsEnabled}
                    onChange={(e) => updateSettings({ smsReportsEnabled: e.target.checked })}
                    className="sr-only peer"
                    disabled={saving || !settings.phoneNumber}
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {/* SMS Frequency Selection */}
              {settings.smsReportsEnabled && settings.phoneNumber && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3"
                >
                  <h4 className="font-medium text-gray-900 flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    SMS Frequency
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                      <button
                        key={freq}
                        onClick={() => updateSettings({ smsReportsFrequency: freq })}
                        disabled={saving}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          settings.smsReportsFrequency === freq
                            ? 'bg-green-600 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {freq.charAt(0).toUpperCase() + freq.slice(1)}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Instant SMS Report */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={sendInstantSMSReport}
                  disabled={sendingSMS || saving || !settings.phoneNumber}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-teal-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-teal-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sendingSMS ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      <span>Send SMS Now</span>
                    </>
                  )}
                </button>
              </div>

              {!settings.phoneNumber && (
                <p className="text-xs text-gray-500 text-center">
                  Add a phone number to enable SMS reports
                </p>
              )}
            </div>
          </motion.div>

          {/* WhatsApp Reports Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex items-center mb-6">
              <MessageCircle className="h-6 w-6 text-green-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">WhatsApp Reports</h2>
            </div>

            <div className="space-y-6">
              {/* WhatsApp Setup Component */}
              <div className="border border-gray-200 rounded-lg p-4">
                <WhatsAppSetup onStatusChange={handleWhatsAppStatusChange} />
              </div>

              {/* WhatsApp Toggle */}
              {whatsappReady && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Enable WhatsApp Reports</h3>
                      <p className="text-sm text-gray-600">Rich reports with PDF attachments</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.whatsappReportsEnabled}
                        onChange={(e) => updateSettings({ whatsappReportsEnabled: e.target.checked })}
                        className="sr-only peer"
                        disabled={saving || !whatsappReady}
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                    </label>
                  </div>

                  {/* WhatsApp Frequency Selection */}
                  {settings.whatsappReportsEnabled && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-3"
                    >
                      <h4 className="font-medium text-gray-900 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        WhatsApp Frequency
                      </h4>
                      <div className="grid grid-cols-3 gap-2">
                        {(['daily', 'weekly', 'monthly'] as const).map((freq) => (
                          <button
                            key={freq}
                            onClick={() => updateSettings({ whatsappReportsFrequency: freq })}
                            disabled={saving}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                              settings.whatsappReportsFrequency === freq
                                ? 'bg-green-600 text-white shadow-lg'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {freq.charAt(0).toUpperCase() + freq.slice(1)}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Instant WhatsApp Report */}
                  <div className="pt-4 border-t border-gray-200">
                    <button
                      onClick={sendInstantWhatsAppReport}
                      disabled={sendingWhatsApp || saving || !whatsappReady}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {sendingWhatsApp ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <MessageCircle className="h-4 w-4" />
                          <span>Send WhatsApp Report</span>
                        </>
                      )}
                    </button>
                  </div>
                </motion.div>
              )}

              {!whatsappReady && (
                <p className="text-xs text-gray-500 text-center">
                  Connect WhatsApp above to enable report delivery
                </p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-100"
        >
          <div className="flex items-start space-x-3">
            <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-900 mb-2">About Your Reports</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Email reports include detailed PDF attachments with all your analytics</li>
                <li>• SMS reports provide quick summaries of your key metrics</li>
                <li>• WhatsApp reports deliver rich PDFs with comprehensive insights</li>
                <li>• You can always download or send reports instantly using the buttons above</li>
                <li>• All reports are personalized based on your activity and preferences</li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Navigation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </button>
        </motion.div>
      </div>
    </div>
  );
}