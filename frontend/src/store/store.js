import { create } from 'zustand';

const hour = new Date().getHours();
const isNight = hour >= 18 || hour <= 6;

const useStore = create((set, get) => ({
  loopCord: null,
  startCord: null,
  endCord: null,
  loopIsQuiet: true, // Separate state for loop
  ptpIsQuiet: true,  // Separate state for point-to-point
  loopDistance: null,
  includeWaypoints: false,
  visibleWaypoints: 0,
  waypointCord1: null,
  waypointCord2: null,
  waypointCord3: null,
  waypointCord4: null,
  waypointCord5: null,
  isLoopOpen: false,
  isPtPOpen: false,
  isSidebarOpen: false,
  setIsSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),
  setLoopCord: (cord) => set({ loopCord: cord }),
  setLoopDistance: (distance) => set({ loopDistance: distance }),
  setStartCord: (cord) => set({ startCord: cord }),
  setEndCord: (cord) => set({ endCord: cord }),
  toggleLoopIsQuiet: () => set((state) => ({ loopIsQuiet: !state.loopIsQuiet })),
  togglePtpIsQuiet: () => set((state) => ({ ptpIsQuiet: !state.ptpIsQuiet })),
  setIncludeWaypoints: () => set((state) => ({ includeWaypoints: !state.includeWaypoints })),// This one is for when the user click on the include waypoint checkbox
  enableWaypoints: () => set({ includeWaypoints: true }),// This one's for the popup to set includewaypoint=true
  setVisibleWaypoints: (count) => set({ visibleWaypoints: count }),
  setWaypointCord1: (cord) => set({ waypointCord1: cord }),
  setWaypointCord2: (cord) => set({ waypointCord2: cord }),
  setWaypointCord3: (cord) => set({ waypointCord3: cord }),
  setWaypointCord4: (cord) => set({ waypointCord4: cord }),
  setWaypointCord5: (cord) => set({ waypointCord5: cord }),
  clearWaypointData: () => set({
    waypointCord1: null,
    waypointCord2: null,
    waypointCord3: null,
    waypointCord4: null,
    waypointCord5: null,
    visibleWaypoints: 0,
  }),
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

    if (waypointIndex === -1 && state.visibleWaypoints === 5) {
      // Update the 5th waypoint if all waypoints are already set
      updatedState.waypointCord5 = cord;
      waypointIndex = 4; // Set the index to 4 for 0-based indexing
    }

    if (waypointIndex !== -1 && state.visibleWaypoints <= waypointIndex) {
      updatedState.visibleWaypoints = waypointIndex + 1;
    }

    set(updatedState);
    return waypointIndex;
  },

  isNightMode: isNight,
  toggleNightMode: () => set((state) => ({ isNightMode: !state.isNightMode })),
  setNightMode: (isNight) => set({ isNightMode: isNight }),
  routes: [],
  setRoutes: (routes) => set({ routes }),
  selectedRouteIndex: 0,
  setSelectedRouteIndex: (index) => set({ selectedRouteIndex: index }),
  isColorBlindMode: false,
  toggleColorBlindMode: () => set((state) => ({ isColorBlindMode: !state.isColorBlindMode })),
  setColorBlindMode: (isColorBlind) => set({ isColorBlindMode: isColorBlind }),
  isMultiP2P: false,
  toggleIsMultiP2P: () => set((state) => ({ isMultiP2P: !state.isMultiP2P })),
  setIsLoopOpen: (isOpen) => set({ isLoopOpen: isOpen }),
  setIsPtPOpen: (isOpen) => set({ isPtPOpen: isOpen }),
  
  clearRoutes: () => set({ routes: [], selectedRouteIndex: 0 })
}));

export default useStore;
