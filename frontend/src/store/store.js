
import { create } from 'zustand';

const useStore = create((set, get) => ({
  startCord: null,
  endCord: null,
  isQuiet: true,
  includeWaypoints: false,
  visibleWaypoints: 0,
  waypointCord1: null,
  waypointCord2: null,
  waypointCord3: null,
  waypointCord4: null,
  waypointCord5: null,
  setStartCord: (cord) => set({ startCord: cord }),
  setEndCord: (cord) => set({ endCord: cord }),
  setIsQuiet: () => set((state) => ({ isQuiet: !state.isQuiet })),
  setIncludeWaypoints: () => set((state) => ({ includeWaypoints: !state.includeWaypoints })),
  setVisibleWaypoints: (count) => set({ visibleWaypoints: count }),
  setWaypointCord1: (cord) => set({ waypointCord1: cord }),
  setWaypointCord2: (cord) => set({ waypointCord2: cord }),
  setWaypointCord3: (cord) => set({ waypointCord3: cord }),
  setWaypointCord4: (cord) => set({ waypointCord4: cord }),
  setWaypointCord5: (cord) => set({ waypointCord5: cord }),
  resetWaypointCord: (index) => set((state) => {
    const waypointKey = `waypointCord${index}`;
    return { [waypointKey]: null };
  }),
setWaypointAndIncrease: (cord) => {
    let waypointIndex = -1;
    const state = get();
    const updatedState = {};

    for (let i = 1; i <= 5; i++) {
      const waypointKey = `waypointCord${i}`;
      if (!state[waypointKey]) {
        updatedState[waypointKey] = cord;
        waypointIndex = i - 1; // Set the index to i - 1 for 0-based indexing
        break;
      }
    }

    if (waypointIndex !== -1 && state.visibleWaypoints < 5) {
      updatedState.visibleWaypoints = state.visibleWaypoints + 1;
    }

    set(updatedState);
    return waypointIndex;
  },
}));

export default useStore;