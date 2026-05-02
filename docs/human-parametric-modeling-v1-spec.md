# 人体参数化建模系统 V1 技术规格（可直接开工）

> 在已有方案基础上，这份文档给出**可执行的数据结构、算法流程、伪代码和验收标准**。

## 1. 输入/输出约定

## 1.1 输入 JSON
```json
{
  "height_cm": 175,
  "gender": "neutral",
  "proportion_style": "realistic",
  "measurements": {
    "shoulder_width_cm": 43,
    "torso_length_cm": 52,
    "upper_arm_length_cm": 30,
    "lower_arm_length_cm": 27,
    "thigh_length_cm": 43,
    "calf_length_cm": 40,
    "chest_circumference_cm": 94,
    "waist_circumference_cm": 80,
    "hip_circumference_cm": 95
  }
}
```

## 1.2 输出内容
- `skeleton.json`：骨架层级、bind pose、骨长、ROM。
- `body.glb`：可渲染网格（低中模）。
- `report.json`：尺寸误差、体积变化、自交统计。

---

## 2. 参数归一化与约束

定义相对参数：
- `r_shoulder = shoulder_width_cm / height_cm`
- `r_torso = torso_length_cm / height_cm`
- 其余长度、围度同理。

建议区间（可配置）：
- `r_shoulder ∈ [0.20, 0.30]`
- `r_torso ∈ [0.26, 0.36]`
- `r_upper_arm ∈ [0.15, 0.21]`
- `r_lower_arm ∈ [0.14, 0.20]`
- `r_thigh ∈ [0.20, 0.28]`
- `r_calf ∈ [0.18, 0.26]`

裁剪策略：
1. 缺失值 → 默认统计比例填充。
2. 超界值 → clamp 到边界。
3. 全局一致性修正：
   - 若 `torso + thigh + calf` 偏离身高主链过大，按权重回拉。

---

## 3. 骨架生成算法

## 3.1 关节树
`Root -> Pelvis -> Spine1 -> Spine2 -> Neck -> Head`

左右链：
- 上肢：`Spine2 -> Clavicle -> UpperArm -> LowerArm -> HandStub`
- 下肢：`Pelvis -> Thigh -> Calf -> Foot`

> V1 保留 `HandStub`，只作为末端占位，不展开手指。

## 3.2 骨长公式（示意）
- `L_upper_arm = r_upper_arm * height_cm`
- `L_lower_arm = r_lower_arm * height_cm`
- `L_thigh = r_thigh * height_cm`
- `L_calf = r_calf * height_cm`

脊柱分配：
- `L_spine1 = 0.45 * L_torso`
- `L_spine2 = 0.40 * L_torso`
- `L_neck  = 0.15 * L_torso`

## 3.3 关节 ROM（角度）
- Elbow: flex `[0, 145]`, twist `[-60, 60]`
- Knee: flex `[0, 135]`, hyperext `<= 5`
- Shoulder: pitch `[-120, 120]`, yaw `[-90, 90]`, roll `[-90, 90]`
- Hip: pitch `[-120, 45]`, yaw `[-45, 45]`, roll `[-45, 45]`

---

## 4. 网格生成（模板法）

## 4.1 资源准备
- `template/body_neutral.glb`：中性人体模板（无手趾脸细节）。
- `template/body_blendshape.bin`：形体基（肩宽、腿长、胸围等主因子）。

## 4.2 变形流程
1. 根据归一化参数求 blendshape 权重 `w`。
2. 顶点更新：`V' = V0 + Σ(w_i * ΔV_i)`。
3. 对局部段（上臂、前臂、大腿、小腿）再做轴向缩放对齐骨长。
4. 平滑边界环，防止节段交界硬折。

## 4.3 绑定
- 初版自动权重：最近骨 + 热扩散平滑。
- 关键关节（肩/髋/膝/肘）做人审权重模板覆盖。

---

## 5. 姿态修正（最小集合）

触发器：
- `elbow_flex > 90°`：肘窝内侧收缩 + 外侧轻微鼓起。
- `knee_flex > 90°`：膝前体积补偿。
- `shoulder_abduction > 70°`：肩峰区域上提，减少塌陷。

实现：
- 每个触发器对应一个 corrective shape，权重为分段线性函数。

---

## 6. 评估与验收

## 6.1 静态尺寸
- 9 项核心测量误差 `<= 2%`。

## 6.2 动态体积
- 肩、肘、髋、膝局部体积变化率绝对值 `<= 8%`。

## 6.3 网格质量
- 自交三角形数 `= 0`（标准动作集下）。
- 非流形边 `= 0`。

---

## 7. 伪代码（TypeScript）

```ts
function buildHumanModel(input: HumanInput): BuildResult {
  const p = normalizeAndClamp(input);
  const skeleton = buildSkeleton(p);

  const mesh = loadTemplateMesh("template/body_neutral.glb");
  const weights = solveBlendshapeWeights(p);
  let deformed = applyBlendshapes(mesh, weights);
  deformed = alignSegmentsToBoneLengths(deformed, skeleton);

  const skin = bindSkinning(deformed, skeleton);
  const corrected = attachPoseCorrectives(skin, skeleton);

  const report = validateModel(corrected, skeleton);
  return { skeleton, model: corrected, report };
}
```

---

## 8. 开发排期（2~4 周）

- Week 1：参数归一化、骨架生成、JSON I/O。
- Week 2：模板形变与自动绑定跑通。
- Week 3：关节修正 + 评估器（误差/自交）。
- Week 4：动作集回归与导出工具链。

---

## 9. 下一步任务拆单（可直接建 issue）

1. `feat: param normalizer + clamp`
2. `feat: skeleton builder with ROM`
3. `feat: template morph pipeline`
4. `feat: auto skinning + joint mask`
5. `feat: pose corrective driver`
6. `feat: validator and report exporter`
