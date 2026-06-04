# v1.0.1 - Woo 商城主题核心知识点整理

> 来源文件：`Woo商城主题.zip`  
> 整理目标：把 WooCommerce B2B 询价型商城主题的关键架构、核心代码职责、维护注意事项沉淀到本仓库中，作为第二版知识点基础。  
> 说明：本仓库只整理核心知识点和维护说明，不收录完整主题源码、字体文件、第三方库文件或敏感配置。

---

## 1. 项目定位

这套 Woo 商城不是传统“购物车 / 结账 / 在线支付”的零售电商，而是 **B2B 询价型 WooCommerce 商城**。

核心业务链路是：

```text
产品展示 → 选择产品 / 变体 / 样品 → Add to Quote → /quote/ 提交询盘 → 后台统一管理线索
```

因此它的重点不是支付，而是：

- 产品分类页和产品详情页展示；
- 变体产品色卡选择；
- 产品图库和场景图展示；
- 样品包选择；
- Add to Quote 询价单；
- 通用表单统一入库；
- 后台统一管理线索、导出 CSV、处理 Spam / Trash。

---

## 2. 源码包结构

`Woo商城主题.zip` 里面实际包含两个压缩包：

```text
Woo商城主题.zip
└── 商城主题/
    ├── themes.zip
    └── plugins.zip
```

展开后核心结构是：

```text
themes/
└── mytheme/
    ├── style.css
    ├── functions.php
    ├── header.php
    ├── footer.php
    ├── meta_seo.php
    ├── page-quote.php
    ├── page-contact.php
    ├── page-pricing.php
    ├── page-order-samples.php
    ├── page-quantity-calculator.php
    ├── woocommerce/
    │   ├── archive-product.php
    │   ├── content-product.php
    │   ├── single-product.php
    │   └── content-single-product.php
    ├── css/custom/
    └── js/custom/

plugins/
├── coowin-quote-system/
└── coowin-sample-pack/
```

---

## 3. Theme 与 Plugin 的职责边界

### 3.1 Theme：展示层

`mytheme` 主要负责页面结构和前端展示：

- 首页、关于页、联系页、Pricing、Gallery、Quantity Calculator 等页面模板；
- WooCommerce 分类页 / 列表页 / 详情页模板覆盖；
- 产品图片 Swiper 轮播；
- 变体色卡 UI；
- 数量加减按钮 UI；
- 产品详情页右侧表单；
- 页面级 CSS / JS 条件加载；
- 面包屑、SEO 标题描述、分类排序字段等辅助功能。

主题不应该承担：

- 询盘入库；
- Ajax 提交主逻辑；
- 后台询盘管理；
- CSV 导出；
- Spam / Trash 数据管理。

### 3.2 Coowin Quote System：询盘数据层

`coowin-quote-system` 是整套 B2B 商城的核心插件，负责：

- Add to Quote 列表；
- Quote List 存储；
- `/quote/` 页面提交；
- 通用表单提交；
- 询盘统一写入数据库；
- 后台 Quote Inquiries 管理；
- 状态管理：`new / read / spam / trash`；
- CSV 导出；
- 黑名单 IP；
- Honeypot 防垃圾；
- 30 秒防重复提交。

### 3.3 Coowin Sample Pack：样品包选择器

`coowin-sample-pack` 用于样品产品页面：

- 根据样品类型显示多个下拉选择器；
- 支持 Decking / Cladding / Fencing 等样品类型；
- 默认每个样品包可配置多个 slot；
- 用户选择的样品颜色会作为 Quote item 的 attrs 写入询盘单；
- 后台通过 Sample Pack 菜单维护类型、别名、选项、图片和关联链接。

---

## 4. WooCommerce 模板覆盖

主题覆盖模板位置：

```text
themes/mytheme/woocommerce/
```

核心模板：

| 文件 | 作用 |
|---|---|
| `archive-product.php` | Shop / 产品分类页整体结构 |
| `content-product.php` | 产品列表卡片 |
| `single-product.php` | 单品页 wrapper |
| `content-single-product.php` | 单品页主体内容 |

### 4.1 archive-product.php

主要负责：

- 分类页 Banner；
- 顶级分类导航；
- 二级分类导航；
- WooCommerce 结果数量；
- WooCommerce 排序器；
- 产品卡片循环；
- 分页；
- 按 `nav_order` 自定义字段排序分类。

维护重点：

```text
如果分类导航顺序不对：
1. 检查 Products → Categories 中的 nav_order 字段；
2. 检查 functions.php 中 mytheme_sort_terms_by_nav_order() 是否存在；
3. 检查 archive-product.php 是否调用了该排序函数。
```

