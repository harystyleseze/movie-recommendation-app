import { Play, Star, Plus } from 'lucide-react'

const activities = [
  {
    id: 1,
    type: 'rated',
    movie: 'The Dark Knight',
    rating: 5,
    time: '2 hours ago',
    icon: Star,
  },
  {
    id: 2,
    type: 'watched',
    movie: 'Inception',
    time: '1 day ago',
    icon: Play,
  },
  {
    id: 3,
    type: 'added',
    movie: 'Interstellar',
    time: '2 days ago',
    icon: Plus,
  },
  {
    id: 4,
    type: 'rated',
    movie: 'Pulp Fiction',
    rating: 4,
    time: '3 days ago',
    icon: Star,
  },
]

export function RecentActivity() {
  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = activity.icon
          return (
            <div key={activity.id} className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-muted/50 rounded-lg flex items-center justify-center">
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.type === 'rated' && 'Rated'}
                  {activity.type === 'watched' && 'Watched'}
                  {activity.type === 'added' && 'Added to watchlist'}
                  <span className="text-primary ml-1">{activity.movie}</span>
                  {activity.rating && (
                    <span className="text-yellow-500 ml-2">
                      {'★'.repeat(activity.rating)}
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}