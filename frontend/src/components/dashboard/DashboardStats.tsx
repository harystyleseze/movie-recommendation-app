import { TrendingUp, Star, Clock, Heart } from 'lucide-react'

const stats = [
  {
    name: 'Movies Rated',
    value: '23',
    change: '+12%',
    changeType: 'positive',
    icon: Star,
  },
  {
    name: 'Hours Watched',
    value: '47.2',
    change: '+8.1%',
    changeType: 'positive',
    icon: Clock,
  },
  {
    name: 'Recommendations',
    value: '156',
    change: '+23%',
    changeType: 'positive',
    icon: TrendingUp,
  },
  {
    name: 'Watchlist',
    value: '12',
    change: '+2',
    changeType: 'positive',
    icon: Heart,
  },
]

export function DashboardStats() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.name}
            className="bg-card rounded-lg border border-border p-6 hover:shadow-sm transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon className="h-6 w-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-muted-foreground ml-2">
                from last month
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}