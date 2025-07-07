import { LoginForm } from '@/features/auth/components/login-form'
import { DemoInfo } from '@/features/auth/components/demo-info'

export default function LoginPage() {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50 p-4'>
      <div className='w-full max-w-md space-y-6'>
        <LoginForm />
        <DemoInfo />
      </div>
    </div>
  )
}
