<div align="center">

   <picture>
     <source
       media="(prefers-color-scheme: dark)"
       srcset="https://openvid.dev/images/pages/openvid-animation.svg"
     />
     <source
       media="(prefers-color-scheme: light)"
       srcset="https://github.com/user-attachments/assets/c8fb0340-e05d-403e-9805-b1006a6218cc"
     />
     <img
       width="50%"
       alt="openvid"
       src="https://openvid.dev/images/pages/openvid-animation-light.svg"
     />
   </picture>

  ## 在浏览器中，几秒钟创建专业的演示与设备样机
  **录制屏幕或上传视频，添加平滑缩放、设备模型、3D 效果和自定义背景，一键导出电影级演示视频。**

[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](https://nextjs.org)
[![FFmpeg.wasm](https://img.shields.io/badge/FFmpeg.wasm-007808?logo=ffmpeg&logoColor=white)](https://ffmpeg.org)
[![Three.js](https://img.shields.io/badge/Three.js-000000?logo=threedotjs&logoColor=white)](https://threejs.org)
[![简体中文](https://img.shields.io/badge/语言-简体中文-CE1126)](#)
</div>

<div align="center">
   <img width="952" height="550" alt="openvid" src="https://github.com/user-attachments/assets/90c23e69-a542-4887-ab4c-955e6e39e981" />
</div>

---

## 📌 关于本项目（二次开发说明）

> 本仓库是上游项目 **[CristianOlivera1/openvid](https://github.com/CristianOlivera1/openvid)** 的二次开发（fork），由 [@88lin](https://github.com/88lin) 维护。核心的屏幕录制、视频剪辑与导出能力均来自上游，在此基础上做了本地化与「去后端」改造。

**相对上游的主要改动：**

- 🌏 **全面汉化 + 默认中文** —— 新增完整的简体中文语言包（约 1000+ 条 UI 文案），并将**中文设为默认语言**：首次访问即显示中文版；仍可在右上角切换 `English / Español / Русский / 한국어`。
- 🔓 **移除登录 / 账号体系** —— 删除 Google / GitHub / Twitch 登录、登录页与 OAuth 回调，界面不再有登录入口与账号菜单。
- 🧹 **去除 Supabase 依赖，纯本地运行** —— 移除 `@supabase/*`、`resend` 等后端依赖；不再需要任何服务器、数据库或第三方账号。所有录制、项目与素材都保存在**浏览器本地（IndexedDB）**，克隆即用、开箱即跑。

> 想要恢复上游的登录 / 云端能力，可回退对应改动或直接参考上游仓库。感谢上游作者 [Cristian Olivera](https://github.com/CristianOlivera1) 的出色工作 🙏

---

## ✨ 功能特性

### 视频输入
- **屏幕录制** —— 无需安装，直接在浏览器中录屏
- **上传视频** —— 支持 MP4、WebM、QuickTime、MKV

### 样机制作
- **图片套用设备模型（Mockup）**
- **3D 变换**

### 视觉定制

**背景**
- 100+ 预设背景
- 自定义图片或 Unsplash 图库
- 纯色与渐变

### 画布与元素
- **形状** —— 矩形、圆形、三角形
- **文字** —— 自定义字体、颜色与字号
- **SVG** —— 导入矢量图形
- **图片** —— PNG、JPG、WebP 叠加层

### 缩放
- 在时间轴的指定时刻放大 / 缩小
- 速度与缓动控制
- **3D 相机运动** —— 基于兴趣点的倾斜与动态旋转

### 音频
- 多轨道支持
- 按视频时长自动修剪

### 导出

**画质**
- 4K (3840×2160) @ 30fps
- 2K (2560×1440) @ 30fps
- 1080p (1920×1080) @ 30fps
- 720p (1280×720) @ 30fps
- 480p (720×480) @ 24fps

**格式**
- MP4 (H.264)
- WebM（VP9，支持透明背景）
- GIF
- PNG、WEBP、JPG、AVIF

---

## 📸 截图

<img width="1091" height="480" alt="zoom" src="https://github.com/user-attachments/assets/b163c6a6-7946-47a5-9c21-b0b5c1c9c836" />


<table width="100%">
  <tr>
    <td width="60%">
      <a href="https://www.youtube.com/watch?v=BreTDBD_pGY" target="_blank">
        <img
          src="https://github.com/user-attachments/assets/82a82dc8-ce81-4d78-829e-12c9ef096758"
          alt="多轨时间轴"
          width="100%"
        />
      </a>
    </td>
    <td width="40%">
      <img
        src="https://github.com/user-attachments/assets/9053805f-aa96-4a45-8c0e-cddd46df5406"
        alt="编辑器界面"
        width="100%"
      />
    </td>
  </tr>
  <tr>
    <td width="60%">
      <img
        src="https://github.com/user-attachments/assets/a22c3d1b-a3d3-4934-ad6a-2c2542fd6206"
        alt="编辑器界面"
        width="100%"
      />
    </td>
    <td width="40%">
     <img
        src="https://github.com/user-attachments/assets/28ce5648-4085-4503-ac68-d8224f7bcccb"
        alt="编辑器界面"
        width="100%"
      />
    </td>
  </tr>
</table>

---

## 🛠 技术栈

**视频处理**
- FFmpeg.wasm —— 完全在浏览器内渲染
- Canvas API —— 实时预览
- MediaBunny —— 优化的视频处理管线
- Three.js —— 3D 效果
- HTML to Image —— 样机导出

**国际化**
- next-intl —— 多语言路由与文案（默认简体中文）

**本地存储（无需后端）**
- IndexedDB —— 本地保存录制的视频、项目与素材
- LocalStorage —— 用户偏好设置

---

## 🚀 快速开始

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可使用 —— **无需配置任何环境变量或后端账号**。

> 可选：图库搜索（Unsplash / Pexels / Pixabay）等第三方能力需要对应的 API Key，可参考 `.env.example` 自行配置；不配置也不影响核心的录屏与剪辑功能。

生产构建：

```bash
pnpm build
pnpm start
```

---

## 🙌 致谢与上游

- 上游项目：**[CristianOlivera1/openvid](https://github.com/CristianOlivera1/openvid)**（原作者 [Cristian Olivera](https://github.com/CristianOlivera1)）
- 本汉化 / 纯本地版本由 [@88lin](https://github.com/88lin) 二次开发维护

<a href="https://github.com/CristianOlivera1/openvid/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=CristianOlivera1/openvid" />
</a>

---

## 📄 许可证

沿用上游项目的开源许可证，详见 [LICENSE.md](./LICENSE.md)。
