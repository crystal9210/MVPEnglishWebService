// src/components/CreateGoalForm.tsx

'use client';

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Goal, GoalSchema } from '@/schemas/goalSchemas';
import { zodResolver } from '@hookform/resolvers/zod';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ProblemSet } from '@/schemas/customProblemSetSchema';
import { z } from 'zod';

type GoalFormInput = Omit<Goal, 'id' | 'createdAt' | 'updatedAt'>;

interface CreateGoalFormProps {
    problemSets: ProblemSet[];
    onCreate: (data: Partial<Goal>) => void;
    onClose: () => void;
}

const CreateGoalForm: React.FC<CreateGoalFormProps> = ({ problemSets, onCreate, onClose }) => {
    const { register, handleSubmit, control, watch, formState: { errors } } = useForm<GoalFormInput>({
        resolver: zodResolver(GoalSchema.omit({ id: true, createdAt: true, updatedAt: true }).partial()),
    });

    const criteriaMode = watch('criteria.mode');
    const perPeriodEnabled = watch('perPeriodTargets.enabled');

    const onSubmit = (data: GoalFormInput) => {
        onCreate(data);
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h2 className="text-2xl font-semibold">Create New Goal</h2>

            {/* Type */}
            <div>
                <label className="block text-gray-700">Type</label>
                <select {...register('type', { required: 'Type is required' })} className="mt-1 block w-full border border-gray-300 rounded p-2">
                    <option value="">Select Type</option>
                    <option value="short-term">Short-term</option>
                    <option value="medium-term">Medium-term</option>
                    <option value="long-term">Long-term</option>
                </select>
                {errors.type && <p className="text-red-500 text-sm">{errors.type.message}</p>}
            </div>

            {/* Criteria Mode */}
            <div>
                <label className="block text-gray-700">Criteria Mode</label>
                <select {...register('criteria.mode', { required: 'Criteria mode is required' })} className="mt-1 block w-full border border-gray-300 rounded p-2">
                    <option value="">Select Mode</option>
                    <option value="iteration">Iteration</option>
                    <option value="score">Score</option>
                    <option value="count">Count</option>
                    <option value="time">Time</option>
                </select>
                {errors.criteria?.mode && <p className="text-red-500 text-sm">{errors.criteria.mode.message}</p>}
            </div>

            {/* Criteria Details based on mode */}
            {criteriaMode === 'iteration' && (
                <div className="border rounded p-4">
                    <label className="block text-gray-700">Problem Sets</label>
                    <div className="space-y-2">
                        {problemSets.map(set => (
                            <div key={set.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    value={set.id}
                                    {...register('criteria.details.problemSetIds', { required: 'At least one problem set must be selected' })}
                                    className="mr-2"
                                />
                                <span>{set.serviceId} - {set.categoryId || 'N/A'} - {set.stepId || 'N/A'}</span>
                            </div>
                        ))}
                    </div>
                    {errors.criteria?.details?.problemSetIds && <p className="text-red-500 text-sm">{errors.criteria.details.problemSetIds.message}</p>}

                    <label className="block text-gray-700 mt-4">Required Iterations</label>
                    <input
                        type="number"
                        {...register('criteria.details.requiredIterations', { required: 'Required iterations is required', min: { value: 1, message: 'Must be at least 1' } })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                        min="1"
                    />
                    {errors.criteria?.details?.requiredIterations && <p className="text-red-500 text-sm">{errors.criteria.details.requiredIterations.message}</p>}
                </div>
            )}

            {criteriaMode === 'score' && (
                <div className="border rounded p-4">
                    <label className="block text-gray-700">Service ID</label>
                    <input
                        type="text"
                        {...register('criteria.details.serviceId', { required: 'Service ID is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                    {errors.criteria?.details?.serviceId && <p className="text-red-500 text-sm">{errors.criteria.details.serviceId.message}</p>}

                    <label className="block text-gray-700 mt-4">Category ID (optional)</label>
                    <input
                        type="text"
                        {...register('criteria.details.categoryId')}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />

                    <label className="block text-gray-700 mt-4">Step ID (optional)</label>
                    <input
                        type="text"
                        {...register('criteria.details.stepId')}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />

                    <label className="block text-gray-700 mt-4">Minimum Score</label>
                    <input
                        type="number"
                        {...register('criteria.details.minimumScore', { required: 'Minimum score is required', min: { value: 1, message: 'Must be at least 1' } })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                        min="1"
                    />
                    {errors.criteria?.details?.minimumScore && <p className="text-red-500 text-sm">{errors.criteria.details.minimumScore.message}</p>}
                </div>
            )}

            {criteriaMode === 'count' && (
                <div className="border rounded p-4">
                    <label className="block text-gray-700">Service ID</label>
                    <input
                        type="text"
                        {...register('criteria.details.serviceId', { required: 'Service ID is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                    {errors.criteria?.details?.serviceId && <p className="text-red-500 text-sm">{errors.criteria.details.serviceId.message}</p>}

                    <label className="block text-gray-700 mt-4">Category ID (optional)</label>
                    <input
                        type="text"
                        {...register('criteria.details.categoryId')}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />

                    <label className="block text-gray-700 mt-4">Step ID (optional)</label>
                    <input
                        type="text"
                        {...register('criteria.details.stepId')}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />

                    <label className="block text-gray-700 mt-4">Required Count</label>
                    <input
                        type="number"
                        {...register('criteria.details.requiredCount', { required: 'Required count is required', min: { value: 1, message: 'Must be at least 1' } })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                        min="1"
                    />
                    {errors.criteria?.details?.requiredCount && <p className="text-red-500 text-sm">{errors.criteria.details.requiredCount.message}</p>}
                </div>
            )}

            {criteriaMode === 'time' && (
                <div className="border rounded p-4">
                    <label className="block text-gray-700">Service ID</label>
                    <input
                        type="text"
                        {...register('criteria.details.serviceId', { required: 'Service ID is required' })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />
                    {errors.criteria?.details?.serviceId && <p className="text-red-500 text-sm">{errors.criteria.details.serviceId.message}</p>}

                    <label className="block text-gray-700 mt-4">Category ID (optional)</label>
                    <input
                        type="text"
                        {...register('criteria.details.categoryId')}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />

                    <label className="block text-gray-700 mt-4">Step ID (optional)</label>
                    <input
                        type="text"
                        {...register('criteria.details.stepId')}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                    />

                    <label className="block text-gray-700 mt-4">Required Time (seconds)</label>
                    <input
                        type="number"
                        {...register('criteria.details.requiredTime', { required: 'Required time is required', min: { value: 1, message: 'Must be at least 1 second' } })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                        min="1"
                    />
                    {errors.criteria?.details?.requiredTime && <p className="text-red-500 text-sm">{errors.criteria.details.requiredTime.message}</p>}
                </div>
            )}

            {/* Deadlines */}
            <div className="border rounded p-4">
                <label className="block text-gray-700">Reasonable Deadline</label>
                <Controller
                    control={control}
                    name="deadlines.reasonableDeadline"
                    rules={{ required: 'Reasonable deadline is required' }}
                    render={({ field }) => (
                        <DatePicker
                            selected={field.value}
                            onChange={(date: Date) => field.onChange(date)}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                            dateFormat="yyyy-MM-dd"
                        />
                    )}
                />
                {errors.deadlines?.reasonableDeadline && <p className="text-red-500 text-sm">{errors.deadlines.reasonableDeadline.message}</p>}

                <label className="block text-gray-700 mt-4">Best Deadline</label>
                <Controller
                    control={control}
                    name="deadlines.bestDeadline"
                    rules={{ required: 'Best deadline is required' }}
                    render={({ field }) => (
                        <DatePicker
                            selected={field.value}
                            onChange={(date: Date) => field.onChange(date)}
                            className="mt-1 block w-full border border-gray-300 rounded p-2"
                            dateFormat="yyyy-MM-dd"
                        />
                    )}
                />
                {errors.deadlines?.bestDeadline && <p className="text-red-500 text-sm">{errors.deadlines.bestDeadline.message}</p>}
            </div>

            {/* Per Period Targets */}
            <div className="border rounded p-4">
                <label className="block text-gray-700">Enable Per Period Targets</label>
                <input type="checkbox" {...register('perPeriodTargets.enabled')} className="mt-1" />
            </div>

            {perPeriodEnabled && (
                <div className="border rounded p-4">
                    <label className="block text-gray-700">Period</label>
                    <select {...register('perPeriodTargets.period', { required: 'Period is required when enabled' })} className="mt-1 block w-full border border-gray-300 rounded p-2">
                        <option value="">Select Period</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                    </select>
                    {errors.perPeriodTargets?.period && <p className="text-red-500 text-sm">{errors.perPeriodTargets.period.message}</p>}

                    <label className="block text-gray-700 mt-4">Target Rate (%)</label>
                    <input
                        type="number"
                        {...register('perPeriodTargets.targetRate', { required: 'Target rate is required when enabled', min: { value: 0, message: 'Must be at least 0' }, max: { value: 100, message: 'Cannot exceed 100' } })}
                        className="mt-1 block w-full border border-gray-300 rounded p-2"
                        min="0"
                        max="100"
                    />
                    {errors.perPeriodTargets?.targetRate && <p className="text-red-500 text-sm">{errors.perPeriodTargets.targetRate.message}</p>}
                </div>
            )}

            {/* Submit and Cancel buttons */}
            <div className="flex justify-end space-x-2">
                <button type="button" onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded">
                    Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
                    Create Goal
                </button>
            </div>
        </form>
    );

};

export default CreateGoalForm;
