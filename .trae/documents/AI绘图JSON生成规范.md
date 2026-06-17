# WebCreate AI 绘图 JSON 生成规范

> 本文档定义了 WebCreate 绘图应用中 AI 绘图功能的完整 JSON 输出格式规范。
> AI（大语言模型）应根据此文档生成符合格式的 JSON 代码，以在 WebCreate 画布上渲染出预期的手绘风格图形。

---

## 一、JSON 顶层结构

```json
{
  "layers": [
    {
      "id": "string",
      "name": "string",
      "visible": boolean,
      "elements": [ Element, Element, ... ]
    }
  ],
  "description": "string"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `layers` | Array | ✅ | 图层数组，至少包含1个图层 |
| `description` | string | ❌ | 生成结果的文字描述 |

---

## 二、图层（Layer）结构

```json
{
  "id": "layer-1",
  "name": "AI 生成",
  "visible": true,
  "elements": []
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | string | ✅ | - | 图层唯一标识，建议格式 `layer-{n}` |
| `name` | string | ✅ | - | 图层名称，如 `"AI 生成"`、`"背景"` |
| `visible` | boolean | ❌ | `true` | 图层是否可见 |
| `elements` | Array | ✅ | - | 该图层包含的元素数组 |

---

## 三、元素（Element）结构

### 3.1 通用属性（所有元素共有）

```json
{
  "id": "elem-1",
  "type": "rectangle",
  "x": 100,
  "y": 200,
  "width": 300,
  "height": 200,
  "angle": 0,
  "strokeColor": "#1f2937",
  "backgroundColor": "#FEF3C7",
  "fillStyle": "solid",
  "strokeWidth": 2.5,
  "strokeStyle": "solid",
  "roughness": 1,
  "seed": 42,
  "opacity": 100,
  "cornerRadius": 0,
  "strokeSharpness": "round"
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `id` | string | ✅ | - | 元素唯一标识，建议格式 `elem-{n}` |
| `type` | string | ✅ | - | 元素类型，见 3.2 |
| `x` | number | ✅ | `0` | 元素左上角 X 坐标（画布坐标系，原点在左上角） |
| `y` | number | ✅ | `0` | 元素左上角 Y 坐标 |
| `width` | number | ✅ | `0` | 元素宽度（像素） |
| `height` | number | ✅ | `0` | 元素高度（像素） |
| `angle` | number | ❌ | `0` | 旋转角度（度数，顺时针） |
| `strokeColor` | string | ❌ | `"#000000"` | 描边颜色，CSS 颜色值 |
| `backgroundColor` | string | ❌ | `"transparent"` | 填充颜色，CSS 颜色值或 `"transparent"` |
| `fillStyle` | string | ❌ | `"none"` | 填充样式，可选值见 3.3 |
| `strokeWidth` | number | ❌ | `2` | 描边宽度（像素），手绘线条建议 2-3，精细线条 1-1.5 |
| `strokeStyle` | string | ❌ | `"solid"` | 描边样式，可选值见 3.4 |
| `roughness` | number | ❌ | `1` | 手绘粗糙度 0-2，0=精确几何，1=轻微手绘感，2=明显手绘 |
| `seed` | number | ❌ | 随机数 | 随机种子，相同 seed 渲染结果一致 |
| `opacity` | number | ❌ | `100` | 不透明度 0-100 |
| `cornerRadius` | number | ❌ | `0` | 圆角半径（仅矩形有效） |
| `strokeSharpness` | string | ❌ | `"round"` | 描边锐度，`"round"` 或 `"sharp"` |

### 3.2 元素类型

| type 值 | 说明 | 特有属性 |
|---------|------|----------|
| `"rectangle"` | 矩形 | `cornerRadius` |
| `"ellipse"` | 椭圆 | - |
| `"diamond"` | 菱形 | - |
| `"line"` | 直线 | `width`/`height` 表示终点偏移量 |
| `"arrow"` | 箭头 | `width`/`height` 表示终点偏移量 |
| `"text"` | 文本 | `text`, `fontSize`, `fontFamily`, `textAlign` |
| `"free_draw"` | 自由绘制（手绘线条） | `points` |
| `"image"` | 图片 | `imageUrl` |

### 3.3 fillStyle 填充样式

| 值 | 效果 |
|----|------|
| `"none"` | 无填充（仅描边） |
| `"solid"` | 实心填充 |
| `"hachure"` | 斜线填充（手绘风格） |
| `"cross-hatch"` | 交叉线填充（手绘风格） |

### 3.4 strokeStyle 描边样式

| 值 | 效果 |
|----|------|
| `"solid"` | 实线 |
| `"dashed"` | 虚线 |
| `"dotted"` | 点线 |

---

## 四、特殊元素类型详解

### 4.1 文本元素（text）

```json
{
  "id": "elem-text-1",
  "type": "text",
  "x": 500,
  "y": 300,
  "width": 400,
  "height": 50,
  "strokeColor": "#1f2937",
  "backgroundColor": "transparent",
  "fillStyle": "none",
  "strokeWidth": 1,
  "strokeStyle": "solid",
  "roughness": 0,
  "seed": 123,
  "opacity": 100,
  "cornerRadius": 0,
  "strokeSharpness": "round",
  "text": "Hello World",
  "fontSize": 32,
  "fontFamily": "Virgil",
  "textAlign": "center"
}
```

| 特有字段 | 类型 | 必填 | 默认值 | 说明 |
|----------|------|------|--------|------|
| `text` | string | ✅ | - | 文本内容，支持 `\n` 换行 |
| `fontSize` | number | ❌ | `24` | 字号（像素），标题建议 36-56，正文 20-28 |
| `fontFamily` | string | ❌ | `"Virgil"` | 字体，推荐 `"Virgil"`（手绘风格） |
| `textAlign` | string | ❌ | `"left"` | 对齐方式：`"left"` / `"center"` / `"right"` |

**width 估算**：`text.length * fontSize * 0.6`（英文），`text.length * fontSize`（中文）

### 4.2 自由绘制元素（free_draw）—— 最核心的类型

自由绘制是 WebCreate 手绘风格的核心。所有不规则形状（脸、树、云、花等）都通过 `free_draw` 实现。

```json
{
  "id": "elem-freedraw-1",
  "type": "free_draw",
  "x": 100,
  "y": 100,
  "width": 200,
  "height": 200,
  "strokeColor": "#1f2937",
  "backgroundColor": "#FDE68A",
  "fillStyle": "solid",
  "strokeWidth": 2.5,
  "strokeStyle": "solid",
  "roughness": 1,
  "seed": 42,
  "opacity": 100,
  "cornerRadius": 0,
  "strokeSharpness": "round",
  "points": [
    [150, 120, 0.7],
    [154, 118, 0.8],
    [158, 117, 1.0],
    ...
  ]
}
```

#### points 数组格式

```
[[x, y, pressure], [x, y, pressure], ...]
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `x` | number | 点的绝对 X 坐标（画布坐标系） |
| `y` | number | 点的绝对 Y 坐标（画布坐标系） |
| `pressure` | number | 压力值 0-1，影响线条粗细。0.3=极细，1.0=最粗 |

#### ⚠️ 关键规则

1. **坐标是绝对坐标**：`points` 中的 `[x, y]` 是画布上的绝对位置，不是相对于元素 `x, y` 的偏移
2. **x, y, width, height 是包围盒**：`x` = 所有点中最小 X，`y` = 所有点中最小 Y，`width` = maxX - minX，`height` = maxY - minY
3. **点密度**：建议每 3-5 像素一个点，太少会显得折线感强，太多则数据量大
4. **闭合形状**：首尾点应接近重合（差距 < 5px），以实现闭合填充效果
5. **压力曲线**：模拟真人手绘，起笔轻（0.5-0.7）→ 中间重（0.9-1.0）→ 收笔轻（0.4-0.6）

#### 手绘抖动（Wobble）模拟

真人手绘线条不会是完美直线，会有微小抖动。生成 points 时应加入高斯噪声：

```
实际x = 理想x + gaussianRandom(0, wobbleAmount)
实际y = 理想y + gaussianRandom(0, wobbleAmount)
```

| 线条类型 | wobbleAmount 建议值 |
|----------|-------------------|
| 精细线条（眼线、细节） | 1.0 - 1.5 |
| 普通线条（轮廓、边框） | 2.0 - 2.5 |
| 粗犷线条（树干、山体） | 2.5 - 3.5 |
| 大范围形状（云朵、山） | 3.0 - 4.0 |

#### 压力曲线模板

```
起笔阶段 (前 15%): pressure 从 0.6 线性增加到 1.0
中间阶段 (15%-85%): pressure ≈ 1.0，加微小随机波动 ±0.05
收笔阶段 (后 15%): pressure 从 1.0 线性降低到 0.5
闭合形状: 起笔=0.7, 中间=1.0, 收笔=0.7
```

---

## 五、画布坐标系

- **原点**：画布左上角 `(0, 0)`
- **X 轴**：向右为正
- **Y 轴**：向下为正
- **默认画布尺寸**：1920 × 1080
- **画布中心**：`(960, 540)`

### 坐标规划建议

| 区域 | X 范围 | Y 范围 | 用途 |
|------|--------|--------|------|
| 天空 | 0-1920 | 0-400 | 太阳、云朵、星星 |
| 中景 | 0-1920 | 300-700 | 房屋、树木、人物 |
| 地面 | 0-1920 | 600-1080 | 草地、道路、水面 |
| 中心区域 | 400-1520 | 200-880 | 主要内容 |

---

## 六、颜色系统

### 6.1 推荐配色方案

#### 暖色系（可爱/温馨风格）
| 用途 | 颜色 | 色值 |
|------|------|------|
| 描边 | 深灰 | `#1f2937` |
| 肤色 | 淡黄 | `#FDE68A` |
| 腮红 | 粉红 | `#FCA5A5` |
| 太阳 | 金黄 | `#FCD34D` |
| 草地 | 浅绿 | `#86EFAC` |

#### 冷色系（商务/科技风格）
| 用途 | 颜色 | 色值 |
|------|------|------|
| 主色 | 蓝色 | `#3b82f6` |
| 浅底 | 浅蓝 | `#dbeafe` |
| 辅助 | 紫色 | `#8b5cf6` |
| 浅紫 | 淡紫 | `#ede9fe` |
| 成功 | 绿色 | `#10b981` |

#### 自然系（风景/场景风格）
| 用途 | 颜色 | 色值 |
|------|------|------|
| 天空 | 浅蓝 | `#93C5FD` |
| 树叶 | 绿色 | `#4ADE80` |
| 树干 | 棕色 | `#D97706` |
| 山体 | 灰色 | `#6B7280` |
| 水面 | 蓝色 | `#3B82F6` |

### 6.2 透明度处理

- 背景色设为 `"transparent"` 表示不填充
- 需要半透明效果时，使用 `opacity` 字段（0-100）
- 远景/背景元素建议 `opacity: 60-80`
- 前景/主要元素建议 `opacity: 90-100`

---

## 七、常见图形的生成模板

### 7.1 手绘圆形/椭圆

生成方式：在圆周上均匀放置航点（waypoint），然后加入高斯抖动。

```
航点数量 = max(24, floor(半径 * 0.8))
每个航点:
  angle = i / numWaypoints * 2π
  x = cx + cos(angle) * (r + gaussianRandom(0, r * 0.02))
  y = cy + sin(angle) * (r + gaussianRandom(0, r * 0.02))
```

然后在相邻航点之间插值，间距约 4px，每个插值点加入 wobble 抖动。

### 7.2 手绘直线/曲线

通过控制点（waypoint）定义路径，使用 Catmull-Rom 样条插值生成平滑曲线，然后加入抖动。

```
控制点 → Catmull-Rom 插值(每段8-10个点) → 加 wobble → 生成 points
```

### 7.3 手绘矩形

4个角作为航点，每条边插入中间点并加入抖动：

```json
{
  "type": "free_draw",
  "points": [
    [x, y+gaussianRandom(0,2), 0.7],
    [x+w*0.5, y+gaussianRandom(0,1.5), 1.0],
    [x+w, y+gaussianRandom(0,2), 0.7],
    [x+w+gaussianRandom(0,2), y+h*0.5, 1.0],
    [x+w+gaussianRandom(0,2), y+h, 0.7],
    [x+w*0.5+gaussianRandom(0,1.5), y+h, 1.0],
    [x+gaussianRandom(0,2), y+h, 0.7],
    [x+gaussianRandom(0,2), y+h*0.5, 1.0],
    [x, y+gaussianRandom(0,2), 0.7]
  ]
}
```

### 7.4 手绘三角形

3个顶点作为航点，闭合连接：

```json
{
  "type": "free_draw",
  "points": [
    [顶点x, 顶点y, 0.7],
    [左下x, 左下y, 1.0],
    [右下x, 右下y, 1.0],
    [顶点x±2, 顶点y±2, 0.7]
  ]
}
```

---

## 八、完整示例

### 示例1：简单的笑脸

```json
{
  "layers": [
    {
      "id": "layer-1",
      "name": "AI 生成",
      "visible": true,
      "elements": [
        {
          "id": "elem-bg",
          "type": "rectangle",
          "x": 0, "y": 0, "width": 1920, "height": 1080,
          "strokeColor": "transparent",
          "backgroundColor": "#E0F2FE",
          "fillStyle": "solid",
          "strokeWidth": 0,
          "roughness": 0,
          "seed": 1,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round"
        },
        {
          "id": "elem-face",
          "type": "free_draw",
          "x": 710, "y": 190, "width": 500, "height": 620,
          "strokeColor": "#1f2937",
          "backgroundColor": "#FDE68A",
          "fillStyle": "solid",
          "strokeWidth": 2.5,
          "strokeStyle": "solid",
          "roughness": 1,
          "seed": 42,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round",
          "points": [
            [960, 190, 0.7], [985, 192, 0.8], [1010, 198, 0.9], [1035, 208, 1.0],
            [1058, 222, 1.0], [1078, 240, 1.0], [1095, 262, 1.0], [1108, 288, 1.0],
            [1118, 318, 1.0], [1124, 350, 1.0], [1126, 385, 1.0], [1124, 420, 1.0],
            [1118, 455, 1.0], [1108, 488, 1.0], [1095, 518, 1.0], [1078, 545, 1.0],
            [1058, 568, 1.0], [1035, 586, 1.0], [1010, 600, 1.0], [985, 610, 1.0],
            [960, 614, 0.9], [935, 610, 0.9], [910, 600, 1.0], [885, 586, 1.0],
            [862, 568, 1.0], [842, 545, 1.0], [825, 518, 1.0], [812, 488, 1.0],
            [802, 455, 1.0], [796, 420, 1.0], [794, 385, 1.0], [796, 350, 1.0],
            [802, 318, 1.0], [812, 288, 1.0], [825, 262, 1.0], [842, 240, 1.0],
            [862, 222, 1.0], [885, 208, 1.0], [910, 198, 0.9], [935, 192, 0.8],
            [960, 190, 0.7]
          ]
        },
        {
          "id": "elem-left-eye",
          "type": "free_draw",
          "x": 870, "y": 340, "width": 50, "height": 50,
          "strokeColor": "#1f2937",
          "backgroundColor": "#1f2937",
          "fillStyle": "solid",
          "strokeWidth": 1.5,
          "strokeStyle": "solid",
          "roughness": 1,
          "seed": 43,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round",
          "points": [
            [895, 345, 0.7], [900, 342, 0.8], [907, 341, 1.0], [913, 343, 1.0],
            [917, 348, 1.0], [918, 355, 1.0], [916, 362, 1.0], [912, 367, 1.0],
            [906, 370, 1.0], [899, 369, 1.0], [893, 365, 1.0], [889, 359, 1.0],
            [888, 352, 1.0], [890, 346, 0.8], [895, 345, 0.7]
          ]
        },
        {
          "id": "elem-right-eye",
          "type": "free_draw",
          "x": 1000, "y": 340, "width": 50, "height": 50,
          "strokeColor": "#1f2937",
          "backgroundColor": "#1f2937",
          "fillStyle": "solid",
          "strokeWidth": 1.5,
          "strokeStyle": "solid",
          "roughness": 1,
          "seed": 44,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round",
          "points": [
            [1025, 345, 0.7], [1030, 342, 0.8], [1037, 341, 1.0], [1043, 343, 1.0],
            [1047, 348, 1.0], [1048, 355, 1.0], [1046, 362, 1.0], [1042, 367, 1.0],
            [1036, 370, 1.0], [1029, 369, 1.0], [1023, 365, 1.0], [1019, 359, 1.0],
            [1018, 352, 1.0], [1020, 346, 0.8], [1025, 345, 0.7]
          ]
        },
        {
          "id": "elem-mouth",
          "type": "free_draw",
          "x": 890, "y": 470, "width": 140, "height": 60,
          "strokeColor": "#dc2626",
          "backgroundColor": "transparent",
          "fillStyle": "none",
          "strokeWidth": 2.5,
          "strokeStyle": "solid",
          "roughness": 1,
          "seed": 45,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round",
          "points": [
            [895, 480, 0.5], [910, 495, 0.7], [930, 510, 0.9], [960, 520, 1.0],
            [990, 510, 0.9], [1010, 495, 0.7], [1025, 480, 0.5]
          ]
        }
      ]
    }
  ],
  "description": "一个简单的笑脸"
}
```

### 示例2：带背景的场景（房子+树+太阳）

```json
{
  "layers": [
    {
      "id": "layer-1",
      "name": "场景",
      "visible": true,
      "elements": [
        {
          "id": "elem-sky",
          "type": "rectangle",
          "x": 0, "y": 0, "width": 1920, "height": 1080,
          "strokeColor": "transparent",
          "backgroundColor": "#E0F2FE",
          "fillStyle": "solid",
          "strokeWidth": 0,
          "roughness": 0,
          "seed": 1,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round"
        },
        {
          "id": "elem-ground",
          "type": "rectangle",
          "x": 0, "y": 700, "width": 1920, "height": 380,
          "strokeColor": "transparent",
          "backgroundColor": "#86EFAC",
          "fillStyle": "solid",
          "strokeWidth": 0,
          "roughness": 0,
          "seed": 2,
          "opacity": 80,
          "cornerRadius": 0,
          "strokeSharpness": "round"
        },
        {
          "id": "elem-sun",
          "type": "ellipse",
          "x": 1450, "y": 100, "width": 120, "height": 120,
          "strokeColor": "#D97706",
          "backgroundColor": "#FCD34D",
          "fillStyle": "solid",
          "strokeWidth": 2.5,
          "roughness": 1,
          "seed": 10,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round"
        },
        {
          "id": "elem-house-wall",
          "type": "rectangle",
          "x": 700, "y": 420, "width": 280, "height": 220,
          "strokeColor": "#1f2937",
          "backgroundColor": "#FEF3C7",
          "fillStyle": "solid",
          "strokeWidth": 2.5,
          "roughness": 1,
          "seed": 20,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round"
        },
        {
          "id": "elem-house-roof",
          "type": "free_draw",
          "x": 670, "y": 280, "width": 340, "height": 145,
          "strokeColor": "#991B1B",
          "backgroundColor": "#FCA5A5",
          "fillStyle": "solid",
          "strokeWidth": 2.5,
          "strokeStyle": "solid",
          "roughness": 1,
          "seed": 21,
          "opacity": 100,
          "cornerRadius": 0,
          "strokeSharpness": "round",
          "points": [
            [675, 422, 0.7], [720, 380, 0.8], [780, 340, 0.9], [840, 305, 1.0],
            [840, 302, 1.0], [900, 340, 0.9], [960, 380, 0.8], [1005, 422, 0.7],
            [990, 418, 0.8], [940, 385, 0.9], [880, 350, 1.0], [840, 330, 1.0],
            [800, 350, 1.0], [740, 385, 0.9], [690, 418, 0.8], [675, 422, 0.7]
          ]
        },
        {
          "id": "elem-tree-trunk",
          "type": "rectangle",
          "x": 350, "y": 480, "width": 40, "height": 160,
          "strokeColor": "#78350F",
          "backgroundColor": "#D97706",
          "fillStyle": "solid",
          "strokeWidth": 2,
          "roughness": 1,
          "seed": 30,
          "opacity": 100,
          "cornerRadius": 4,
          "strokeSharpness": "round"
        },
        {
          "id": "elem-tree-crown",
          "type": "ellipse",
          "x": 280, "y": 340, "width": 180, "height": 160,
          "strokeColor": "#15803D",
          "backgroundColor": "#86EFAC",
          "fillStyle": "solid",
          "strokeWidth": 2,
          "roughness": 1,
          "seed": 31,
          "opacity": 85,
          "cornerRadius": 0,
          "strokeSharpness": "round"
        }
      ]
    }
  ],
  "description": "一栋小房子旁边有棵树，天上有太阳"
}
```

---

## 九、AI 生成最佳实践

### 9.1 元素分层原则

1. **背景元素放前面**（数组前面的元素先渲染，被后面的覆盖）
2. **远景 → 近景**：天空 → 山 → 房子 → 人物
3. **同一物体的部件保持相近顺序**：屋顶 → 墙壁 → 门 → 窗户

### 9.2 手绘风格要点

1. **不要生成完美几何**：所有形状都应加入微小抖动（wobble），roughness 设为 1-2
2. **线条要有粗细变化**：通过 pressure 值控制，起笔收笔细，中间粗
3. **颜色不要太纯**：使用柔和的颜色（如 `#86EFAC` 而非 `#00FF00`）
4. **留白和简化**：手绘风格不需要太多细节，关键特征即可
5. **描边宽度**：轮廓线 2-3px，细节线 1-1.5px，装饰线 1px

### 9.3 性能建议

1. **free_draw 点数控制**：每个元素建议 20-80 个点，不超过 200 个
2. **总元素数**：单次生成建议不超过 30 个元素
3. **避免重叠填充**：多个重叠的实心填充元素会严重影响渲染性能

### 9.4 常见物体推荐参数

| 物体 | type | fillStyle | strokeWidth | roughness | wobble |
|------|------|-----------|-------------|-----------|--------|
| 人脸轮廓 | free_draw | solid | 2.5 | 1 | 2.5 |
| 眼睛 | free_draw | solid | 1.5 | 1 | 1.5 |
| 嘴巴 | free_draw | none | 2.5 | 1 | 1.5 |
| 眉毛 | free_draw | none | 2.5 | 1 | 1.5 |
| 头发 | free_draw | none | 3 | 1 | 2.5 |
| 树干 | free_draw/rectangle | solid | 2 | 1 | 2 |
| 树冠 | free_draw/ellipse | solid | 2 | 1 | 3 |
| 房屋墙壁 | free_draw/rectangle | solid | 2.5 | 1 | 2.5 |
| 屋顶 | free_draw | solid | 2.5 | 1 | 2.5 |
| 窗户 | free_draw/rectangle | solid | 2 | 1 | 1.5 |
| 太阳 | ellipse | solid | 2.5 | 1 | - |
| 太阳光线 | free_draw | none | 2.5 | 1 | 2 |
| 云朵 | free_draw(多个椭圆) | solid | 2 | 1 | 2.5 |
| 山 | free_draw | hachure | 2 | 1 | 3 |
| 花-花瓣 | free_draw/ellipse | solid | 1.5 | 1 | 2 |
| 花-茎 | free_draw | none | 3 | 1 | 2 |
| 猫-身体 | free_draw | solid | 2.5 | 1 | 2.5 |
| 猫-耳朵 | free_draw | solid | 2 | 1 | 1.5 |
| 猫-胡须 | free_draw | none | 1 | 1 | 1.5 |
| 猫-尾巴 | free_draw | none | 3 | 1 | 2.5 |
| 海浪 | free_draw | none | 2.5 | 1 | 2 |
| 背景天空 | rectangle | solid | 0 | 0 | - |
| 背景地面 | rectangle | solid | 0 | 0 | - |
| 文字标题 | text | none | 1 | 0 | - |

---

## 十、JSON 输入导入行为

当 JSON 通过 WebCreate 的"JSON 输入"功能导入时，系统会：

1. **自动居中**：计算所有元素的全局包围盒，将内容整体平移到画布中心
2. **线条优化**：对 `free_draw` 的 `points` 进行重采样（间距 > 8px 时补点）和轻度平滑
3. **创建新图层**：JSON 中的每个 layer 会创建对应的新图层
4. **ID 重新生成**：所有元素和图层的 ID 会被重新分配，避免冲突

因此，AI 生成 JSON 时**不需要**担心内容在画布上的精确居中位置，只需保持元素之间的相对位置关系正确即可。

---

## 十一、关键词映射参考

当前 AI 绘图服务支持以下关键词匹配生成：

| 关键词（中文/英文） | 生成的物体 |
|---------------------|-----------|
| 脸/人/头/face | 人脸（椭圆脸+眼睛+鼻子+嘴巴+眉毛+头发） |
| 猫/小猫/cat | 猫（身体+头+耳朵+眼睛+鼻子+胡须+尾巴） |
| 房子/小屋/家/house | 房子（墙壁+屋顶+门+窗户+烟） |
| 树/tree | 树（树干+树冠） |
| 森林/forest | 多棵树 |
| 太阳/日/sun | 太阳（圆盘+光线） |
| 云/cloud | 云朵（多个重叠椭圆） |
| 山/mountain | 山（三角形+斜线填充） |
| 花/玫瑰/向日葵/flower | 花（花瓣+花心+茎+叶） |
| 花束/bouquet | 多朵花 |
| 海/浪/sea/wave | 海浪（多条波浪线） |

---

## 十二、错误避免

### ❌ 常见错误

1. **free_draw 的 points 使用相对坐标** → 必须使用绝对坐标
2. **x, y, width, height 与 points 不一致** → x/y 必须是 points 的最小值，width/height 必须是范围
3. **闭合形状首尾不相连** → 首尾点差距应 < 5px
4. **所有 roughness 都设为 0** → 失去手绘风格，除文字和背景外建议 ≥ 1
5. **点太稀疏**（间距 > 10px）→ 线条会呈折线状，建议 3-5px 间距
6. **压力值全为 1.0** → 线条无粗细变化，失去手绘感
7. **使用几何类型代替 free_draw** → 简单几何可用 rectangle/ellipse，不规则形状必须用 free_draw
8. **忽略 seed 值** → seed 相同则渲染一致，不同 seed 产生不同随机细节

### ✅ 正确做法

1. 先规划整体布局（画布中心 960,540），再生成各元素坐标
2. 先画背景（天空、地面），再画远景，最后画近景
3. free_draw 元素确保 points 密度足够（每 3-5px 一个点）
4. 模拟手绘抖动：在理想坐标上叠加高斯噪声
5. 模拟压力变化：起笔轻→中间重→收笔轻
6. 保持元素间相对位置，居中由系统自动处理
