# 主界面实现说明

## 布局与视觉
- 顶部栏：返回按钮、标题“Explore places”、主题切换，固定顶部，阴影与圆角符合设计。
- 地图层：顶部居中类目胶囊（带图标），底部控制与列表切换按钮，覆盖卡片随坐标投影定位。
- 底部抽屉：含拖拽指示条、筛选栏（Area/Category/Sort by/Rating），列表标题“Popular places in the area”。

## 交互与逻辑
- 类目选择：映射到 Google Places type，触发去抖搜索（600ms）。
- 区域变更：地图 idle 后更新中心并触发去抖搜索。
- 筛选栏：
  - Rating：阈值过滤列表显示。
  - Category：更新当前类目，联动地图搜索。
  - Sort by：按评分/评论数降序排序列表。
- 列表卡片：显示评分/类别/价格/距离（基于 Haversine），右侧导航按钮，底部条件徽章（示例：Top Drinks、Top Japanese Food、24h open、Child chair）。

## 动效
- 页面转场：`framer-motion` 渐隐/位移过渡，与设计时长一致（0.2–0.5s）。
- 地图加载：旋转指示与渐显文本。
- 底部抽屉：弹簧曲线（stiffness:260, damping:28）。

## 兼容性
- 响应式布局：胶囊与列表在窄屏滚动，图片懒加载，卡片在中等屏幕缩放与阴影保留。
- 浏览器：Vite + React，JSDOM 单测覆盖基础逻辑；地图需有效 Google API Key。

## 关键实现路径
- Header：`src/pages/Home.tsx`
- 类目胶囊与地图：`src/components/Map.tsx`
- 底部抽屉：`src/components/BottomSheet.tsx`
- 筛选栏与弹窗：`src/components/FilterBar.tsx`、`src/components/FilterModal.tsx`
- 列表与卡片：`src/components/PlaceList.tsx`、`src/components/PlaceCard.tsx`
- 地图服务与 Places：`src/services/map.ts`、`src/services/googlePlaces.ts`
- 去抖/距离工具：`src/lib/utils.ts`、`src/lib/geo.ts`

## 环境
- 前端：`VITE_GOOGLE_MAPS_API_KEY`、`VITE_BACKEND_URL`
- 后端代理：`YELP_API_KEY`、`SUPABASE_URL`、`SUPABASE_SERVICE_KEY`
