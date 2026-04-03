/**
 * BookingStepIndicator
 * Generic multi-step progress bar used across all secretary booking flows.
 *
 * Props:
 *   steps       – string[]  – label for each step (e.g. ['Paciente', 'Profesional', 'Fecha/Hora'])
 *   currentStep – number    – 1-based index of the active step
 */
const BookingStepIndicator = ({ steps, currentStep }) => (
  <div className="mb-8">
    <div className="flex items-center justify-between">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = currentStep >= num;
        const isFirst = i === 0;
        const isLast = i === steps.length - 1;

        const circleClass = `w-8 h-8 rounded-full flex items-center justify-center ${
          active ? 'bg-blue-600 text-white' : 'bg-gray-300'
        }`;

        const innerAlign = isFirst
          ? 'items-center'
          : isLast
          ? 'items-center justify-end'
          : 'items-center justify-center';

        return (
          <div key={num} className="contents">
            {/* connector before this step */}
            {!isFirst && (
              <div
                className={`flex-1 h-1 ${currentStep > num - 1 ? 'bg-blue-600' : 'bg-gray-300'}`}
              />
            )}

            <div className={`flex-1 ${active ? 'text-blue-600' : 'text-gray-400'}`}>
              <div className={`flex ${innerAlign}`}>
                <div className={circleClass}>{num}</div>
                <span className="ml-2 hidden sm:inline">{label}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default BookingStepIndicator;
