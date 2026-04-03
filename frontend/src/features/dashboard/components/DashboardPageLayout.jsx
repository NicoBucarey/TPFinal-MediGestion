import { Link } from 'react-router-dom';

const DashboardPageLayout = ({
  title,
  subtitle,
  stats = [],
  actions = [],
  actionsTitle = 'Accesos Rápidos',
  actionsGridClass = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6',
  children,
}) => {
  const statsGridClass = {
    1: 'grid grid-cols-1 gap-6 mb-8',
    2: 'grid grid-cols-1 md:grid-cols-2 gap-6 mb-8',
    3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8',
    4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8',
  }[Math.min(stats.length, 4)] || 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-2 text-gray-600">{subtitle}</p>}
      </div>

      {stats.length > 0 && (
        <div className={statsGridClass}>
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <div
                key={stat.key || stat.label}
                className={`${stat.className} rounded-2xl shadow-lg p-6 text-white`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90 mb-1">{stat.label}</p>
                    {stat.loading ? (
                      <div className="animate-pulse h-8 w-12 bg-white/20 rounded"></div>
                    ) : (
                      <p className="text-3xl font-bold">{stat.value ?? 0}</p>
                    )}
                  </div>
                  {IconComponent && <IconComponent className="w-12 h-12 opacity-30" />}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {actions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{actionsTitle}</h2>
          <div className={actionsGridClass}>
            {actions.map((action) => {
              const IconComponent = action.icon;
              const cardPaddingClass = action.compact ? 'p-6' : 'p-8';
              const layoutClass = action.compact ? 'items-start space-x-4' : 'items-center space-x-6';
              const iconWrapperClass = action.compact ? 'w-14 h-14' : 'w-16 h-16';
              const iconClass = action.compact ? 'w-7 h-7 text-white' : 'w-8 h-8 text-white';
              const titleClass = action.compact ? 'text-lg font-semibold text-gray-900 mb-1' : 'text-xl font-semibold text-gray-900 mb-1';
              const descriptionClass = action.compact ? 'text-sm text-gray-600' : 'text-gray-600';

              return (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`group bg-white rounded-2xl shadow-md ${cardPaddingClass} hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1`}
                >
                  <div className={`flex ${layoutClass}`}>
                    <div className={`${action.color} ${action.hoverColor} ${iconWrapperClass} rounded-xl flex items-center justify-center transition-colors flex-shrink-0`}>
                      {IconComponent && (
                        <IconComponent className={iconClass} />
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className={titleClass}>
                        {action.title}
                      </h3>
                      <p className={descriptionClass}>
                        {action.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {children}
    </div>
  );
};

export default DashboardPageLayout;
