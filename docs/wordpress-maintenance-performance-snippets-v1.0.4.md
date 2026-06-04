# WordPress 站点维护、性能优化与后台体验常用代码整理 v1.0.4

本文件用于补充 WordPress 日常维护、性能优化、邮件发送、后台体验、安全加固和临时维护模式中最常见、最适合反复复用的代码片段。

本版本定位：

```text
v1.0.4 - WordPress 站点维护、性能优化与后台体验常用代码
```

适用场景：普通 WordPress 企业站、产品展示型网站、WooCommerce 商城站、B2B 询盘型网站、旧站维护、上线前后临时维护。

---

## 01. [Assets] 正确加载主题 CSS / JS 并自动刷新缓存

### 作用

使用 wp_enqueue_scripts 正确加载主题资源，并用 filemtime() 自动刷新浏览器缓存。

### 适用文件

```text
functions.php
```

### 核心代码

```php
function mytheme_enqueue_assets() {
    $css_file = get_theme_file_path('/assets/css/style.css');
    $js_file  = get_theme_file_path('/assets/js/main.js');

    wp_enqueue_style(
        'mytheme-style',
        get_theme_file_uri('/assets/css/style.css'),
        [],
        file_exists($css_file) ? filemtime($css_file) : '1.0.0'
    );

    wp_enqueue_script(
        'mytheme-main',
        get_theme_file_uri('/assets/js/main.js'),
        ['jquery'],
        file_exists($js_file) ? filemtime($js_file) : '1.0.0',
        true
    );
}
add_action('wp_enqueue_scripts', 'mytheme_enqueue_assets');
```

### 记忆重点 / 注意事项

get_theme_file_uri() 获取文件 URL；get_theme_file_path() 获取服务器上的真实文件路径；filemtime() 返回文件最后修改时间，适合作为版本号。

---

## 02. [Performance] 只在指定页面加载 CSS / JS

### 作用

只在联系页、产品详情页等指定页面加载专用资源，减少全站不必要的 CSS / JS。

### 适用文件

```text
functions.php
```

### 核心代码

```php
function mytheme_conditional_assets() {
    if (is_page('contact')) {
        wp_enqueue_style(
            'contact-style',
            get_theme_file_uri('/assets/css/contact.css'),
            [],
            '1.0.0'
        );

        wp_enqueue_script(
            'contact-form',
            get_theme_file_uri('/assets/js/contact.js'),
            ['jquery'],
            '1.0.0',
            true
        );
    }

    if (is_singular('product')) {
        wp_enqueue_style(
            'product-style',
            get_theme_file_uri('/assets/css/product.css'),
            [],
            '1.0.0'
        );
    }
}
add_action('wp_enqueue_scripts', 'mytheme_conditional_assets');
```

### 记忆重点 / 注意事项

适合表单页、联系我们页面、产品详情页、视频轮播页、Swiper 页面等，避免全站加载无关资源。

---

## 03. [Mail] 修改 WordPress 邮件发件人名称和邮箱

### 作用

把 WordPress 默认邮件发件人改成公司名称和网站邮箱，提升邮件可信度和品牌一致性。

### 适用文件

```text
functions.php
```

### 核心代码

```php
function mytheme_mail_from($email) {
    return 'noreply@example.com';
}
add_filter('wp_mail_from', 'mytheme_mail_from');

function mytheme_mail_from_name($name) {
    return 'Company Website';
}
add_filter('wp_mail_from_name', 'mytheme_mail_from_name');
```

### 记忆重点 / 注意事项

发件邮箱建议使用网站同域名邮箱；公开仓库不要写真实公司邮箱，可使用 noreply@example.com 占位。

---

## 04. [Mail] 使用 wp_mail() 发送 HTML 格式邮件

### 作用

让 WordPress 邮件支持 HTML 内容，例如标题、段落、表格和链接。

### 适用文件

```text
functions.php / 自定义插件
```

### 核心代码

```php
function mytheme_set_html_mail_content_type() {
    return 'text/html';
}

function mytheme_send_html_mail($to, $subject, $html_message) {
    add_filter('wp_mail_content_type', 'mytheme_set_html_mail_content_type');

    $sent = wp_mail($to, $subject, $html_message);

    remove_filter('wp_mail_content_type', 'mytheme_set_html_mail_content_type');

    return $sent;
}

mytheme_send_html_mail(
    'admin@example.com',
    'New Website Inquiry',
    '<h2>New Inquiry</h2><p>This is an HTML email.</p>'
);
```

### 记忆重点 / 注意事项

wp_mail() 默认发送纯文本邮件。发送 HTML 邮件时，临时把内容类型改成 text/html，发送完成后立即 remove_filter。