### 4.2 content-product.php

主要负责产品卡片：

- 第一张图：产品特色图；
- 第二张图：产品图库第一张，用于 hover 切换；
- 标题；
- 价格；
- 第一个产品分类；
- 简单产品显示 `Add to Quote`；
- 变体产品 / 组合产品显示 `Select options`，进入详情页选择。

关键设计：

```text
简单产品：列表页可以直接 Add to Quote
变体产品：必须进入详情页选择变体后再 Add to Quote
```

### 4.3 content-single-product.php

产品详情页主体内容，重点包括：

- 左侧 Swiper 产品图库；
- 右侧标题、评分、价格；
- WooCommerce 原生 Add to Cart 表单；
- 插件把按钮语义改为 Add to Quote；
- Quote List 链接；
- 产品 SKU / 分类；
- Elementor 内容区；
- 评论区；
- 右侧 Request a quote 通用表单；
- Related products 轮播。

维护重点：

```text
产品详情页的变体、数量、Add to Quote 不要脱离 Woo 原生表单结构。
前端 UI 可以增强，但最终必须回写 Woo 原生字段。
```

---

## 5. 主题 functions.php 核心功能

`functions.php` 是主题最重要的维护文件之一，核心功能包括：

### 5.1 主题基础支持

```php
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('woocommerce');
});
```

作用：

- 启用 WordPress 自动标题；
- 启用特色图；
- 声明 WooCommerce 主题支持。

### 5.2 商品归档数量和默认排序

```php
add_filter('loop_shop_per_page', function ($per_page) {
    return 9;
}, 20);

add_filter('woocommerce_default_catalog_orderby', function ($sortby) {
    return 'date';
});
```

作用：

- Woo 商品归档页每页 9 个产品；
- 默认按发布时间倒序展示最新产品。

### 5.3 禁用图片硬裁切

主题中对 WooCommerce 产品图和 WordPress 中间尺寸做了处理，目的是：

```text
避免产品图被强制裁切；
保持图片等比缩放；
减少上传后图片比例被破坏的问题。
```

注意：

```text
这类设置只影响之后上传的图片。
已经生成过的历史缩略图不会自动改变，需要重新生成缩略图。
```

### 5.4 B2B Quote 模式跳转

主题 / 插件中都体现了 B2B 询价模式：

```text
Cart / Checkout → /quote/
```

也就是弱化传统购物车和结账页，引导用户统一进入询价单页面。

---

## 6. 变体色卡与场景图库

这是 WooCommerce 变体产品的关键功能。

### 6.1 识别颜色属性

主题通过属性名判断是否为颜色属性：

```text
color
colour
pa_xxx_color
pa_xxx_colour
```

### 6.2 颜色属性 term meta

每个颜色 term 可以配置：

| 字段 | 作用 |
|---|---|
| `coo_swatch_hex` | 色卡颜色值，例如 `#C58A46` |
| `coo_swatch_image_id` | 色卡缩略图 |
| `coo_scene_gallery` | 该颜色对应的场景图库 |

### 6.3 前端输出位置

色卡通过 WooCommerce hook 输出：

```php
add_action('woocommerce_after_variations_table', function () {
    // 输出颜色 swatches
}, 20);
```

### 6.4 最重要的维护点

WooCommerce 变体选择最终依赖原生 `<select>` 字段。

主题中已经特别修正：

```text
Woo 原生 select name 是：attribute_pa_xxx
色卡按钮 data-attribute 必须也是：attribute_pa_xxx
```

如果这里写成 `pa_xxx`，就会出现：

```text
前端看似选中色卡，但 WooCommerce 实际没有选中变体。
```

---

## 7. Swiper 资源兼容策略

主题中有一套 Swiper 智能代理机制，目的是解决：

```text
主题 Swiper
Elementor Swiper
WooCommerce / 其他插件 Swiper
之间的版本冲突和重复加载问题
```

核心维护原则：

```text
自定义脚本如果依赖 Swiper，统一依赖 mytheme-swiper-proxy。
```

规则：

| 页面类型 | 策略 |
|---|---|
| 产品详情页 | 优先使用 Elementor / 已存在 Swiper，不强行加载主题 Swiper |
| 非产品页 | 如果没有 Swiper，则加载主题自带 Swiper 11 |
| 自定义脚本 | 依赖 `mytheme-swiper-proxy`，不要直接依赖具体 Swiper 文件 |

这对以后排查“轮播不动 / 控制按钮失效 / 控制台报 Swiper undefined”非常重要。

---

## 8. Quote System 插件核心知识点

### 8.1 插件入口

```text
plugins/coowin-quote-system/coowin-quote-system.php
```

