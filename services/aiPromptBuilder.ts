// AI Prompt Builder - High-quality prompts based on development documentation
// All prompts are generated strictly according to the AI绘图JSON生成规范.md

import { LLMMessage } from './aiClient';

// ============================================================
// System Prompt: Core specification extracted from the doc
// ============================================================
const SYSTEM_PROMPT = `你是一个专业的手绘风格图形生成AI。你的任务是根据用户的描述，生成符合 WebCreate 画布规范的 JSON 数据。

## 严格规则

### 1. JSON 顶层结构
\`\`\`json
{
  "layers": [{ "id": "layer-1", "name": "AI 生成", "visible": true, "elements": [...] }],
  "description": "描述文字"
}
\`\`\`

### 2. 元素通用属性
每个元素必须包含：id, type, x, y, width, height, strokeColor, backgroundColor, fillStyle, strokeWidth, strokeStyle, roughness, seed, opacity, cornerRadius, strokeSharpness

### 3. 元素类型
- "rectangle": 矩形（有 cornerRadius）
- "ellipse": 椭圆
- "diamond": 菱形
- "line": 直线（width/height 是终点偏移量）
- "arrow": 箭头
- "text": 文本（需要 text, fontSize, fontFamily, textAlign）
- "free_draw": 自由绘制/手绘线条（需要 points 数组）—— 最核心的类型
- "image": 图片（需要 imageUrl）

### 4. free_draw 的 points 格式
\`\`\`
[[x, y, pressure], [x, y, pressure], ...]
\`\`\`
- x, y 是画布绝对坐标（不是相对偏移）
- pressure 是压力值 0-1，影响线条粗细
- 元素的 x = 所有点最小X，y = 所有点最小Y，width = maxX-minX，height = maxY-minY
- 点密度：每 3-5 像素一个点
- 闭合形状：首尾点差距 < 5px

### 5. 手绘抖动模拟
在理想坐标上叠加高斯噪声：
- 精细线条（眼线、细节）: wobble 1.0-1.5
- 普通线条（轮廓、边框）: wobble 2.0-2.5
- 粗犷线条（树干、山体）: wobble 2.5-3.5
- 大范围形状（云朵、山）: wobble 3.0-4.0

### 6. 压力曲线
- 起笔阶段(前15%): 0.6 → 1.0
- 中间阶段(15%-85%): ≈1.0，微波动 ±0.05
- 收笔阶段(后15%): 1.0 → 0.5
- 闭合形状: 起=0.7, 中=1.0, 收=0.7

### 7. 画布坐标系
- 原点左上角 (0,0)，X向右，Y向下
- 默认画布 1920×1080，中心 (960, 540)
- 天空区域 Y: 0-400，中景 Y: 300-700，地面 Y: 600-1080

### 8. 颜色系统
暖色系: 描边#1f2937, 肤色#FDE68A, 腮红#FCA5A5, 太阳#FCD34D, 草地#86EFAC
冷色系: 主色#3b82f6, 浅底#dbeafe, 辅助#8b5cf6
自然系: 天空#93C5FD, 树叶#4ADE80, 树干#D97706, 山体#6B7280, 水面#3B82F6

### 9. fillStyle
"none"=无填充, "solid"=实心, "hachure"=斜线手绘, "cross-hatch"=交叉线手绘

### 10. 分层原则
背景元素放前面（先渲染被覆盖），远景→近景

### 11. 性能约束
- 每个 free_draw 元素 20-80 个点，不超过 200 个
- 单次生成不超过 30 个元素
- 避免大量重叠实心填充

### 12. 常见物体推荐参数
- 人脸轮廓: free_draw, solid, strokeWidth 2.5, roughness 1, wobble 2.5
- 眼睛: free_draw, solid, strokeWidth 1.5, roughness 1, wobble 1.5
- 嘴巴/眉毛: free_draw, none, strokeWidth 2.5, roughness 1, wobble 1.5
- 头发: free_draw, none, strokeWidth 3, roughness 1, wobble 2.5
- 树干: free_draw/rectangle, solid, strokeWidth 2, roughness 1, wobble 2
- 树冠: free_draw/ellipse, solid, strokeWidth 2, roughness 1, wobble 3
- 房屋墙壁: free_draw/rectangle, solid, strokeWidth 2.5, roughness 1, wobble 2.5
- 屋顶: free_draw, solid, strokeWidth 2.5, roughness 1, wobble 2.5
- 太阳: ellipse, solid, strokeWidth 2.5, roughness 1
- 云朵: free_draw(多椭圆), solid, strokeWidth 2, roughness 1, wobble 2.5
- 山: free_draw, hachure, strokeWidth 2, roughness 1, wobble 3
- 花-花瓣: free_draw/ellipse, solid, strokeWidth 1.5, roughness 1, wobble 2
- 花-茎: free_draw, none, strokeWidth 3, roughness 1, wobble 2
- 猫-身体: free_draw, solid, strokeWidth 2.5, roughness 1, wobble 2.5
- 海浪: free_draw, none, strokeWidth 2.5, roughness 1, wobble 2
- 背景天空/地面: rectangle, solid, strokeWidth 0, roughness 0
- 文字标题: text, none, strokeWidth 1, roughness 0

## 输出要求
1. 只输出纯 JSON，不要包含 markdown 代码块标记
2. 不要输出任何解释性文字
3. 确保 JSON 格式完全合法
4. 所有坐标和尺寸必须是整数
5. seed 值使用随机正整数`;