---

## 05. [Query] 使用 pre_get_posts 修改分类页文章数量

### 作用

通过 pre_get_posts 修改 WordPress 主查询，例如控制分类页、搜索页、归档页文章数量。

### 适用文件

```text
functions.php
```

### 核心代码

```php
function mytheme_category_posts_per_page($query) {
    if (!is_admin() && $query->is_main_query() && $query->is_category()) {
        $query->set('posts_per_page', 12);
    }
}
add_action('pre_get_posts', 'mytheme_category_posts_per_page');
```

### 记忆重点 / 注意事项

pre_get_posts 适合修改分类页、标签页、搜索页、归档页等主查询。不要忘记判断非后台和主查询。

---

## 06. [Security] 禁用 WordPress XML-RPC

### 作用

用于减少 XML-RPC 相关的恶意请求、暴力破解和 Pingback 风险。

### 适用文件

```text
functions.php
```

### 核心代码

```php
add_filter('xmlrpc_enabled', '__return_false');

function mytheme_remove_x_pingback_header($headers) {
    unset($headers['X-Pingback']);
    return $headers;
}
add_filter('wp_headers', 'mytheme_remove_x_pingback_header');
```

### 记忆重点 / 注意事项

禁用前确认网站是否依赖 Jetpack、远程发布、WordPress 手机 App 或第三方同步服务。

---

## 07. [Admin] 隐藏非管理员前台顶部工具栏

### 作用

普通用户、客户账号或会员登录前台时，隐藏 WordPress 顶部黑色工具栏。

### 适用文件

```text
functions.php
```

### 核心代码

```php
function mytheme_hide_admin_bar_for_non_admins() {
    if (!current_user_can('administrator')) {
        show_admin_bar(false);
    }
}
add_action('after_setup_theme', 'mytheme_hide_admin_bar_for_non_admins');
```

### 记忆重点 / 注意事项

适用于会员系统、客户登录、经销商账号、普通编辑账号等场景。

---

## 08. [Admin] 自定义 WordPress 登录页 Logo 和链接

### 作用

把 WordPress 默认登录页 Logo 换成公司 Logo，并将 Logo 链接改为网站首页。

### 适用文件

```text
functions.php
```

### 核心代码

```php
function mytheme_custom_login_logo() {
    ?>
    <style>
        .login h1 a {
            background-image: url('<?php echo esc_url(get_theme_file_uri('/assets/images/login-logo.png')); ?>');
            width: 220px;
            height: 80px;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }
    </style>
    <?php
}
add_action('login_enqueue_scripts', 'mytheme_custom_login_logo');

function mytheme_custom_login_logo_url() {
    return home_url('/');
}
add_filter('login_headerurl', 'mytheme_custom_login_logo_url');
```

### 记忆重点 / 注意事项

需要提前准备图片 assets/images/login-logo.png。如果 Logo 不显示，优先检查路径和图片尺寸。

---

## 09. [Media] 只允许管理员上传 SVG

### 作用

允许管理员上传 SVG 图标文件，用于 Logo、图标和品牌元素。

### 适用文件

```text
functions.php
```

### 核心代码

```php
function mytheme_allow_svg_upload_for_admins($mimes) {
    if (current_user_can('administrator')) {
        $mimes['svg'] = 'image/svg+xml';
    }

    return $mimes;
}
add_filter('upload_mimes', 'mytheme_allow_svg_upload_for_admins');
```

### 记忆重点 / 注意事项

SVG 存在安全风险。公开网站建议只允许管理员上传，并使用可信来源的 SVG 文件。

---

## 10. [Maintenance] 临时开启网站维护模式

### 作用

网站改版、更新主题或修复功能时，临时对普通访客显示维护提示，管理员仍可访问。

### 适用文件

```text
functions.php
```

### 核心代码

```php
function mytheme_maintenance_mode() {
    if (!current_user_can('administrator') && !wp_doing_ajax()) {
        wp_die(
            '<h1>网站维护中</h1><p>网站正在更新，请稍后再访问。</p>',
            '网站维护中',
            ['response' => 503]
        );
    }
}
add_action('template_redirect', 'mytheme_maintenance_mode');
```

### 记忆重点 / 注意事项

维护完成后必须删除或注释这段代码。建议管理员登录后再启用，避免自己也无法预览前台。

---

## v1.0.4 维护建议

这些代码建议统一放入首页的“维护 / 性能优化”分类，对应 `data-category="maintenance"`。所有函数名建议增加项目前缀，避免和主题、插件冲突。涉及邮件、SVG、安全和维护模式的代码，上线前要先在测试环境验证。
