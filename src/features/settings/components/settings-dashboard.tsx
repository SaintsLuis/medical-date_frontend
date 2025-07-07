'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  User,
  Shield,
  Bell,
  Palette,
  Database,
  Globe,
  Save,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Eye,
  EyeOff,
} from 'lucide-react'

export function SettingsDashboard() {
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)

  const handleSave = () => {
    // Handle save logic
    console.log('Settings saved')
  }

  const handleReset = () => {
    // Handle reset logic
    console.log('Settings reset')
  }

  return (
    <div className='space-y-6'>
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='space-y-4'
      >
        <TabsList className='grid w-full grid-cols-6'>
          <TabsTrigger value='general'>General</TabsTrigger>
          <TabsTrigger value='profile'>Profile</TabsTrigger>
          <TabsTrigger value='security'>Security</TabsTrigger>
          <TabsTrigger value='notifications'>Notifications</TabsTrigger>
          <TabsTrigger value='appearance'>Appearance</TabsTrigger>
          <TabsTrigger value='advanced'>Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value='general' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure basic application settings
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Language</label>
                  <Select defaultValue='es'>
                    <SelectTrigger>
                      <SelectValue placeholder='Select language' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='es'>Español</SelectItem>
                      <SelectItem value='en'>English</SelectItem>
                      <SelectItem value='fr'>Français</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Time Zone</label>
                  <Select defaultValue='utc-5'>
                    <SelectTrigger>
                      <SelectValue placeholder='Select timezone' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='utc-5'>
                        UTC-5 (Eastern Time)
                      </SelectItem>
                      <SelectItem value='utc-6'>
                        UTC-6 (Central Time)
                      </SelectItem>
                      <SelectItem value='utc-7'>
                        UTC-7 (Mountain Time)
                      </SelectItem>
                      <SelectItem value='utc-8'>
                        UTC-8 (Pacific Time)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Date Format</label>
                <Select defaultValue='mm/dd/yyyy'>
                  <SelectTrigger>
                    <SelectValue placeholder='Select date format' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='mm/dd/yyyy'>MM/DD/YYYY</SelectItem>
                    <SelectItem value='dd/mm/yyyy'>DD/MM/YYYY</SelectItem>
                    <SelectItem value='yyyy-mm-dd'>YYYY-MM-DD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='profile' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
              <CardDescription>
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>First Name</label>
                  <Input placeholder='Enter first name' />
                </div>
                <div className='space-y-2'>
                  <label className='text-sm font-medium'>Last Name</label>
                  <Input placeholder='Enter last name' />
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Email</label>
                <Input type='email' placeholder='Enter email address' />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Phone</label>
                <Input placeholder='Enter phone number' />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Bio</label>
                <Input placeholder='Enter bio' />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='security' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Current Password</label>
                <div className='relative'>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder='Enter current password'
                  />
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className='h-4 w-4' />
                    ) : (
                      <Eye className='h-4 w-4' />
                    )}
                  </Button>
                </div>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>New Password</label>
                <Input type='password' placeholder='Enter new password' />
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Confirm Password</label>
                <Input type='password' placeholder='Confirm new password' />
              </div>
              <Separator />
              <div className='space-y-2'>
                <label className='text-sm font-medium'>
                  Two-Factor Authentication
                </label>
                <div className='flex items-center space-x-2'>
                  <Badge variant='outline'>Disabled</Badge>
                  <Button size='sm'>Enable</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='notifications' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-medium'>
                      Email Notifications
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Receive notifications via email
                    </div>
                  </div>
                  <Badge variant='default'>Enabled</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-medium'>
                      Push Notifications
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Receive push notifications
                    </div>
                  </div>
                  <Badge variant='secondary'>Disabled</Badge>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-medium'>SMS Notifications</div>
                    <div className='text-sm text-muted-foreground'>
                      Receive SMS notifications
                    </div>
                  </div>
                  <Badge variant='secondary'>Disabled</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='appearance' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the application appearance
              </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Theme</label>
                <Select defaultValue='light'>
                  <SelectTrigger>
                    <SelectValue placeholder='Select theme' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='light'>Light</SelectItem>
                    <SelectItem value='dark'>Dark</SelectItem>
                    <SelectItem value='system'>System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Color Scheme</label>
                <Select defaultValue='blue'>
                  <SelectTrigger>
                    <SelectValue placeholder='Select color scheme' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='blue'>Blue</SelectItem>
                    <SelectItem value='green'>Green</SelectItem>
                    <SelectItem value='purple'>Purple</SelectItem>
                    <SelectItem value='red'>Red</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='advanced' className='space-y-4'>
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Advanced configuration options</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-medium'>Data Export</div>
                    <div className='text-sm text-muted-foreground'>
                      Export your data
                    </div>
                  </div>
                  <Button size='sm' variant='outline'>
                    <Download className='mr-2 h-4 w-4' />
                    Export
                  </Button>
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-medium'>Data Import</div>
                    <div className='text-sm text-muted-foreground'>
                      Import data from file
                    </div>
                  </div>
                  <Button size='sm' variant='outline'>
                    <Upload className='mr-2 h-4 w-4' />
                    Import
                  </Button>
                </div>
                <Separator />
                <div className='flex items-center justify-between'>
                  <div>
                    <div className='text-sm font-medium text-red-600'>
                      Delete Account
                    </div>
                    <div className='text-sm text-muted-foreground'>
                      Permanently delete your account
                    </div>
                  </div>
                  <Button size='sm' variant='destructive'>
                    <Trash2 className='mr-2 h-4 w-4' />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className='flex justify-end space-x-2'>
        <Button variant='outline' onClick={handleReset}>
          <RefreshCw className='mr-2 h-4 w-4' />
          Reset
        </Button>
        <Button onClick={handleSave}>
          <Save className='mr-2 h-4 w-4' />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
