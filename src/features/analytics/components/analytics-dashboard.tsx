'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  DollarSign,
  Activity,
  Download,
  RefreshCw,
  Building,
  UserCheck,
  Clock,
  CheckCircle,
} from 'lucide-react'

// Mock data for analytics
const appointmentData = [
  { month: 'Jan', appointments: 120, completed: 110, cancelled: 10 },
  { month: 'Feb', appointments: 150, completed: 140, cancelled: 10 },
  { month: 'Mar', appointments: 180, completed: 165, cancelled: 15 },
  { month: 'Apr', appointments: 200, completed: 185, cancelled: 15 },
  { month: 'May', appointments: 220, completed: 200, cancelled: 20 },
  { month: 'Jun', appointments: 250, completed: 230, cancelled: 20 },
]

const revenueData = [
  { month: 'Jan', revenue: 15000, expenses: 8000, profit: 7000 },
  { month: 'Feb', revenue: 18000, expenses: 9000, profit: 9000 },
  { month: 'Mar', revenue: 22000, expenses: 10000, profit: 12000 },
  { month: 'Apr', revenue: 25000, expenses: 11000, profit: 14000 },
  { month: 'May', revenue: 28000, expenses: 12000, profit: 16000 },
  { month: 'Jun', revenue: 32000, expenses: 13000, profit: 19000 },
]

