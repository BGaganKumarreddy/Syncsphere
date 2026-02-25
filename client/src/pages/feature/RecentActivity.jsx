import React, { useEffect, useState } from 'react';

export default function RecentActivity() {
    const [activities, setActivities] = useState([]);

    useEffect(() => {
        const userName = localStorage.getItem("userName") || "You";

        setActivities([
            {
                id: 1,
                user: userName,
                action: 'completed task',
                target: 'Homepage Redesign',
                time: '2 hours ago',
                initials: userName.charAt(0).toUpperCase()
            },
            {
                id: 2,
                user: 'Team Member',
                action: 'added a comment to',
                target: 'API Integration',
                time: '4 hours ago',
                initials: 'T'
            },
            {
                id: 3,
                user: 'Team Member',
                action: 'uploaded a file',
                target: 'Project Guidelines.pdf',
                time: '1 day ago',
                initials: 'T'
            },
        ]);
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-slate-50 last:border-0 last:pb-0">
                        <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {activity.initials}
                        </div>
                        <div>
                            <p className="text-sm text-slate-600">
                                <span className="font-medium text-slate-900">{activity.user}</span>{' '}
                                {activity.action}{' '}
                                <span className="font-medium text-slate-900">{activity.target}</span>
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{activity.time}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
