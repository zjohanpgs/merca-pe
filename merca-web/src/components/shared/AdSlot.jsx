export default function AdSlot({ className = '', size = 'banner' }) {
  const sizes = {
    banner: 'h-24',       // 728x90 leaderboard
    sidebar: 'h-64',      // 300x250 medium rectangle
    inline: 'h-20',       // 468x60 inline
  };

  return (
    <div className={`bg-slate-800/50 border border-dashed border-slate-700 rounded-xl flex items-center justify-center text-slate-600 text-xs ${sizes[size] || sizes.banner} ${className}`}>
      Espacio publicitario
    </div>
  );
}
