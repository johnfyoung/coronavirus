export const dbg = {
  log: (label, val = null) => {
    if (process.env.NODE_ENV === "development") {
      if (val) {
        console.log(label, val);
      } else {
        console.log(label);
      }
    }
  },
  group: (label) => {
    if (process.env.NODE_ENV === "development") {
      console.group(label);
    }
  },
  groupEnd: () => {
    if (process.env.NODE_ENV === "development") {
      console.groupEnd();
    }
  }
};
