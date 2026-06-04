# WordPress / WooCommerce 商城代码片段知识库

本仓库用于整理 WordPress、WooCommerce 商城搭建、维护、安全排查和功能修改过程中常用的重要代码片段，方便后续快速查阅、复制和复用。

## 在线预览

点击下面链接，可以直接预览在线代码片段查询页面：

[点击预览 WordPress / WooCommerce 商城代码片段知识库](https://coowinit.github.io/wordpress-woocommerce-code-library/)

## 文件结构

```text
wordpress-woocommerce-code-library/
├── index.html
├── README.md
├── docs/
│   ├── woocommerce-theme-core-knowledge-v1.0.1.md
│   ├── wordpress-theme-plugin-reusable-code-v1.0.2.md
│   └── wordpress-practical-snippets-v1.0.3.md
└── assets/
    ├── css/
    │   └── style.css
    └── js/
        └── main.js
```

## 页面功能

- 代码片段卡片展示
- 分类筛选
- 关键词搜索
- 一键复制代码
- 风险等级标记
- 适用文件记录
- 更新时间记录
- PC / 移动端自适应

## 主要分类

- WordPress 基础
- WooCommerce 商城
- 主题 / 插件架构
- 高频函数 / 救急代码
- Elementor
- 表单 / 邮件
- 数据库 SQL
- 安全排查
- 服务器配置
- CSS / JS


## v1.0.1 核心文档

本版本新增 WooCommerce B2B 询价型商城主题的核心知识点整理，来源于 `Woo商城主题.zip`。

主要整理内容：

- Woo 商城主题 `mytheme` 的文件结构和职责边界
- WooCommerce 模板覆盖：列表页、产品卡片、详情页
- B2B 询价模式：Add to Quote → Quote List → 后台询盘管理
- `coowin-quote-system` 插件的数据表、Ajax 接口和通用表单规范
- `coowin-sample-pack` 样品包插件的样品选择逻辑
- 变体色卡、场景图库、Swiper 兼容策略
- 常见问题排查清单和改版测试清单

详细文档：

[查看 Woo 商城主题核心知识点整理](docs/woocommerce-theme-core-knowledge-v1.0.1.md)


## v1.0.3 核心文档

本版本新增 WordPress 高频救急代码、模板标签、查询逻辑和常用开发片段整理，主要用于日常维护和快速复用。

主要整理内容：

- 忘记管理员密码时，通过 FTP 临时修改 `functions.php` 新增管理员账号的救急方法
- 禁用 WordPress 自动生成图片尺寸和大图缩放的修正版代码
- 面包屑导航：插件 / WordPress 7.0 后推荐方式，以及自定义核心逻辑
- 分页代码：`the_posts_pagination()` 内置函数与自定义 `WP_Query` 分页
- 自定义内容类型和分类法：插件方式与 `functions.php` 代码方式
- 常用模板标签：`get_template_part()`、`single_cat_title()`、`get_queried_object()` 等
- `WP_Query` 与 `tax_query` 高频查询写法
- `wp_tag_cloud()`、`get_theme_file_uri()`、缩略图、标签和分页相关函数
- `$.ajax()` 表单提交示例和 WordPress Ajax 后端处理方式
- `<script data-nowprocket>` 与 `script_loader_tag` 的使用场景
- 插件开发常用的 `add_action()`、`add_filter()`、`register_activation_hook()`、`add_shortcode()`

详细文档：

[查看 WordPress 高频救急代码与模板标签速查](docs/wordpress-practical-snippets-v1.0.3.md)

## v1.0.2 核心文档

本版本新增普通 WordPress 主题与小插件的可复用代码整理，来源于 `themes.zip` 和 `plugins.zip`。

主要整理内容：

- 普通 WordPress 主题 `mytheme` 的文件结构和职责边界
- `functions.php` 中适合长期复用的后台增强、CPT、Taxonomy、Metabox、Ajax 和清理代码
- 产品、下载资料、FAQ、Instagram 动态、VR 视频、经销商网络等自定义内容模型
- 分类页 SEO 标题、页面说明、排序字段等 Term Meta 扩展思路
- 自定义字段、媒体上传、多图图库、拖拽排序等后台字段模式
- 联系表单、计算器结果、展会报名、经销商申请等 Ajax 邮件处理模板
- `Page Settings` 小插件的 Settings API 实现方式
- SMTP、邮箱、授权码等敏感信息的脱敏和安全维护建议

详细文档：

[查看 WordPress 常用主题与小插件可复用代码整理](docs/wordpress-theme-plugin-reusable-code-v1.0.2.md)

## 新增代码片段的方法

每次新增一段代码时，主要修改两个文件：

- `index.html`：新增一个代码卡片
- `README.md`：更新版本记录或说明

建议在 `index.html` 中复制已有的 `<article class="code-card">...</article>`，然后修改里面的标题、说明、分类、标签和代码。

## 代码记录规范

每段代码建议包含：

- 标题
- 适用场景
- 适用文件
- 代码类型
- 风险等级
- 更新时间
- 标签
- 代码片段
- 注意事项

## 代码卡片模板

```html
<article class="code-card" data-category="woocommerce" data-tags="woocommerce product php functions.php">
  <div class="code-card-header">
    <div>
      <p class="card-category">WooCommerce 商城</p>
      <h2>[WooCommerce] 这里写代码标题</h2>
    </div>
    <span class="risk risk-low">低风险</span>
  </div>

  <p class="desc">
    这里写这段代码的用途。
  </p>

  <ul class="meta">
    <li><strong>适用文件：</strong>子主题 functions.php</li>
    <li><strong>代码类型：</strong>PHP</li>
    <li><strong>更新时间：</strong>2026-06-04</li>
    <li><strong>标签：</strong>WooCommerce / 产品 / 自定义功能</li>
  </ul>

  <div class="code-toolbar">
    <span>PHP</span>
    <button class="copy-btn" type="button">复制代码</button>
  </div>
  <pre><code class="language-php">这里放代码</code></pre>

  <div class="note">
    这里写注意事项。
  </div>
</article>
```

## 分类字段说明

`data-category` 推荐使用以下值：

| 分类 | data-category |
|---|---|
| WordPress 基础 | `wordpress` |
| WooCommerce 商城 | `woocommerce` |
| 主题 / 插件架构 | `theme` |
| 高频函数 / 救急代码 | `common` |
| Elementor | `elementor` |
| 表单 / 邮件 | `form` |
| 数据库 SQL | `database` |
| 安全排查 | `security` |
| 服务器配置 | `server` |
| CSS / JS | `frontend` |

## 风险等级说明

| 风险等级 | class |
|---|---|
| 低风险 | `risk risk-low` |
| 中风险 | `risk risk-medium` |
| 高风险 | `risk risk-high` |

高风险代码主要包括：

- 数据库 SQL 删除或修改
- 批量替换数据
- 服务器配置修改
- 安全相关文件删除
- 涉及邮件、支付、订单的功能修改

## 公开仓库注意事项

如果仓库是公开的，不要保存以下内容：

- 数据库账号
- 数据库密码
- WordPress 后台账号
- 真实客户邮箱
- 服务器 IP
- API Key
- 插件授权码
- 备份文件下载地址
- 真实订单数据
- 真实用户数据

建议使用示例信息代替：

```php
$db_name = 'your_database_name';
$db_user = 'your_database_user';
$db_password = 'your_database_password';
$admin_email = 'company@example.com';
```

## 更新记录

### v1.0.3

- 新增 WordPress 高频救急代码与模板标签速查文档。
- 新增 `docs/wordpress-practical-snippets-v1.0.3.md` 详细文档。
- 补充忘记管理员密码时通过 `functions.php` 临时新增管理员账号的救急代码，并标记为高风险操作。
- 修正并整理禁用 WordPress 自动生成图片尺寸、大图缩放和自定义图片尺寸的代码。
- 补充面包屑导航的插件兼容写法和自定义核心逻辑。
- 补充分页代码：内置分页函数和自定义 `WP_Query` 分页写法。
- 补充自定义内容类型和分类法的插件方式与代码方式。
- 整理必须牢记的模板标签、`WP_Query`、`tax_query`、缩略图、标签云、主题资源路径等高频函数。
- 补充 `$.ajax()` 表单提交、WordPress Ajax 后端处理和 Nonce 校验示例。
- 补充 `<script data-nowprocket>` 与 `script_loader_tag` 给脚本添加属性的用法。
- 补充插件开发常用的 4 类代码：`add_action()`、`add_filter()`、`register_activation_hook()`、`add_shortcode()`。

### v1.0.2

- 新增普通 WordPress 主题与小插件的可复用代码整理。
- 新增 `docs/wordpress-theme-plugin-reusable-code-v1.0.2.md` 详细文档。
- 从 `themes.zip` 中提炼普通主题常用文件结构、后台增强、自定义文章类型、分类字段、自定义字段、图库字段、Ajax 表单邮件和 WordPress 头部清理代码。
- 从 `plugins.zip` 中提炼 `Page Settings` 后台设置小插件的 Settings API 模板。
- 首页新增普通 WordPress 主题 / 插件相关代码卡片，方便后续搜索、复制和复用。
- 对真实邮箱、SMTP 账号、SMTP 授权码、第三方追踪 ID 等内容进行脱敏处理，避免敏感信息进入公开仓库。

### v1.0.1

- 新增 WooCommerce B2B 询价型商城主题核心知识点整理。
- 新增 `docs/woocommerce-theme-core-knowledge-v1.0.1.md` 详细文档。
- 补充 `mytheme` 主题、WooCommerce 模板覆盖、Add to Quote 询盘流程、Quote System 插件、Sample Pack 插件等关键知识点。
- 首页新增“主题 / 插件架构”分类。
- 首页新增多个 Woo 商城主题相关知识卡片，方便快速查阅。
- README 增加 v1.0.1 核心文档入口和版本记录。

### v1.0.0

- 初始化 WordPress / WooCommerce 商城代码片段知识库。
- 新增 `index.html` 在线查询页面。
- 新增分类筛选功能。
- 新增关键词搜索功能。
- 新增一键复制代码功能。
- 新增风险等级、适用文件、更新时间和标签记录。
- 新增示例代码片段：WooCommerce、WordPress、SQL、表单邮件、安全排查、Elementor、服务器配置、前端 JS。
