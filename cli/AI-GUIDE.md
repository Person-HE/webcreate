# WebCreate CLI — AI 调用指南

## 命令

```bash
cd D:\project\webcreate
node cli/bin.js image <input.json> -o out.png [-w 宽] [-h 高] [-b 背景色]
node cli/bin.js video <input.json> -o out.webm --fps 24 -d 秒数
node cli/bin.js gif   <input.json> -o out.gif  [-d 秒数]
```

## 输入 JSON 模板

```json
{
  "canvasWidth": 1280,
  "canvasHeight": 800,
  "backgroundColor": "#fef9ec",
  "layers": [
    {
      "id": "l1",
      "name": "main",
      "visible": true,
      "elements": [
        {
          "id": "唯一id必须",
          "type": "rectangle | ellipse | diamond | line | arrow | free_draw | text | image",
          "x": 0, "y": 0, "width": 100, "height": 100,
          "angle": 0,
          "strokeColor": "#57534e",
          "backgroundColor": "#fef3c7",
          "fillStyle": "hachure | cross-hatch | solid | none",
          "strokeWidth": 3,
          "strokeStyle": "solid | dashed | dotted",
          "roughness": 1.4,
          "seed": 42,
          "opacity": 100,
          "cornerRadius": 12,
          "strokeSharpness": "round",
          "layerId": "l1",
          "text": "文字内容（text 类型）",
          "fontSize": 32,
          "fontFamily": "Virgil",
          "textAlign": "left | center | right",
          "points": [[x, y, 笔压], ...]（free_draw 类型，绝对坐标）
        }
      ]
    }
  ],
  "animationConfig": {
    "fps": 24,
    "duration": 2,
    "easingConfig": {
      "position": "easeInOutCubic | spring | gravity | easeOutBounce | ... 33种",
      "scale": "easeOutBack",
      "rotation": "easeInOutCubic",
      "opacity": "easeInOutSine",
      "springConfig": { "mass": 1, "stiffness": 170, "damping": 12 },
      "gravityConfig": { "gravity": 9.8, "bounceRestitution": 0.5 },
      "stagger": { "enabled": true, "delayPerElement": 0.08, "maxDelay": 0.4 }
    }
  }
}
```

## 风格速查

- 手绘插画：roughness 1.2-2.2 + hachure/cross-hatch 填充 + Virgil 字体
- 漫画：黑色粗边框分格 + 几何角色 + 椭圆气泡 + Virgil 文字
- 图表：矩形柱体 + line 折线 + ellipse 环形 + 图例色块
- 速写笔迹：free_draw + strokeWidth 8-16（笔压在 points 第三位）
- 透明底：backgroundColor 传 "transparent"，输出 png/webp

## 动画速查

- 视频：layers 即关键帧（首层=起点，末层=终点），同 id 元素自动插值
- 弹跳落地：position: "gravity" + gravityConfig
- 弹性过冲：position/scale: "spring" 或 "easeOutBack"/"easeOutElastic"
- 依次出现：stagger.enabled: true
- GIF：同样结构，用 gif 命令导出

## 注意

- 元素 id 全局唯一且两帧间一致（morph 的前提）
- 视频/动图至少 2 个可见图层（关键帧）
- 多于 2 层时按层序分段插值（逐帧动画）
- 本机无完整 ffmpeg 时输出 .webm（自动回退）；装 ffmpeg 后 .mp4
- 中文用系统字体渲染（Virgil 只覆盖拉丁字符），不影响显示