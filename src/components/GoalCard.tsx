import React from 'react';
import { Goal } from '@/schemas/goalSchemas';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface GoalCardProps {
    goal: { id: string } & Goal;
}

const GoalCard: React.FC<GoalCardProps> = ({ goal }) => {
    const router = useRouter();

    const handleEdit = () => {
        router.push(`/goals/${goal.id}/edit`);
    };

    const handleDelete = async () => {
        if (confirm('このゴールを削除してもよろしいですか？')) {
            // Firestoreの削除ロジックを実装
            // ここでは省略
            alert('ゴールが削除されました（モック）');
        }
    };

    // 現在の日付
    const now = new Date();

    // ステータスの判定
    let displayStatus = goal.status;
    if (now > goal.deadlines.reasonableDeadline) {
        if (goal.status === 'active') {
            displayStatus = 'failed';
        }
    }

    return (
        <div className="border rounded p-4 shadow bg-white">
            <h3 className="text-lg font-medium mb-2">{goal.type} Goal</h3>
            <p><strong>Progress:</strong> {goal.currentProgress} / {goal.targetQuestions}</p>
            <p><strong>Status:</strong> {displayStatus}</p>
            <p><strong>Created At:</strong> {format(goal.createdAt, 'yyyy-MM-dd')}</p>
            <p><strong>Reasonable Deadline:</strong> {format(goal.deadlines.reasonableDeadline, 'yyyy-MM-dd')}</p>
            <p><strong>Best Deadline:</strong> {format(goal.deadlines.bestDeadline, 'yyyy-MM-dd')}</p>
            {goal.criteria.mode === 'iteration' && (
                <>
                    <p><strong>Required Iterations:</strong> {goal.criteria.details.requiredIterations}</p>
                    <p><strong>Completed Iterations:</strong> {goal.completedIterations || 0}</p>
                </>
            )}
            {goal.criteria.mode === 'score' && (
                <>
                    <p><strong>Minimum Score:</strong> {goal.criteria.details.minimumScore}</p>
                </>
            )}
            {goal.criteria.mode === 'count' && (
                <>
                    <p><strong>Required Count:</strong> {goal.criteria.details.requiredCount}</p>
                </>
            )}
            {goal.criteria.mode === 'time' && (
                <>
                    <p><strong>Required Time:</strong> {goal.criteria.details.requiredTime} seconds</p>
                </>
            )}
            {goal.perPeriodTargets?.enabled && (
                <>
                    <p><strong>Period:</strong> {goal.perPeriodTargets.period}</p>
                    <p><strong>Target Rate:</strong> {goal.perPeriodTargets.targetRate}%</p>
                </>
            )}
            <div className="mt-2 flex space-x-2">
                <button
                    onClick={handleEdit}
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                    Edit
                </button>
                <button
                    onClick={handleDelete}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                >
                    Delete
                </button>
            </div>
        </div>
    );
};

export default GoalCard;