插件版本：

```text
1.0.0
```

主要引入：

```php
require_once COO_QUOTE_PATH . 'includes/db.php';
require_once COO_QUOTE_PATH . 'includes/quote-store.php';
require_once COO_QUOTE_PATH . 'includes/ajax.php';
require_once COO_QUOTE_PATH . 'includes/shortcodes.php';
require_once COO_QUOTE_PATH . 'includes/admin.php';
require_once COO_QUOTE_PATH . 'includes/woo.php';
```

### 8.2 主数据表

插件核心表：

```text
wp_coo_inquiry_entries
```

如果 WordPress 数据表前缀不是 `wp_`，实际表名会跟随站点前缀变化。

主要字段：

| 字段 | 作用 |
|---|---|
| `id` | 询盘 ID |
| `created_at` | 创建时间 |
| `updated_at` | 更新时间 |
| `status` | new / read / spam / trash |
| `source` | quote / contact / pricing / sample / support / custom |
| `name` | 姓名 |
| `email` | 邮箱 |
| `phone` | 电话 |
| `company` | 公司 |
| `country` | 国家 |
| `message` | 留言 |
| `page_url` | 来源页面 |
| `items_json` | 产品询盘项目 |
| `meta_json` | 自定义字段 |
| `user_ip` | IP |
| `user_agent` | 浏览器信息 |
| `referrer` | 来源页 |

### 8.3 Ajax 接口

核心 Ajax action：

| Action | 作用 |
|---|---|
| `coo_quote_get` | 获取 Quote List |
| `coo_quote_add` | 添加产品到 Quote List |
| `coo_quote_update` | 更新数量 |
| `coo_quote_remove` | 删除产品 |
| `coo_quote_submit` | 提交产品询盘 |
| `coo_inquiry_submit_generic` | 提交通用表单 |

### 8.4 通用表单接入规范

自定义表单必须使用：

```html
<form data-coo-inquiry-form>
  <input type="hidden" name="_coo_source" value="contact">
  <input type="hidden" name="_coo_form_key" value="contact_page_main">
  <input type="hidden" name="_coo_form_title" value="Contact Us Form">
  <input type="hidden" name="_coo_required" value="name,email,message">
  <input type="hidden" name="_coo_labels" value='{"material_type":"Material Type"}'>

  <input type="text" name="name">
  <input type="email" name="email">
  <textarea name="message"></textarea>

  <input type="text" name="website" style="display:none" tabindex="-1" autocomplete="off">
  <button type="submit">Submit</button>
  <div data-coo-form-msg style="display:none"></div>
</form>
```

维护重点：

```text
_coo_required 里的字段名，必须和 input/select/textarea 的 name 完全一致。
```

---

## 9. Sample Pack 插件核心知识点

### 9.1 插件定位

`coowin-sample-pack` 用于样品包产品页面，不是独立询盘系统，而是和 Quote System 协作。

核心能力：

- 识别样品产品；
- 按类型输出样品选择器；
- 支持多个样品 slot；
- 把用户选择的样品作为 attrs 写入 Quote item；
- 后台可配置样品类型、别名、选项、图片、产品链接。

### 9.2 默认样品类型

插件默认配置包含：

```text
decking
cladding
fencing
```

每种类型可以配置：

- 是否启用；
- 显示名称；
- 可选数量 slots；
- 产品识别别名 aliases；
- 颜色 / 样品选项；
- 缩略图；
- 关联产品链接。

### 9.3 前端输出 hook

```php
add_action('woocommerce_before_add_to_cart_button', function () {
    // 输出 sample pack selectors
}, 5);
```

也就是说，样品选择器会出现在 WooCommerce Add to Cart / Add to Quote 按钮之前。

### 9.4 样品选择写入 Quote attrs

前端 JS 会收集：

```js
attrs.sample_type = typeLabel;
attrs['sample_colour_' + String(index + 1)] = label || value;
```

最终在 Quote List 页面会显示为：

```text
Sample Type
Sample Colour #1
Sample Colour #2
Sample Colour #3
```

---

## 10. 标准页面模板

主题中包含多个自定义页面模板：

| 模板文件 | Template Name |
|---|---|
| `page-about.php` | About Us |
| `page-contact.php` | Contact Us |
| `page-gallery.php` | Gallery |
| `page-get-a-quote.php` | Get a Quote |
| `page-order-samples.php` | Order Samples |
| `page-pricing.php` | Pricing |
| `page-quantity-calculator.php` | Quantity Calculator |
| `page-quote.php` | Quote List |
| `page-why-choose-wa-composite.php` | Why Choose WA Composite |
| `page-composite-decking-overview.php` | Composite Decking Overview |
| `page-composite-cladding-overview.php` | Composite Cladding Overview |
| `page-composite-fencing-overview.php` | Composite Fencing Overview |

