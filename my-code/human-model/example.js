const { buildHumanModel } = require('./index');

const input = {
  height_cm: 175,
  gender: 'neutral',
  proportion_style: 'realistic',
  measurements: {
    shoulder_width_cm: 43,
    torso_length_cm: 52,
    upper_arm_length_cm: 30,
    lower_arm_length_cm: 27,
    thigh_length_cm: 43,
    calf_length_cm: 40,
  },
};

const result = buildHumanModel(input);
console.log(JSON.stringify(result, null, 2));
