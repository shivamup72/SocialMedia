// src/utils/EventEmitter.js
const listeners = {};

const EventEmitter = {
  on: (event, cb) => {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(cb);
  },
  off: (event, cb) => {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(fn => fn !== cb);
  },
  emit: (event, ...args) => {
    if (!listeners[event]) return;
    listeners[event].forEach(fn => fn(...args));
  },
};

export default EventEmitter;