const specialtyData = [
  { name: 'Cardiology', value: 30, color: '#8884d8' },
  { name: 'Neurology', value: 25, color: '#82ca9d' },
  { name: 'Oncology', value: 20, color: '#ffc658' },
  { name: 'Pediatrics', value: 15, color: '#ff7300' },
  { name: 'Other', value: 10, color: '#8dd1e1' },
]

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1']

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('6M')

  const StatsCard = ({
    title,
    value,
    change,
    changeType,
    icon: Icon,
  }: {
    title: string
    value: string
    change: string
    changeType: 'increase' | 'decrease'
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
  }) => (
    <Card>
      <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
        <CardTitle className='text-sm font-medium'>{title}</CardTitle>
        <Icon className='h-4 w-4 text-muted-foreground' />
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <div className='flex items-center space-x-1 text-xs'>
          {changeType === 'increase' ? (
            <TrendingUp className='h-3 w-3 text-green-500' />
          ) : (
            <TrendingDown className='h-3 w-3 text-red-500' />
          )}
          <span
            className={
              changeType === 'increase' ? 'text-green-500' : 'text-red-500'
            }
          >
            {change}
          </span>
          <span className='text-muted-foreground'>from last month</span>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-bold'>Analytics</h1>
          <p className='text-muted-foreground'>
            Comprehensive insights and performance metrics
          </p>
        </div>
        <div className='flex items-center space-x-2'>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='w-32'>
              <SelectValue placeholder='Time Range' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='1M'>Last Month</SelectItem>
              <SelectItem value='3M'>Last 3 Months</SelectItem>
              <SelectItem value='6M'>Last 6 Months</SelectItem>
              <SelectItem value='1Y'>Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' size='sm'>
            <RefreshCw className='h-4 w-4 mr-2' />
            Refresh
          </Button>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
        </div>
      </div>

      <Tabs defaultValue='overview' className='space-y-4'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='appointments'>Appointments</TabsTrigger>
          <TabsTrigger value='revenue'>Revenue</TabsTrigger>
          <TabsTrigger value='performance'>Performance</TabsTrigger>
        </TabsList>

        <TabsContent value='overview'>
          <div className='space-y-4'>
            {/* Key Metrics */}
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <StatsCard
                title='Total Appointments'
                value='1,325'
                change='+12.5%'
                changeType='increase'
                icon={Calendar}
              />
              <StatsCard
                title='Active Patients'
                value='856'
                change='+8.2%'
                changeType='increase'
                icon={Users}
              />
              <StatsCard
                title='Monthly Revenue'
                value='$32,000'
                change='+15.3%'
                changeType='increase'
                icon={DollarSign}
              />
              <StatsCard
                title='Success Rate'
                value='92.5%'
                change='+2.1%'
                changeType='increase'
                icon={CheckCircle}
              />
            </div>

            {/* Charts */}
            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Appointments Overview</CardTitle>
                  <CardDescription>
                    Monthly appointments and completion rates
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <BarChart data={appointmentData}>
                      <CartesianGrid strokeDasharray='3 3' />
                      <XAxis dataKey='month' />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey='appointments' fill='#8884d8' name='Total' />
                      <Bar
                        dataKey='completed'
                        fill='#82ca9d'
                        name='Completed'
                      />
                      <Bar
                        dataKey='cancelled'
                        fill='#ffc658'
                        name='Cancelled'
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Specialties Distribution</CardTitle>
                  <CardDescription>
                    Appointments by medical specialty
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width='100%' height={300}>
                    <PieChart>
                      <Pie
                        data={specialtyData}
                        cx='50%'
                        cy='50%'
                        outerRadius={80}
                        fill='#8884d8'
                        dataKey='value'
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {specialtyData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value='appointments'>
          <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <StatsCard
                title="Today's Appointments"
                value='28'
                change='+5.2%'
                changeType='increase'
                icon={Calendar}
              />
              <StatsCard
                title='Completed Today'
                value='22'
                change='+8.1%'
                changeType='increase'
                icon={CheckCircle}
              />
              <StatsCard
                title='Pending'
                value='6'
                change='-2.3%'
                changeType='decrease'
                icon={Clock}
              />
              <StatsCard
                title='No-Shows'
                value='2'
                change='-12.5%'
                changeType='decrease'
                icon={UserCheck}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Appointment Trends</CardTitle>
                <CardDescription>
                  Monthly appointment statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={400}>
                  <LineChart data={appointmentData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type='monotone'
                      dataKey='appointments'
                      stroke='#8884d8'
                      strokeWidth={2}
                    />
                    <Line
                      type='monotone'
                      dataKey='completed'
                      stroke='#82ca9d'
                      strokeWidth={2}
                    />
                    <Line
                      type='monotone'
                      dataKey='cancelled'
                      stroke='#ffc658'
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='revenue'>
          <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <StatsCard
                title='Monthly Revenue'
                value='$32,000'
                change='+15.3%'
                changeType='increase'
                icon={DollarSign}
              />
              <StatsCard
                title='Monthly Expenses'
                value='$13,000'
                change='+8.2%'
                changeType='increase'
                icon={TrendingUp}
              />
              <StatsCard
                title='Net Profit'
                value='$19,000'
                change='+18.8%'
                changeType='increase'
                icon={Activity}
              />
              <StatsCard
                title='Avg. Per Patient'
                value='$125'
                change='+5.5%'
                changeType='increase'
                icon={Users}
              />
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Analysis</CardTitle>
                <CardDescription>
                  Monthly revenue, expenses, and profit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width='100%' height={400}>
                  <BarChart data={revenueData}>
                    <CartesianGrid strokeDasharray='3 3' />
                    <XAxis dataKey='month' />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey='revenue' fill='#8884d8' name='Revenue' />
                    <Bar dataKey='expenses' fill='#ffc658' name='Expenses' />
                    <Bar dataKey='profit' fill='#82ca9d' name='Profit' />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='performance'>
          <div className='space-y-4'>
            <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
              <StatsCard
                title='Patient Satisfaction'
                value='4.8/5'
                change='+0.2'
                changeType='increase'
                icon={Users}
              />
              <StatsCard
                title='Avg. Wait Time'
                value='12 min'
                change='-5.2%'
                changeType='decrease'
                icon={Clock}
              />
              <StatsCard
                title='Doctor Utilization'
                value='85%'
                change='+3.1%'
                changeType='increase'
                icon={Activity}
              />
              <StatsCard
                title='Clinic Efficiency'
                value='92%'
                change='+1.8%'
                changeType='increase'
                icon={Building}
              />
            </div>

            <div className='grid gap-4 md:grid-cols-2'>
              <Card>
                <CardHeader>
                  <CardTitle>Performance Metrics</CardTitle>
                  <CardDescription>Key performance indicators</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Appointment Completion Rate
                      </span>
                      <Badge variant='outline'>92%</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        On-Time Performance
                      </span>
                      <Badge variant='outline'>88%</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Patient Retention Rate
                      </span>
                      <Badge variant='outline'>95%</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Revenue Per Patient
                      </span>
                      <Badge variant='outline'>$125</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quality Metrics</CardTitle>
                  <CardDescription>
                    Quality and safety indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Patient Safety Score
                      </span>
                      <Badge variant='outline'>4.9/5</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Clinical Accuracy
                      </span>
                      <Badge variant='outline'>96%</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Readmission Rate
                      </span>
                      <Badge variant='outline'>3.2%</Badge>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>
                        Prescription Accuracy
                      </span>
                      <Badge variant='outline'>99%</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
