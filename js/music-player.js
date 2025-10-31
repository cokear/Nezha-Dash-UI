/**
 * =================================================================
 * Nezha-UI 音乐播放器模块
 * @description 对接老王eooce的音乐播放器项目,创建音乐播放器,强烈推荐老王音乐播放器,感谢老王!
 * =================================================================
 */  

/**
 * ================================================================
 * 音乐播放器 - 代码概览
 * ================================================================
 * 
 * 代码结构说明：
 * 
 * 第一部分：全局配置变量
 * 第二部分：CSS 样式定义
 * 第三部分：核心变量声明
 * 第四部分：UI 元素创建
 * 第五部分：播放列表功能
 * 第六部分：播放控制功能
 * 第七部分：UI 交互功能
 * 第八部分：主题适配功能
 * 第九部分：事件绑定
 * 第十部分：初始化执行
 * ================================================================
 */

// ================================================================
// 第一部分：全局配置变量
// ================================================================

// 音乐播放器基础配置
window.EnableMusicPlayer = true; // 是否启用音乐播放器（true/false）
window.MusicPlayerBallSize = 50; // 悬浮球尺寸（单位：像素）
window.MusicPlayerAutoCollapse = 2600; // 自动收起面板的延迟时间（单位：毫秒）
window.MusicPlayerTitle = "NeZha Music Player"; // 音乐播放器标题/默认艺术家名称（当文件名无"-"时使用）
window.MusicPlayerAPIUrl = "https://m.claudea.ggff.net/api/music/list"; // 音乐列表API地址
window.MusicPlayerDefaultVolume = 0.2; // 默认音量（范围：0-1）

// GitHub 链接配置
window.MusicPlayerGitHubUrl = "https://github.com/kamanfaiz/Nezha-Dash-UI"; // GitHub仓库链接（留空或false则不显示图标）
window.MusicPlayerGitHubIconSize = 28; // GitHub 图标容器大小（单位：像素）

// 封面配置
window.MusicPlayerCoverList = [ // 封面图片列表（随机分配给歌曲）
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover01.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover02.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover03.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover04.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover05.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover06.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover07.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover08.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover09.jpg",
  "https://cdn.jsdelivr.net/gh/kamanfaiz/Nezha-Dash-UI@main/cover/cover10.jpg",
];

// 视觉效果配置
window.MusicPlayerRotationSpeed = 5; // 唱片旋转速度（数值越大转速越慢，单位：秒/圈）
window.MusicPlayerStrokeWidth = 4.5; // 悬浮球描边宽度（单位：像素，0表示无描边）
window.MusicPlayerStrokeColor = ""; // 悬浮球描边颜色（留空则自动适配主题：暗色模式黑色，亮色模式白色）
window.MusicPlayerOpacity = 0.5; // 播放器面板不透明度（范围：0-1）

// 音波效果配置
window.MusicPlayerWaveStrokeWidth = "2.8px"; // PC端音波圆环宽度
window.MusicPlayerWaveMobileStrokeWidth = "1.8px"; // 移动端音波圆环宽度
window.MusicPlayerWaveSpeed = 2.0; // 音波扩散速度（单位：秒，完整扩散一轮所需时间）
window.MusicPlayerWaveScale = 1.8; // 音波扩散比例（最大扩散倍数）

// UI 图标配置
window.MusicPlayerBallIconSize = 18; // 悬浮球播放/暂停图标尺寸（单位：像素）
window.MusicPlayerExpandedAlbumSize = 70; // 展开面板唱片尺寸（单位：像素，建议比悬浮球大一些）

