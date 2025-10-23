import React from 'react';

export default function InfoCard({ title, icon, image, description, align = 'left' }) {
  return (
    <div className={`flex flex-col md:flex-row items-center md:items-start gap-4 ${align === 'right' ? 'md:flex-row-reverse' : ''}`}>
      <div className="flex-shrink-0 p-2 rounded-lg shadow-sm bg-white">
        {image ? (
          <img src={image} alt={title} className="w-20 h-20 object-cover rounded-md" />
        ) : (
          icon || (
            <div className="w-12 h-12 bg-[#4DD0E1] rounded-full flex items-center justify-center text-white font-bold">I</div>
          )
        )}
      </div>
      <div className="max-w-xl">
        <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
    </div>
  );
}
