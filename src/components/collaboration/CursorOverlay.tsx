import { motion, AnimatePresence } from 'framer-motion';
import { usePresence } from '@/services/presenceService';

const USER_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', 
  '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6', '#d946ef',
];

export function CursorOverlay({ roomId, userId }: { roomId: string; userId: string }) {
  const { users, cursors } = usePresence(roomId, userId);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {Array.from(cursors.entries()).map(([id, cursor]) => {
          const user = users.find((u) => u.id === id);
          if (!user || id === userId) return null;

          return (
            <motion.div
              key={id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: cursor.x,
                y: cursor.y,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="absolute"
            >
              {/* Cursor */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                style={{ color: user.color }}
                aria-hidden
              >
                <path
                  d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19177L11.7841 12.3673H5.65376Z"
                  fill={user.color}
                  stroke="white"
                  strokeWidth="1"
                />
              </svg>

              {/* Label */}
              <div
                className="absolute left-4 top-4 px-2 py-0.5 rounded-md text-xs font-medium text-white whitespace-nowrap"
                style={{ backgroundColor: user.color }}
              >
                {user.name}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* User list */}
      <div className="absolute top-4 right-4 flex -space-x-2">
        {users.map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-8 h-8 rounded-full border-2 border-background flex items-center justify-center text-xs font-bold text-white"
            style={{ 
              backgroundColor: user.color || USER_COLORS[i % USER_COLORS.length],
              zIndex: users.length - i,
            }}
            title={user.name}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
