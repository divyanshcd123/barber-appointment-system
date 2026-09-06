const Loader = ({ fullScreen = false, size = 'md' }) => {
  const sizes = { sm: 'w-5 h-5', md: 'w-9 h-9', lg: 'w-14 h-14' };

  const spinner = (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizes[size]} rounded-full border-[3px] border-gold-500/20 border-t-gold-500`}
        style={{ animation: 'spin 0.8s linear infinite' }}
      />
      {size === 'lg' && (
        <p className="text-gold-500/70 text-sm font-medium tracking-wider animate-pulse">
          Loading...
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-dark-400/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-4 border-gold-500/20 border-t-gold-500"
            style={{ animation: 'spin 0.8s linear infinite' }} />
          <p className="text-gold-500 font-medium tracking-wider animate-pulse">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
};

export default Loader;
