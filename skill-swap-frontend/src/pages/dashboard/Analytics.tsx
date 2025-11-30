import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState } from 'react';

const Analytics = () => {
  const [selectedSkill, setSelectedSkill] = useState<string>('all');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => userService.getAnalytics(),
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userService.getProfile(),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-secondary">Loading analytics...</div>
      </div>
    );
  }

  // Prepare chart data from ratingsTrend
  const chartData = analytics?.ratingsTrend?.map((rating, index) => ({
    name: `Rating ${index + 1}`,
    rating: rating.rating,
    date: new Date(rating.timestamp).toLocaleDateString(),
  })) || [];

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card card-hover">
          <h3 className="text-sm font-medium text-text-secondary">Average Rating</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {profile?.averageRating.toFixed(1) || '0.0'}
          </p>
        </div>
        <div className="card card-hover">
          <h3 className="text-sm font-medium text-text-secondary">Total Sessions</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {profile?.totalSessionsTaught || 0}
          </p>
        </div>
        <div className="card card-hover">
          <h3 className="text-sm font-medium text-text-secondary">Skills Learnt</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {profile?.totalSkillsLearnt || 0}
          </p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="card">
        <div className="flex justify-between items-center mb-6">
          <h2 className="h3 text-text-primary">Rating Trends</h2>
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="input text-sm py-2"
          >
            <option value="all">All Skills</option>
            {profile?.offeredSkills?.map((skill) => (
              <option
                key={typeof skill === 'string' ? skill : skill._id}
                value={typeof skill === 'string' ? skill : skill._id}
              >
                {typeof skill === 'string' ? skill : skill.name}
              </option>
            ))}
          </select>
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis dataKey="name" stroke="#64748B" />
              <YAxis domain={[0, 5]} stroke="#64748B" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px'
                }} 
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#6366F1"
                strokeWidth={2}
                name="Rating"
                dot={{ fill: '#6366F1', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            No rating data available yet
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

