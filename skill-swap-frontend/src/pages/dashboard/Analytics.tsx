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
  const chartData = analytics?.ratingsTrend
    ?.filter((rating) => {
      // Filter by selected skill if not "all"
      if (selectedSkill === 'all') return true;
      // Handle skill as ObjectId string or populated object
      let skillId: string | undefined;
      if (typeof rating.skill === 'string') {
        skillId = rating.skill;
      } else if (rating.skill && typeof rating.skill === 'object' && '_id' in rating.skill) {
        skillId = (rating.skill as any)._id;
      }
      return skillId === selectedSkill;
    })
    .sort((a, b) => {
      // Sort by timestamp (oldest first)
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return dateA - dateB;
    })
    .map((rating, index) => {
      const timestamp = rating.timestamp instanceof Date 
        ? rating.timestamp 
        : new Date(rating.timestamp);
      
      return {
        name: `#${index + 1}`,
        rating: Number(rating.rating),
        date: timestamp.toLocaleDateString(),
        fullDate: timestamp.toISOString(),
      };
    }) || [];

  console.log('Analytics data:', {
    hasAnalytics: !!analytics,
    ratingsTrendLength: analytics?.ratingsTrend?.length || 0,
    chartDataLength: chartData.length,
    sampleRating: analytics?.ratingsTrend?.[0],
  });

  return (
    <div className="space-y-6">
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card card-hover">
          <h3 className="text-sm font-medium text-text-secondary">Average Rating</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {analytics?.averageRating?.toFixed(1) || profile?.averageRating?.toFixed(1) || '0.0'}
          </p>
        </div>
        <div className="card card-hover">
          <h3 className="text-sm font-medium text-text-secondary">Total Sessions</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {analytics?.totalSessionsTaught ?? profile?.totalSessionsTaught ?? 0}
          </p>
        </div>
        <div className="card card-hover">
          <h3 className="text-sm font-medium text-text-secondary">Skills Learnt</h3>
          <p className="text-3xl font-bold text-text-primary mt-2">
            {analytics?.totalSkillsLearnt ?? profile?.totalSkillsLearnt ?? 0}
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
            <LineChart 
              data={chartData}
              margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748B"
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <YAxis 
                domain={[0, 5]} 
                stroke="#64748B"
                tick={{ fill: '#64748B', fontSize: 12 }}
                label={{ value: 'Rating', angle: -90, position: 'insideLeft', fill: '#64748B' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#FFFFFF', 
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: number) => [`${value}/5`, 'Rating']}
                labelFormatter={(label) => `Rating ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="rating"
                stroke="#6366F1"
                strokeWidth={2}
                name="Rating"
                dot={{ fill: '#6366F1', r: 5, strokeWidth: 2, stroke: '#FFFFFF' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            <p className="mb-2">No rating data available yet</p>
            <p className="text-sm">Ratings will appear here once you receive feedback from other users</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;