// ================================================================
// 主函数：音乐播放器初始化
// ================================================================
function initMusicPlayer() {
  if (!window.EnableMusicPlayer) return;

  // ================================================================
  // 第二部分：CSS 样式定义
  // ================================================================
  const styleSheet = document.createElement("style");
  styleSheet.textContent = `
  /* ==================== 动画定义 ==================== */
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  /* 音波扩散动画 */
  @keyframes soundwave {
    from {
      transform: scale(1);
      opacity: 0.95;
    }
    to {
      transform: scale(var(--wave-scale, 1.6));
      opacity: 0;
    }
  }

  /* ==================== 音波容器 ==================== */
  /* 音波容器 - 独立定位在悬浮球下方 */
  .wave-container {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0; /* 位于主面板下方 */
  }

  /* 音波圆环 */
  .wave {
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: var(--wave-stroke-width, 1.8px) solid var(--wave-color);
    pointer-events: none;
    display: none; /* 默认隐藏 */
  }

  /* 仅在收起状态且播放时显示音波动画 */
  .music-player-container:not(.expanded).playing .wave {
    display: block;
    animation: soundwave var(--wave-speed, 2.4s) infinite ease-out;
  }

  /* ==================== 主容器 ==================== */
  .music-player-container {
    position: fixed;
    right: 20px;
    bottom: 20px;
    z-index: 1050;
    display: flex;
    flex-direction: column;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    overflow: visible; /* 允许音波超出容器 */
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.8); /* 默认值，会被 JavaScript 动态更新 */
  }

  .music-player-container.expanded {
    border-radius: 15px;
    width: auto !important;
    height: auto !important;
  }

  /* ==================== 主内容区 ==================== */
  .music-player-main {
    display: flex;
    align-items: center;
    padding: 0;
    gap: 0;
    border-radius: inherit;
    position: relative;
    background: inherit;
    z-index: 1; /* 位于音波之上 */
    overflow: hidden; /* 裁剪内容为圆形 */
  }

  .music-player-container.expanded .music-player-main {
    padding: 10px;
    gap: 12px;
    overflow: visible; /* 展开时允许内容溢出 */
  }

  /* ==================== 悬浮球封面（收起状态） ==================== */
  .music-ball-album {
    position: relative;
    flex-shrink: 0;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    overflow: hidden; /* 裁剪为圆形 */
  }

  .music-player-container.expanded .music-ball-album {
    display: none;
  }

  .music-ball-rotating {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .music-ball-image {
    position: absolute;
    top: 0;
    left: 0;
    object-fit: cover;
    object-position: center;
    width: 100%;
    height: 100%;
    transform: scale(1.001); /* 微调缩放，消除子像素渲染缝隙 */
  }

  .music-ball-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 2;
  }

  .music-ball-album:hover .music-ball-overlay {
    opacity: 1;
  }

  /* ==================== 展开状态封面（唱片效果） ==================== */
  .music-expanded-album {
    position: relative;
    flex-shrink: 0;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
  }

  .music-player-container.expanded .music-expanded-album {
    display: flex;
  }

  .music-expanded-rotating {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s linear;
  }

  .music-expanded-rotating::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: conic-gradient(
      from 88deg,
      transparent 0%,
      rgba(255, 255, 255, 0.4) 8%,
      transparent 18%,
      transparent 50%,
      rgba(255, 255, 255, 0.4) 58%,
      transparent 68%
    );
    pointer-events: none;
    z-index: 1;
  }

  .music-expanded-base {
    position: absolute;
    width: 100%;
    height: 100%;
    background: #1a1a1a;
    border-radius: 50%;
    z-index: 0;
  }

  .music-expanded-image {
    object-fit: cover;
    object-position: center;
    border-radius: 50%;
    width: 55%;
    height: 55%;
    position: relative;
    z-index: 2;
  }

  .music-expanded-overlay {
    position: absolute;
    top: 22.5%;
    left: 22.5%;
    width: 55%;
    height: 55%;
    background: rgba(0,0,0,0.3);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
    z-index: 2;
  }

  .music-expanded-album:hover .music-expanded-overlay {
    opacity: 1;
  }

  .music-wave-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    border-radius: 50%;
  }

  /* ==================== 信息和控制区域 ==================== */
  .music-info-section {
    flex: 1;
    min-width: fit-content;
    opacity: 0;
    display: none;
    flex-direction: column;
    overflow: visible;
    align-items: stretch;
  }

  .music-player-container.expanded .music-info-section {
    opacity: 1;
    display: flex;
  }

  .music-track-info {
    display: flex;
    flex-direction: column;
    gap: 0px; /* 歌名和作者之间的间距 */
    align-self: stretch;
    margin-bottom: 6px; /* 歌曲信息与进度条之间的间距 */
  }

  .music-title {
    color: #333;
    font-size: 14px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .music-artist {
    color: #999;           /* 更淡的颜色 */
    font-size: 11px;       /* 更小的字体 */
    font-weight: 400;      /* 正常字重 */
    opacity: 0.8;          /* 降低不透明度 */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-top: 2px;       /* 与标题稍微拉开距离 */
  }

  /* ==================== 进度条 ==================== */
  .music-progress-section {
    display: none;
    flex-direction: column;
    gap: 4px;
    opacity: 0;
    align-self: stretch;
    margin-bottom: 0px; /* 进度条与控制按钮之间的间距 */
  }

  .music-player-container.expanded .music-progress-section {
    display: flex;
    opacity: 1;
  }

  .music-progress-bar {
    width: 100%;
    height: 4px;
    background: var(--progress-bg, rgba(0, 0, 0, 0.1));
    border-radius: 2px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .music-progress-fill {
    height: 100%;
    background: var(--progress-fill, rgba(36, 44, 54, 0.8));
    border-radius: 2px;
    width: 0%;
    transition: width 0.1s linear;
  }

  .music-time {
    display: flex;
    justify-content: space-between;
    font-size: 11px;
    color: #666;
    padding: 0 2px;
  }

  /* ==================== 控制按钮 ==================== */
  .music-controls {
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: center;
    overflow: visible;
    align-self: stretch;
  }

  .music-btn {
    background: none;
    border: none;
    color: #333;
    cursor: pointer;
    padding: 0;
    font-size: 16px;
    opacity: 0.7;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .music-btn:hover {
    opacity: 1;
    transform: scale(1.1);
    background: rgba(0, 0, 0, 0.05);
  }

  /* GitHub链接图标 */
  .music-github-link {
    position: absolute;
    top: 10px;
    right: 10px;
    width: var(--github-icon-size, 24px);
    height: var(--github-icon-size, 24px);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #333;
    opacity: 0.5;
    transition: all 0.3s;
    cursor: pointer;
    border-radius: 50%;
    z-index: 5;
    text-decoration: none;
  }

  .music-github-link:hover {
    opacity: 1;
    transform: scale(1.15);
    background: rgba(0, 0, 0, 0.05);
  }

  .music-github-link i {
    font-size: calc(var(--github-icon-size, 24px) * 0.75);
  }

  .music-btn.play-btn {
    font-size: 20px;
    width: 36px;
    height: 36px;
    opacity: 1;
  }

  /* ==================== 音量控制 ==================== */
  .music-volume-control {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .music-volume-slider {
    width: 60px;
    display: flex;
    align-items: center;
  }

  .music-volume-slider input {
    width: 100%;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    height: 4px;
    border-radius: 2px;
    background: linear-gradient(
      to right,
      var(--slider-fill, #242c36) 0%,
      var(--slider-fill, #242c36) var(--slider-percent, 50%),
      var(--slider-bg, rgba(0, 0, 0, 0.1)) var(--slider-percent, 50%),
      var(--slider-bg, rgba(0, 0, 0, 0.1)) 100%
    );
    outline: none;
  }

  .music-volume-slider input::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--slider-thumb, #242c36);
    cursor: pointer;
    transition: all 0.2s;
  }

  .music-volume-slider input::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .music-volume-slider input::-moz-range-thumb {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background: var(--slider-thumb, #242c36);
    cursor: pointer;
    border: none;
    transition: all 0.2s;
  }

  .music-volume-slider input::-moz-range-thumb:hover {
    transform: scale(1.2);
  }

  .music-volume-slider input::-moz-range-track {
    height: 4px;
    border-radius: 2px;
    background: transparent;
  }

  /* ==================== 播放列表 ==================== */
  .music-playlist {
    position: absolute;
    bottom: 100%;
    right: 0;
    margin-bottom: 8px;
    width: 280px;
    background: var(--playlist-bg, rgba(255, 255, 255, 0.95));
    backdrop-filter: blur(10px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    border-radius: 10px;
    overflow: hidden;
    opacity: 0;
    transform: scale(0.95) translateY(10px);
    transform-origin: bottom right;
    pointer-events: none;
    transition: all 0.3s cubic-bezier(0.23, 1, 0.32, 1);
    z-index: 1051;
    display: flex;
    flex-direction: column;
  }

  .music-playlist.show {
    opacity: 1;
    transform: scale(1) translateY(0);
    pointer-events: auto;
  }

  .music-playlist-inner {
    max-height: 250px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .music-playlist-header {
    padding: 12px;
    border-bottom: 1px solid var(--playlist-border, rgba(0, 0, 0, 0.08));
    font-weight: 600;
    color: var(--playlist-header-text, #333);
    font-size: 14px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: sticky;
    top: 0;
    background: var(--playlist-header-bg, rgba(255, 255, 255, 0.98));
    backdrop-filter: blur(10px);
    z-index: 1;
  }

  .music-playlist-close {
    cursor: pointer;
    opacity: 0.6;
    transition: opacity 0.2s;
    font-size: 18px;
  }

  .music-playlist-close:hover {
    opacity: 1;
  }

  .music-playlist-item {
    padding: 10px 12px;
    color: var(--playlist-item-text, #555);
    font-size: 13px;
    cursor: pointer;
    border-bottom: 1px solid var(--playlist-item-border, rgba(0, 0, 0, 0.05));
    transition: background 0.2s;
  }

  .music-playlist-item:last-child {
    border-bottom: none;
  }

  .music-playlist-item:hover {
    background: var(--playlist-item-hover, rgba(0, 0, 0, 0.05));
  }

  .music-playlist-item.active {
    background: var(--playlist-item-active-bg, rgba(0, 0, 0, 0.08));
    color: var(--playlist-item-active-text, #333);
    font-weight: 600;
  }

  .music-playlist-inner::-webkit-scrollbar {
    width: 6px;
  }

  .music-playlist-inner::-webkit-scrollbar-track {
    background: transparent;
  }

  .music-playlist-inner::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.1);
    border-radius: 3px;
  }

  .music-playlist-inner::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.15);
  }

  /* ==================== 移动端适配 ==================== */
  @media (max-width: 768px) {
    .music-player-container {
      right: 10px;
      bottom: 10px;
    }
    
    .music-playlist {
      width: 240px;
      max-width: calc(100vw - 20px);
      right: 0;
    }
  }
`;
  document.head.appendChild(styleSheet);

  // ================================================================
  // 第三部分：核心变量声明
  // ================================================================
  
  // 播放状态变量
  let isPlaying = false;
  let isExpanded = false;
  let showPlaylist = false;
  let playlist = [];
  let currentIndex = 0;
  
  // 动画相关变量
  let rotationAngle = 0;
  let animationFrameId = null;
  
  // 定时器变量
  let autoCollapseTimer = null;
  let isInitialAutoCollapse = false; // 标记首次自动收起是否已完成
  
  // 音量控制变量
  let lastVolume = 0.5;
  
  // 尺寸配置
  const ballSize = window.MusicPlayerBallSize || 50;
  
  // 音频对象
  const audio = new Audio();
  audio.volume = window.MusicPlayerDefaultVolume || 0.5;

  // ================================================================
  // 第四部分：UI 元素创建
  // ================================================================
  
  // 4.1 创建主容器
  const container = document.createElement("div");
  container.className = "music-player-container";
  container.style.width = `${ballSize}px`;
  container.style.height = `${ballSize}px`;
  document.body.appendChild(container);

  // 4.2 创建主内容区域
  const mainSection = document.createElement("div");
  mainSection.className = "music-player-main";

  // 4.3 创建 GitHub 链接图标
  let githubLink = null;
  if (window.MusicPlayerGitHubUrl && window.MusicPlayerGitHubUrl.trim() !== "" && window.MusicPlayerGitHubUrl !== false) {
    const githubIconSize = window.MusicPlayerGitHubIconSize || 24;
    container.style.setProperty('--github-icon-size', `${githubIconSize}px`);
    
    githubLink = document.createElement("a");
    githubLink.className = "music-github-link";
    githubLink.href = window.MusicPlayerGitHubUrl;
    githubLink.target = "_blank";
    githubLink.rel = "noopener noreferrer";
    githubLink.title = "View on GitHub";
    githubLink.innerHTML = '<i class="iconfont icon-github"></i>';
    githubLink.style.display = "none";
    githubLink.onclick = (e) => e.stopPropagation();
    mainSection.appendChild(githubLink);
  }

  // 4.4 创建悬浮球封面区域（收起状态）
  const ballAlbum = document.createElement("div");
  ballAlbum.className = "music-ball-album";
  ballAlbum.style.width = `${ballSize}px`;
  ballAlbum.style.height = `${ballSize}px`;

  const ballRotating = document.createElement("div");
  ballRotating.className = "music-ball-rotating";

  const ballImage = document.createElement("img");
  ballImage.className = "music-ball-image";
  ballImage.style.display = 'none';

  const ballOverlay = document.createElement("div");
  ballOverlay.className = "music-ball-overlay";
  const ballIconSize = window.MusicPlayerBallIconSize || 18;
  ballOverlay.innerHTML = `<i class="iconfont icon-play" style="font-size: ${ballIconSize}px;"></i>`;

  ballRotating.appendChild(ballImage);
  ballAlbum.append(ballRotating, ballOverlay);

  // 4.5 创建展开状态封面区域（唱片效果）
  const expandedAlbum = document.createElement("div");
  expandedAlbum.className = "music-expanded-album";
  const expandedAlbumSize = window.MusicPlayerExpandedAlbumSize || ballSize;
  expandedAlbum.style.width = `${expandedAlbumSize}px`;
  expandedAlbum.style.height = `${expandedAlbumSize}px`;

  const expandedRotating = document.createElement("div");
  expandedRotating.className = "music-expanded-rotating";

  const expandedBase = document.createElement("div");
  expandedBase.className = "music-expanded-base";

  const expandedImage = document.createElement("img");
  expandedImage.className = "music-expanded-image";
  expandedImage.style.display = 'none';

  const expandedOverlay = document.createElement("div");
  expandedOverlay.className = "music-expanded-overlay";
  expandedOverlay.innerHTML = '<i class="iconfont icon-play" style="font-size: 24px;"></i>';

  expandedRotating.append(expandedBase, expandedImage);
  expandedAlbum.append(expandedRotating, expandedOverlay);

  // 4.6 创建信息和控制区域
  const infoSection = document.createElement("div");
  infoSection.className = "music-info-section";

  // 4.6.1 歌曲信息
  const trackInfo = document.createElement("div");
  trackInfo.className = "music-track-info";
  trackInfo.innerHTML = `
    <div class="music-artist">${window.MusicPlayerTitle || "Music Player"}</div>
    <div class="music-title">未播放</div>
  `;

  // 4.6.2 进度条区域
  const progressSection = document.createElement("div");
  progressSection.className = "music-progress-section";
  
  const progressBar = document.createElement("div");
  progressBar.className = "music-progress-bar";
  progressBar.innerHTML = '<div class="music-progress-fill"></div>';
  
  const timeDisplay = document.createElement("div");
  timeDisplay.className = "music-time";
  timeDisplay.innerHTML = `
    <span class="music-current-time">0:00</span>
    <span class="music-total-time">0:00</span>
  `;
  
  progressSection.append(progressBar, timeDisplay);

  // 4.6.3 控制按钮
  const controls = document.createElement("div");
  controls.className = "music-controls";

  const prevBtn = document.createElement("button");
  prevBtn.className = "music-btn";
  prevBtn.innerHTML = '<i class="iconfont icon-backward"></i>';
  prevBtn.title = "上一曲";

  const playBtn = document.createElement("button");
  playBtn.className = "music-btn play-btn";
  playBtn.innerHTML = '<i class="iconfont icon-play"></i>';
  playBtn.title = "播放/暂停";

  const nextBtn
