/**
 * Human parametric modeling MVP pipeline (skeleton-first).
 * Runtime-safe plain JavaScript implementation.
 */

const DEFAULT_RATIOS = {
  shoulder: 0.245,
  torso: 0.30,
  upperArm: 0.175,
  lowerArm: 0.165,
  thigh: 0.245,
  calf: 0.225,
};

const CLAMP_RANGES = {
  shoulder: [0.2, 0.3],
  torso: [0.26, 0.36],
  upperArm: [0.15, 0.21],
  lowerArm: [0.14, 0.2],
  thigh: [0.2, 0.28],
  calf: [0.18, 0.26],
};

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function normalizeAndClamp(input) {
  const h = Number(input.height_cm);
  if (!Number.isFinite(h) || h <= 0) {
    throw new Error('height_cm must be a positive number');
  }

  const m = input.measurements || {};
  const ratios = {
    shoulder: (m.shoulder_width_cm ?? h * DEFAULT_RATIOS.shoulder) / h,
    torso: (m.torso_length_cm ?? h * DEFAULT_RATIOS.torso) / h,
    upperArm: (m.upper_arm_length_cm ?? h * DEFAULT_RATIOS.upperArm) / h,
    lowerArm: (m.lower_arm_length_cm ?? h * DEFAULT_RATIOS.lowerArm) / h,
    thigh: (m.thigh_length_cm ?? h * DEFAULT_RATIOS.thigh) / h,
    calf: (m.calf_length_cm ?? h * DEFAULT_RATIOS.calf) / h,
  };

  for (const key of Object.keys(ratios)) {
    const [min, max] = CLAMP_RANGES[key];
    ratios[key] = clamp(ratios[key], min, max);
  }

  // global consistency pullback: torso + thigh + calf should be near body chain target
  const targetChain = 0.78;
  const chain = ratios.torso + ratios.thigh + ratios.calf;
  if (Math.abs(chain - targetChain) > 0.06) {
    const scale = targetChain / chain;
    ratios.torso *= scale;
    ratios.thigh *= scale;
    ratios.calf *= scale;

    // re-clamp after consistency correction
    ratios.torso = clamp(ratios.torso, ...CLAMP_RANGES.torso);
    ratios.thigh = clamp(ratios.thigh, ...CLAMP_RANGES.thigh);
    ratios.calf = clamp(ratios.calf, ...CLAMP_RANGES.calf);
  }

  return {
    height_cm: h,
    gender: input.gender || 'neutral',
    proportion_style: input.proportion_style || 'realistic',
    ratios,
  };
}

function buildSkeleton(p) {
  const h = p.height_cm;
  const L = {
    shoulderWidth: p.ratios.shoulder * h,
    torso: p.ratios.torso * h,
    upperArm: p.ratios.upperArm * h,
    lowerArm: p.ratios.lowerArm * h,
    thigh: p.ratios.thigh * h,
    calf: p.ratios.calf * h,
  };

  const spine1 = 0.45 * L.torso;
  const spine2 = 0.4 * L.torso;
  const neck = 0.15 * L.torso;

  return {
    bones: [
      { name: 'Root', parent: null, length: 0 },
      { name: 'Pelvis', parent: 'Root', length: 8 },
      { name: 'Spine1', parent: 'Pelvis', length: spine1 },
      { name: 'Spine2', parent: 'Spine1', length: spine2 },
      { name: 'Neck', parent: 'Spine2', length: neck },
      { name: 'Head', parent: 'Neck', length: 0.13 * h },
      { name: 'Clavicle_L', parent: 'Spine2', length: 0.18 * L.shoulderWidth },
      { name: 'UpperArm_L', parent: 'Clavicle_L', length: L.upperArm },
      { name: 'LowerArm_L', parent: 'UpperArm_L', length: L.lowerArm },
      { name: 'HandStub_L', parent: 'LowerArm_L', length: 0.06 * h },
      { name: 'Clavicle_R', parent: 'Spine2', length: 0.18 * L.shoulderWidth },
      { name: 'UpperArm_R', parent: 'Clavicle_R', length: L.upperArm },
      { name: 'LowerArm_R', parent: 'UpperArm_R', length: L.lowerArm },
      { name: 'HandStub_R', parent: 'LowerArm_R', length: 0.06 * h },
      { name: 'Thigh_L', parent: 'Pelvis', length: L.thigh },
      { name: 'Calf_L', parent: 'Thigh_L', length: L.calf },
      { name: 'Foot_L', parent: 'Calf_L', length: 0.09 * h },
      { name: 'Thigh_R', parent: 'Pelvis', length: L.thigh },
      { name: 'Calf_R', parent: 'Thigh_R', length: L.calf },
      { name: 'Foot_R', parent: 'Calf_R', length: 0.09 * h },
    ],
    rom: {
      Elbow: { flex: [0, 145], twist: [-60, 60] },
      Knee: { flex: [0, 135], hyperext: [0, 5] },
      Shoulder: { pitch: [-120, 120], yaw: [-90, 90], roll: [-90, 90] },
      Hip: { pitch: [-120, 45], yaw: [-45, 45], roll: [-45, 45] },
    },
  };
}

function validateModel(normalized, skeleton) {
  const ratios = normalized.ratios;
  const constraintsOk = Object.keys(CLAMP_RANGES).every((k) => {
    const [min, max] = CLAMP_RANGES[k];
    return ratios[k] >= min && ratios[k] <= max;
  });

  return {
    constraints_ok: constraintsOk,
    bone_count: skeleton.bones.length,
    size_error_target: '<=2%',
    volume_drift_target: '<=8%',
    self_intersection_target: 0,
  };
}

function buildHumanModel(input) {
  const p = normalizeAndClamp(input);
  const skeleton = buildSkeleton(p);
  const report = validateModel(p, skeleton);

  // Placeholder mesh result for MVP stage 1 (skeleton + validation first).
  const model = {
    mesh: null,
    status: 'skeleton_ready_mesh_pending',
  };

  return { skeleton, model, report, normalized: p };
}

module.exports = {
  normalizeAndClamp,
  buildSkeleton,
  validateModel,
  buildHumanModel,
};
