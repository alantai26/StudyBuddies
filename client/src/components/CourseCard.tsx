import React from 'react';
import type { Course } from '../types';

interface CourseCardProps {
  course: Course;
}

const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer">
      <h3 className="text-xl font-bold text-gray-900">{course.name}</h3>
      <p className="text-gray-500 mt-1 font-mono text-sm">CRN: {course.crn}</p>
    </div>
  );
};

export default CourseCard;