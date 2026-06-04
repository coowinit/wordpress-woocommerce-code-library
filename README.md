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
- Elementor
- 表单 / 邮件
- 数据库 SQL
- 安全排查
- 服务器配置
- CSS / JS

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

### v1.0.0

- 初始化 WordPress / WooCommerce 商城代码片段知识库。
- 新增 `index.html` 在线查询页面。
- 新增分类筛选功能。
- 新增关键词搜索功能。
- 新增一键复制代码功能。
- 新增风险等级、适用文件、更新时间和标签记录。
- 新增示例代码片段：WooCommerce、WordPress、SQL、表单邮件、安全排查、Elementor、服务器配置、前端 JS。
