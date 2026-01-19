// Client-side data loader for brain data
// Replaces the socket.io server communication

const BrainData = {
  areas: null,
  proc: null,
  types: null,
  vars: null,
  loaded: false,
  callbacks: [],

  // Load the brain data JSON file
  async load() {
    try {
      const response = await fetch('./brain-data.json');
      const data = await response.json();
      
      this.areas = data.areas;
      this.proc = data.proc;
      this.types = data.types;
      this.vars = data.vars;
      this.loaded = true;
      
      console.log('Brain data loaded successfully');
      
      // Call any registered callbacks
      this.callbacks.forEach(callback => callback(data));
      this.callbacks = [];
      
      return data;
    } catch (error) {
      console.error('Error loading brain data:', error);
      throw error;
    }
  },

  // Get neuron data for a specific electrode position
  getNeuronData(type, x, y) {
    if (!this.loaded) {
      console.warn('Brain data not yet loaded');
      return undefined;
    }
    
    return ((this.proc[type] !== undefined) && 
            (this.proc[type][x] !== undefined) && 
            (this.proc[type][x][y] !== undefined)) 
            ? this.proc[type][x][y] 
            : undefined;
  },

  // Register a callback for when data is loaded
  onLoad(callback) {
    if (this.loaded) {
      callback({ areas: this.areas, proc: this.proc, types: this.types, vars: this.vars });
    } else {
      this.callbacks.push(callback);
    }
  }
};
