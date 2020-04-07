export const dbg = (label, val = null) => {
  if (process.env.NODE_ENV === "development") {
    if (val) {
      console.log(label, val);
    } else {
      console.log(label);
    }
  }
};

export const dbgGroup = (label) => {
  if (process.env.NODE_ENV === "development") {
    console.group(label);
  }
};

export const dbgGroupEnd = (label) => {
  if (process.env.NODE_ENV === "development") {
    console.groupEnd();
  }
};
