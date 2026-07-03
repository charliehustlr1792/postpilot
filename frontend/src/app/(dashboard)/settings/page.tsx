// app/(dashboard)/settings/page.tsx
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { User, Bell, CreditCard, Users, Smartphone, Shield, Trash2, Plus, Loader2 } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';
import { PLATFORM_COLORS} from '@/lib/constants';
import { Platform } from '@/types/post';
import { PlatformIcon } from '@/components/ui/PlatformIcon';

const SettingsPage = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(true);

  // Profile form state.
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  // Seed the form once Clerk has loaded the user.
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? '');
      setLastName(user.lastName ?? '');
    }
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      setSavingProfile(true);
      // Update Clerk (the source of truth for names). Clerk then fires a
      // user.updated webhook that syncs the change into our DB, so there is a
      // single writer and the DB can't be reverted by a later Clerk event.
      await user.update({ firstName: firstName.trim(), lastName: lastName.trim() });
      toast.success('Profile saved');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Avatar also goes through Clerk (source of truth); the webhook syncs the new
  // image URL into our DB, mirroring the name-save flow.
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!user || !file) return;
    try {
      setAvatarBusy(true);
      await user.setProfileImage({ file });
      toast.success('Profile picture updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update picture');
    } finally {
      setAvatarBusy(false);
    }
  };

  const handleAvatarRemove = async () => {
    if (!user || !user.hasImage) return;
    try {
      setAvatarBusy(true);
      await user.setProfileImage({ file: null });
      toast.success('Profile picture removed');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove picture');
    } finally {
      setAvatarBusy(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'accounts', label: 'Connected Accounts', icon: Smartphone },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  // Mock connected accounts — replace with real data in Sprint 2.
  const connectedAccounts = [
    { platform: 'TWITTER',   username: '@johndoe',  connected: true,  posts: 45 },
    { platform: 'INSTAGRAM', username: 'johndoe',   connected: true,  posts: 32 },
    { platform: 'LINKEDIN',  username: 'John Doe',  connected: true,  posts: 28 },
    { platform: 'FACEBOOK',  username: 'John Doe',  connected: false, posts: 0  },
  ] as const;

  // Mock team members - replace with real data
  const teamMembers = [
    { id: '1', name: 'Sarah Chen', email: 'sarah@company.com', role: 'Admin', avatar: 'SC' },
    { id: '2', name: 'Mike Johnson', email: 'mike@company.com', role: 'Editor', avatar: 'MJ' },
    { id: '3', name: 'Emma Davis', email: 'emma@company.com', role: 'Viewer', avatar: 'ED' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181817] mb-2">Profile Information</h2>
              <p className="text-[#4D4946] text-sm">Update your personal information and preferences</p>
            </div>

            {/* Avatar Section */}
            <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF9B4F] to-[#FF6E00] flex items-center justify-center text-white text-2xl font-bold overflow-hidden shrink-0">
                  {user?.hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={user.imageUrl} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <>{user?.firstName?.[0]}{user?.lastName?.[0]}</>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-[#181817] font-semibold mb-1">Profile Picture</h3>
                  <p className="text-[#4D4946] text-sm mb-3">JPG, PNG. Max size 5MB</p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={avatarBusy}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-medium rounded-lg text-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {avatarBusy && <Loader2 className="w-4 h-4 animate-spin" />}
                      Upload New
                    </button>
                    <button
                      onClick={handleAvatarRemove}
                      disabled={avatarBusy || !user?.hasImage}
                      className="px-4 py-2 text-[#4D4946] font-medium hover:bg-[#F3EFEC] rounded-lg text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Remove
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
              <h3 className="text-[#181817] font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#4D4946] text-sm font-medium mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-[#EAE7E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B4F] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[#4D4946] text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-[#EAE7E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B4F] focus:border-transparent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[#4D4946] text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={user?.primaryEmailAddress?.emailAddress || ''}
                    disabled
                    className="w-full px-4 py-2 border border-[#EAE7E4] rounded-lg bg-[#F3EFEC]/50 text-[#4D4946] cursor-not-allowed focus:outline-none"
                  />
                  <p className="text-[#4D4946]/60 text-xs mt-1.5">Email is managed through your sign-in provider</p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={handleSaveProfile}
                  disabled={savingProfile}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
                  {savingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        );

      case 'accounts':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181817] mb-2">Connected Accounts</h2>
              <p className="text-[#4D4946] text-sm">Manage your social media connections</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {connectedAccounts.map((account) => (
                <div key={account.platform} className="bg-white rounded-xl border border-[#EAE7E4] p-6 hover:border-[#FF9B4F] transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                        style={{ backgroundColor: PLATFORM_COLORS[account.platform as keyof typeof PLATFORM_COLORS] }}
                      >
                        <PlatformIcon platform={account.platform as Platform} className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-[#181817] font-semibold capitalize">{account.platform}</h3>
                        {account.connected && (
                          <p className="text-[#4D4946] text-sm">{account.username}</p>
                        )}
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${account.connected ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>

                  {account.connected ? (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[#4D4946] text-sm">Posts Published</span>
                        <span className="text-[#181817] font-semibold">{account.posts}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 text-[#4D4946] font-medium bg-[#F3EFEC] hover:bg-[#EAE7E4] rounded-lg text-sm transition-colors">
                          Disconnect
                        </button>
                        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-medium rounded-lg text-sm hover:shadow-lg transition-all">
                          Reconnect
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button className="w-full px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                      <Plus className="w-4 h-4 inline mr-2" />
                      Connect Account
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181817] mb-2">Notification Preferences</h2>
              <p className="text-[#4D4946] text-sm">Choose how you want to be notified</p>
            </div>

            <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
              <h3 className="text-[#181817] font-semibold mb-4">Email Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#181817] font-medium">Post Published</p>
                    <p className="text-[#4D4946] text-sm">Get notified when your posts are published</p>
                  </div>
                  <button
                    onClick={() => setEmailNotifications(!emailNotifications)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      emailNotifications ? 'bg-[#FF6E00]' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      emailNotifications ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#181817] font-medium">Marketing Emails</p>
                    <p className="text-[#4D4946] text-sm">Receive tips and product updates</p>
                  </div>
                  <button
                    onClick={() => setMarketingEmails(!marketingEmails)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      marketingEmails ? 'bg-[#FF6E00]' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      marketingEmails ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
              <h3 className="text-[#181817] font-semibold mb-4">Push Notifications</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[#181817] font-medium">Desktop Notifications</p>
                    <p className="text-[#4D4946] text-sm">Show notifications on your desktop</p>
                  </div>
                  <button
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      pushNotifications ? 'bg-[#FF6E00]' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${
                      pushNotifications ? 'right-0.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'billing':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181817] mb-2">Billing & Subscription</h2>
              <p className="text-[#4D4946] text-sm">Manage your subscription and payment methods</p>
            </div>

            {/* Current Plan */}
            <div className="bg-gradient-to-br from-[#FF9B4F] to-[#FF6E00] rounded-xl p-6 text-white">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm mb-1">Current Plan</p>
                  <h3 className="text-2xl font-bold">Free Plan</h3>
                </div>
                <div className="px-3 py-1 bg-white/20 rounded-full text-sm font-medium">
                  Active
                </div>
              </div>
              <p className="text-white/90 mb-6">5 scheduled posts • 1 connected account • Basic analytics</p>
              <button className="w-full sm:w-auto px-6 py-2.5 bg-white text-[#FF6E00] font-semibold rounded-lg hover:shadow-lg transition-all">
                Upgrade to Pro
              </button>
            </div>

            {/* Payment Methods */}
            <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[#181817] font-semibold">Payment Methods</h3>
                <button className="flex items-center gap-2 px-4 py-2 text-[#FF6E00] font-medium hover:bg-[#F3EFEC] rounded-lg transition-colors">
                  <Plus className="w-4 h-4" />
                  Add Method
                </button>
              </div>
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 text-[#4D4946]/30 mx-auto mb-3" />
                <p className="text-[#4D4946] text-sm">No payment methods added</p>
              </div>
            </div>

            {/* Billing History */}
            <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
              <h3 className="text-[#181817] font-semibold mb-4">Billing History</h3>
              <div className="text-center py-8">
                <p className="text-[#4D4946] text-sm">No billing history available</p>
              </div>
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-[#181817] mb-2">Team Members</h2>
                <p className="text-[#4D4946] text-sm">Manage who has access to your workspace</p>
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                <Plus className="w-4 h-4" />
                Invite Member
              </button>
            </div>

            <div className="bg-white rounded-xl border border-[#EAE7E4] overflow-hidden">
              {teamMembers.map((member, index) => (
                <div key={member.id} className={`p-6 flex items-center justify-between ${index !== teamMembers.length - 1 ? 'border-b border-[#EAE7E4]' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF9B4F] to-[#FF6E00] flex items-center justify-center text-white font-bold">
                      {member.avatar}
                    </div>
                    <div>
                      <h4 className="text-[#181817] font-semibold">{member.name}</h4>
                      <p className="text-[#4D4946] text-sm">{member.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      defaultValue={member.role}
                      className="px-3 py-1.5 border border-[#EAE7E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#FF9B4F]"
                    >
                      <option>Admin</option>
                      <option>Editor</option>
                      <option>Viewer</option>
                    </select>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#181817] mb-2">Security Settings</h2>
              <p className="text-[#4D4946] text-sm">Keep your account secure</p>
            </div>

            <div className="bg-white rounded-xl border border-[#EAE7E4] p-6">
              <h3 className="text-[#181817] font-semibold mb-4">Password</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-[#4D4946] text-sm font-medium mb-2">Current Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-[#EAE7E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B4F] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[#4D4946] text-sm font-medium mb-2">New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-[#EAE7E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B4F] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-[#4D4946] text-sm font-medium mb-2">Confirm New Password</label>
                  <input
                    type="password"
                    className="w-full px-4 py-2 border border-[#EAE7E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9B4F] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button className="px-6 py-2 bg-gradient-to-r from-[#FF9B4F] to-[#FF6E00] text-white font-semibold rounded-lg hover:shadow-lg transition-all">
                  Update Password
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border-2 border-red-200 p-6">
              <h3 className="text-red-600 font-semibold mb-2">Danger Zone</h3>
              <p className="text-[#4D4946] text-sm mb-4">Permanently delete your account and all your data</p>
              <button className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors">
                Delete Account
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#181817]">Settings</h1>
        <p className="text-[#4D4946] text-sm mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Settings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-[#EAE7E4] p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-[#FF9B4F]/10 to-[#FF6E00]/10 text-[#FF6E00] border border-[#FFD4B2]'
                      : 'text-[#4D4946] hover:bg-[#F3EFEC]'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;