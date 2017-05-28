const methods = [
  'index',
  'show',
  'create',
  'update',
  'destroy',
];

const events = [
  'start',
  'started',
  'failed',
  'succeeded',
  'completed',
];
export default (schema) => {
  const actions = { creators: {} };
  methods.forEach((name) => {
    actions[name] = {};
    actions.creators[name] = {};
    events.forEach((event) => {
      const type = `${schema.title}/${name}/${event}`;
      actions[name][event] = type;
      actions.creators[name][event] = payload => ({ type, payload });
    });
  });
  return actions;
};