// ============================================================
// User prompt builder
// ============================================================
function buildUserPrompt(userDescription: string, canvasWidth: number, canvasHeight: number): string {
  return `请根据以下描述生成手绘风格的 WebCreate 画布 JSON 数据。

画布尺寸：${canvasWidth} × ${canvasHeight}
画布中心：(${Math.floor(canvasWidth / 2)}, ${Math.floor(canvasHeight / 2)})

用户描述：${userDescription}

请生成完整的 JSON，包含所有必要的图层和元素。确保：
1. 先画背景（天空、地面），再画远景，最后画近景
2. 不规则形状使用 free_draw 类型，加入手绘抖动
3. 压力值模拟真人手绘（起笔轻→中间重→收笔轻）
4. 颜色使用柔和的手绘风格配色
5. 所有 free_draw 的 points 使用画布绝对坐标
6. 闭合形状首尾点接近重合`;
}

// ============================================================
// Build messages for LLM
// ============================================================
export function buildDrawingPrompt(
  userDescription: string,
  canvasSize: { width: number; height: number }
): LLMMessage[] {
  return [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: buildUserPrompt(userDescription, canvasSize.width, canvasSize.height) },
  ];
}

// ============================================================
// Parse LLM response to extract JSON
// ============================================================
export function parseAIResponse(content: string): {
  layers: Array<{
    id: string;
    name: string;
    visible: boolean;
    elements: any[];
  }>;
  description: string;
} {
  // Try to extract JSON from the response
  let jsonStr = content.trim();

  // Remove markdown code block markers if present
  const codeBlockMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonStr = codeBlockMatch[1].trim();
  }

  // Try to find JSON object in the response
  const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonStr = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (!parsed.layers || !Array.isArray(parsed.layers)) {
      throw new Error('JSON 缺少 layers 数组');
    }

    // Ensure each layer has required fields
    for (const layer of parsed.layers) {
      if (!layer.id) layer.id = `layer-${Math.random().toString(36).slice(2, 8)}`;
      if (!layer.name) layer.name = 'AI 生成';
      if (layer.visible === undefined) layer.visible = true;
      if (!layer.elements) layer.elements = [];

      // Validate and fix elements
      for (const el of layer.elements) {
        if (!el.id) el.id = `elem-${Math.random().toString(36).slice(2, 8)}`;
        if (!el.type) el.type = 'rectangle';
        if (typeof el.x !== 'number') el.x = 0;
        if (typeof el.y !== 'number') el.y = 0;
        if (typeof el.width !== 'number') el.width = 100;
        if (typeof el.height !== 'number') el.height = 100;
        if (!el.strokeColor) el.strokeColor = '#1f2937';
        if (!el.backgroundColor) el.backgroundColor = 'transparent';
        if (!el.fillStyle) el.fillStyle = 'none';
        if (typeof el.strokeWidth !== 'number') el.strokeWidth = 2;
        if (!el.strokeStyle) el.strokeStyle = 'solid';
        if (typeof el.roughness !== 'number') el.roughness = 1;
        if (typeof el.seed !== 'number') el.seed = Math.floor(Math.random() * 100000);
        if (typeof el.opacity !== 'number') el.opacity = 100;
        if (typeof el.cornerRadius !== 'number') el.cornerRadius = 0;
        if (!el.strokeSharpness) el.strokeSharpness = 'round';

        // Validate free_draw points
        if (el.type === 'free_draw' && el.points) {
          el.points = el.points.map((p: any) => {
            if (Array.isArray(p) && p.length >= 2) {
              return [
                Math.round(p[0]),
                Math.round(p[1]),
                typeof p[2] === 'number' ? Math.max(0, Math.min(1, p[2])) : 0.8,
              ];
            }
            return p;
          });
        }
      }
    }

    if (!parsed.description) {
      parsed.description = 'AI 生成的手绘风格图形';
    }

    return parsed;
  } catch (e) {
    throw new Error(`JSON 解析失败: ${e instanceof Error ? e.message : '未知错误'}`);
  }
}