维护建议：

```text
新增页面时，优先确认是否已有类似模板可以复用。
不要把大量业务逻辑直接写入多个页面模板，能统一的应尽量统一。
```

---

## 11. 常见问题排查清单

### 11.1 游客看不到 Woo 商品页

现象：

```text
管理员登录后正常；
游客打开 Shop / 分类 / 产品页显示 Coming soon 或 Great things are on the horizon。
```

优先检查：

```text
WooCommerce → Settings → Site Visibility → Live
```

切换为 Live 后，清理 Cloudflare / WP Rocket / 浏览器缓存，再用无痕窗口验证。

### 11.2 产品详情页样式或 JS 不加载

优先检查：

```text
header.php 是否有 wp_head()
footer.php 是否有 wp_footer()
模板里是否重复写了 <!doctype html> / <head> / <body>
```

原则：

```text
header.php 和 footer.php 负责页面骨架；
WooCommerce 模板只写内容区。
```

### 11.3 色卡选中了但变体没选中

优先检查：

```text
data-attribute 是否等于 Woo 原生 select name
正确：attribute_pa_xxx
错误：pa_xxx
```

### 11.4 Quote 提交后后台没有数据

检查顺序：

```text
1. 浏览器 Network 是否请求 admin-ajax.php；
2. nonce 是否存在；
3. 表单是否带 data-coo-inquiry-form；
4. action 是否为 coo_quote_submit 或 coo_inquiry_submit_generic；
5. 数据表 wp_coo_inquiry_entries 是否存在；
6. 缓存是否导致旧 JS 生效。
```

### 11.5 自定义字段不显示

检查：

```text
1. 字段 name 是否被 reserved keys 排除；
2. _coo_labels 是否为合法 JSON；
3. 字段值是否为空；
4. 后台详情页是否读取 meta_json.fields。
```

---

## 12. 每次改版测试清单

### WooCommerce 页面

- [ ] Shop 页面正常；
- [ ] 产品分类页正常；
- [ ] 产品详情页正常；
- [ ] 产品图库轮播正常；
- [ ] 变体色卡能正确联动 Woo 原生 variation；
- [ ] 数量加减正常；
- [ ] 简单产品 Add to Quote 正常；
- [ ] 变体产品选择后 Add to Quote 正常。

### Quote 询盘链路

- [ ] Quote List 可显示产品；
- [ ] Quote List 可更新数量；
- [ ] Quote List 可删除产品；
- [ ] Quote List 可提交；
- [ ] 后台 Quote Inquiries 能看到记录；
- [ ] `items_json` 中产品、变体、attrs、qty 正常；
- [ ] CSV 导出正常。

### 通用表单

- [ ] Contact 表单可提交；
- [ ] Pricing 表单可提交；
- [ ] Product details 右侧表单可提交；
- [ ] Sample / Support 类表单按 source 入库；
- [ ] Custom Fields 显示正常；
- [ ] 必填校验正常；
- [ ] Honeypot 不影响真实用户提交。

### 缓存环境

- [ ] 清理 WordPress 缓存；
- [ ] 清理 Cloudflare 缓存；
- [ ] 无痕窗口测试；
- [ ] 手机端测试；
- [ ] 控制台无关键 JS 报错。

---

## 13. v1.0.1 仓库补充内容

本次第二版建议纳入仓库的知识点包括：

- Woo B2B 询价型商城架构；
- `mytheme` 主题文件职责；
- WooCommerce 模板覆盖结构；
- 产品列表页 / 详情页关键逻辑；
- Add to Quote 流程；
- Quote System 插件数据结构；
- 通用表单接入规范；
- Sample Pack 插件逻辑；
- 色卡和场景图库配置；
- Swiper 兼容策略；
- 常见问题排查清单；
- 每次改版测试清单。

---

## 14. 后续第三版计划

第三版可以继续补充“普通 WordPress 主题”的知识点，建议重点整理：

- 普通主题与 Woo 商城主题的区别；
- WordPress 标准模板层级；
- `index.php / page.php / single.php / archive.php / category.php` 的职责；
- `functions.php` 常用功能；
- 资源加载规范；
- 自定义页面模板；
- 文章列表 / 详情 / 分类 / 搜索页面；
- SEO、面包屑、分页、缩略图等通用能力。

这样三版可以形成完整知识体系：

```text
v1.0.0：代码片段知识库基础框架
v1.0.1：WooCommerce B2B 商城主题核心知识点
v1.0.2：普通 WordPress 主题核心知识点
```
