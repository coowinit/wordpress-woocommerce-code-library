# WordPress 常用主题与小插件可复用代码整理（v1.0.2）

本文件基于本次上传的 `themes.zip` 与 `plugins.zip` 整理，重点不是保存完整源码，而是把后期做普通 WordPress 企业站、产品站、经销商站、资料下载站时最容易重复使用的代码模式提炼出来。

> 安全说明：源文件中出现过真实邮箱、SMTP 账号、SMTP 授权码、第三方追踪 ID 等信息。v1.0.2 文档和首页卡片已统一使用示例值替代，不把敏感信息写入公开仓库。

## 一、文件来源与整体结构

本次主题包的核心目录为：

```text
themes/mytheme/
├── style.css                         # 主题声明文件
├── functions.php                     # 自定义文章类型、字段、Ajax、邮件、清理代码等核心逻辑
├── custom-shortcodes.php             # 常用短代码输出模块
├── header.php / footer.php           # 公共头部与底部
├── meta-cssjs.php                    # 头部 CSS、字体、统计代码等
├── body-js.php                       # 底部 JS、菜单、在线客服、GTM 等
├── page-*.php                        # 独立页面模板
├── single-products.php               # 自定义产品详情页模板
├── taxonomy-product_cat.php          # 产品分类页模板
├── taxonomy-distributor_cat.php      # 经销商分类页模板
├── taxonomy-download_cat.php         # 下载资料分类页模板
└── css/ js/ images/ svg/             # 前端资源
```

本次插件包的核心目录为：

```text
plugins/settings-page-generatewp-com/
└── settings-page-generatewp-com.php  # 后台“Page Settings”配置插件
```

## 二、这套主题中最值得复用的代码模块

### 1. 后台列表显示特色图

适用场景：后台文章、页面、产品列表很多时，增加缩略图列可以更快识别内容。

```php
add_theme_support('post-thumbnails', ['post', 'page', 'products']);

function my_add_thumbnail_column($columns) {
    $columns['thumbnail'] = __('Thumbnail');
    return $columns;
}

function my_render_thumbnail_column($column_name, $post_id) {
    if ($column_name !== 'thumbnail') {
        return;
    }

    $thumb = get_the_post_thumbnail($post_id, [60, 40]);
    echo $thumb ?: __('None');
}

add_filter('manage_posts_columns', 'my_add_thumbnail_column');
add_action('manage_posts_custom_column', 'my_render_thumbnail_column', 10, 2);
add_filter('manage_pages_columns', 'my_add_thumbnail_column');
add_action('manage_pages_custom_column', 'my_render_thumbnail_column', 10, 2);
```

### 2. 文章相关内容 ID 字段

适用场景：文章详情页需要手动指定相关帖子，而不是完全依赖自动推荐。

```php
add_action('add_meta_boxes', function () {
    add_meta_box(
        'related_posts_meta_box',
        'Related Posts',
        'my_render_related_posts_meta_box',
        'post',
        'normal',
        'default'
    );
});

function my_render_related_posts_meta_box($post) {
    $value = get_post_meta($post->ID, 'related_posts', true);
    wp_nonce_field('save_related_posts', 'related_posts_nonce');

    echo '<input type="text" style="width:100%" name="related_posts" value="' . esc_attr($value) . '">';
    echo '<p>多个文章 ID 用英文逗号分隔，例如：12,36,58</p>';
}

add_action('save_post', function ($post_id) {
    if (!isset($_POST['related_posts_nonce']) || !wp_verify_nonce($_POST['related_posts_nonce'], 'save_related_posts')) {
        return;
    }
    if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
        return;
    }
    if (isset($_POST['related_posts'])) {
        update_post_meta($post_id, 'related_posts', sanitize_text_field($_POST['related_posts']));
    }
});
```

### 3. 禁用 WordPress 自动生成过多图片尺寸

适用场景：图片很多的企业站或产品站，避免上传一张图自动生成太多尺寸，占用空间。

```php
add_filter('intermediate_image_sizes_advanced', function ($sizes) {
    unset($sizes['thumbnail']);
    unset($sizes['medium']);
    unset($sizes['large']);
    unset($sizes['medium_large']);
    unset($sizes['1536x1536']);
    unset($sizes['2048x2048']);

    return $sizes;
});

add_filter('big_image_size_threshold', '__return_false');

add_action('init', function () {
    remove_image_size('post-thumbnail');
});
```

注意：原主题代码里这段逻辑很实用，但整理成知识库时建议补上 `return $sizes;`，否则过滤器返回值不够明确。

### 4. 自定义文章类型 + 分类法模板

适用场景：产品、下载资料、FAQ、Instagram 动态、VR 视频、经销商网络等都可以用这个模式扩展。

```php
add_action('init', function () {
    register_post_type('products', [
        'labels' => [
            'name'          => __('Products', 'mytheme'),
            'singular_name' => __('Product', 'mytheme'),
            'add_new_item'  => __('Add New Product', 'mytheme'),
        ],
        'public'       => true,
        'has_archive'  => true,
        'menu_icon'    => 'dashicons-products',
        'supports'     => ['title', 'editor', 'thumbnail', 'excerpt', 'page-attributes'],
        'rewrite'      => ['slug' => 'products'],
        'show_in_rest' => true,
    ]);

    register_taxonomy('product_cat', ['products'], [
        'labels' => [
            'name'          => __('Categories', 'mytheme'),
            'singular_name' => __('Category', 'mytheme'),
        ],
        'hierarchical'      => true,
        'public'            => true,
        'show_admin_column' => true,
        'rewrite'           => ['slug' => 'product-cat'],
        'show_in_rest'      => true,
    ]);
});
```

### 5. 分类页自定义 SEO 标题和页面说明

适用场景：产品分类页、下载分类页或经销商分类页需要单独写 SEO 标题和页面介绍内容。

```php
class My_Term_Meta {
    public function __construct() {
        add_action('product_cat_add_form_fields', [$this, 'create_fields']);
        add_action('product_cat_edit_form_fields', [$this, 'edit_fields'], 10, 2);
        add_action('created_product_cat', [$this, 'save_fields']);
        add_action('edited_product_cat', [$this, 'save_fields']);
    }

    public function create_fields() {
        echo '<div class="form-field">';
        echo '<label for="seotitle">SEO Title</label>';
        echo '<input type="text" id="seotitle" name="seotitle" value="">';
        echo '</div>';

        echo '<div class="form-field">';
        echo '<label for="pagedesc">Page Text</label>';
        wp_editor('', 'pagedesc', ['textarea_rows' => 5]);
        echo '</div>';
    }

    public function edit_fields($term) {
        $seotitle = get_term_meta($term->term_id, 'seotitle', true);
        $pagedesc = get_term_meta($term->term_id, 'pagedesc', true);

        echo '<tr class="form-field"><th><label for="seotitle">SEO Title</label></th><td>';
        echo '<input type="text" id="seotitle" name="seotitle" value="' . esc_attr($seotitle) . '">';
        echo '</td></tr>';

        echo '<tr class="form-field"><th><label for="pagedesc">Page Text</label></th><td>';
        wp_editor($pagedesc, 'pagedesc', ['textarea_rows' => 5]);
        echo '</td></tr>';
    }

    public function save_fields($term_id) {
        update_term_meta($term_id, 'seotitle', sanitize_text_field($_POST['seotitle'] ?? ''));
        update_term_meta($term_id, 'pagedesc', wp_kses_post($_POST['pagedesc'] ?? ''));
    }
}
new My_Term_Meta();
```

### 6. 自定义字段 Metabox + 媒体上传

适用场景：自定义产品需要多个产品图、PDF ID、VR 链接、二维码等字段。

```php
add_action('add_meta_boxes', function () {
    add_meta_box('product_more_fields', 'More Product Fields', 'my_product_fields_callback', 'products');
});

add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook === 'post.php' || $hook === 'post-new.php') {
        wp_enqueue_media();
    }
});

function my_product_fields_callback($post) {
    wp_nonce_field('save_product_more_fields', 'product_more_fields_nonce');
    $pic01 = get_post_meta($post->ID, 'product_pic01', true);
    $pdf_ids = get_post_meta($post->ID, 'pdf_ids', true);

    echo '<p><label>Product Image URL</label></p>';
    echo '<input type="text" class="regular-text" name="product_pic01" value="' . esc_attr($pic01) . '">';

    echo '<p><label>PDF IDs</label></p>';
    echo '<input type="text" class="regular-text" name="pdf_ids" value="' . esc_attr($pdf_ids) . '">';
}

add_action('save_post_products', function ($post_id) {
    if (!isset($_POST['product_more_fields_nonce']) || !wp_verify_nonce($_POST['product_more_fields_nonce'], 'save_product_more_fields')) {
        return;
    }

    update_post_meta($post_id, 'product_pic01', esc_url_raw($_POST['product_pic01'] ?? ''));
    update_post_meta($post_id, 'pdf_ids', sanitize_text_field($_POST['pdf_ids'] ?? ''));
});
```

### 7. 多图上传 + 拖拽排序图库字段

适用场景：项目案例、Instagram 动态、工程图片、证书图库等。

```php
add_action('admin_enqueue_scripts', function ($hook) {
    if ($hook !== 'post.php' && $hook !== 'post-new.php') {
        return;
    }

    $screen = get_current_screen();
    if (!$screen || $screen->post_type !== 'insfeeds') {
        return;
    }

    wp_enqueue_media();
    wp_enqueue_script('jquery-ui-sortable');
});

add_action('add_meta_boxes', function () {
    add_meta_box('insfeed_gallery', 'Gallery Images', 'my_gallery_metabox_cb', 'insfeeds', 'normal', 'high');
});

function my_gallery_metabox_cb($post) {
    wp_nonce_field('save_gallery_images', 'gallery_images_nonce');
    $image_ids = get_post_meta($post->ID, '_gallery_images', true);
    if (!is_array($image_ids)) {
        $image_ids = [];
    }

    echo '<ul id="gallery-list" style="display:flex;gap:10px;flex-wrap:wrap;">';
    foreach ($image_ids as $id) {
        $thumb = wp_get_attachment_image_url($id, 'thumbnail');
        echo '<li data-id="' . esc_attr($id) . '">';
        echo '<input type="hidden" name="gallery_images[]" value="' . esc_attr($id) . '">';
        echo '<img src="' . esc_url($thumb) . '" style="width:80px;height:80px;object-fit:cover;">';
        echo '</li>';
    }
    echo '</ul>';
    echo '<button type="button" class="button" id="add-gallery-images">Add Images</button>';
}
```

说明：前端 JS 负责打开 `wp.media()`、追加 `<li>`、删除图片和拖拽排序；保存时使用 `absint()` 清洗 ID，并用 `wp_attachment_is_image()` 只保留图片。

### 8. 统一分页数量设置

适用场景：搜索页、作者页、标签页、日期归档页、产品分类页，每页统一显示 9 条。

```php
add_action('pre_get_posts', function ($query) {
    if (is_admin() || !$query->is_main_query()) {
        return;
    }

    if ($query->is_search() || $query->is_author() || $query->is_tag() || $query->is_date()) {
        $query->set('posts_per_page', 9);
    }

    if (is_tax('product_cat') || is_post_type_archive('products')) {
        $query->set('posts_per_page', 9);
    }
});
```

### 9. 数字分页函数

适用场景：列表页不想只显示“上一页 / 下一页”，而是显示页码。

```php
function mytheme_pagination($range = 1) {
    if (is_singular()) {
        return;
    }

    global $wp_query, $paged;
    $max_page = (int) $wp_query->max_num_pages;
    if ($max_page <= 1) {
        return;
    }

    $paged = $paged ?: 1;

    echo '<ul class="pagination">';
    echo '<li>'; previous_posts_link('&laquo;'); echo '</li>';

    for ($i = $paged - $range; $i <= $paged + $range; $i++) {
        if ($i > 0 && $i <= $max_page) {
            $class = $i === (int) $paged ? ' class="active"' : '';
            echo '<li><a' . $class . ' href="' . esc_url(get_pagenum_link($i)) . '">' . esc_html($i) . '</a></li>';
        }
    }

    echo '<li>'; next_posts_link('&raquo;'); echo '</li>';
    echo '</ul>';
}
```

### 10. Ajax 表单邮件处理模板

适用场景：联系表单、计算器结果、展会报名、经销商申请等自定义表单。

```php
add_action('wp_ajax_send_custom_form', 'my_send_custom_form');
add_action('wp_ajax_nopriv_send_custom_form', 'my_send_custom_form');

function my_send_custom_form() {
    check_ajax_referer('custom_form_nonce', 'nonce');

    $name    = sanitize_text_field($_POST['name'] ?? '');
    $email   = sanitize_email($_POST['email'] ?? '');
    $phone   = sanitize_text_field($_POST['phone'] ?? '');
    $message = sanitize_textarea_field($_POST['message'] ?? '');
    $page_url = esc_url_raw($_POST['page_url'] ?? '');

    if (!$name || !$email) {
        wp_send_json_error(['msg' => 'Required fields are missing.']);
    }

    $to = 'company@example.com';
    $subject = 'New Website Inquiry';
    $body = '<p><strong>Name:</strong> ' . esc_html($name) . '</p>';
    $body .= '<p><strong>Email:</strong> ' . esc_html($email) . '</p>';
    $body .= '<p><strong>Phone:</strong> ' . esc_html($phone) . '</p>';
    $body .= '<p><strong>Message:</strong><br>' . nl2br(esc_html($message)) . '</p>';
    $body .= '<p><strong>Page URL:</strong> <a href="' . esc_url($page_url) . '">' . esc_html($page_url) . '</a></p>';

    $headers = ['Content-Type: text/html; charset=UTF-8'];

    if (wp_mail($to, $subject, $body, $headers)) {
        wp_send_json_success(['msg' => 'Submitted successfully.']);
    }

    wp_send_json_error(['msg' => 'Email sending failed.']);
}
```

注意：SMTP 账号、授权码、真实邮箱不建议写死在主题里，更适合放在服务器环境变量、配置文件或专门邮件插件中。

### 11. 后台 Page Settings 小插件

适用场景：把全站通用信息集中放到后台，例如联系人、电话、邮箱、社媒链接、Banner 图片、首页 SEO 信息。

```php
/**
 * Plugin Name: Page Settings
 * Description: 添加全站通用页面设置，例如联系人、电话、邮箱、社媒链接、Banner 等。
 */
class My_Page_Settings {
    public function __construct() {
        add_action('admin_menu', [$this, 'add_admin_menu']);
        add_action('admin_init', [$this, 'init_settings']);
    }

    public function add_admin_menu() {
        add_menu_page(
            'Page Settings',
            'Page Settings',
            'manage_options',
            'page_settings',
            [$this, 'page_layout'],
            'dashicons-admin-generic',
            99
        );
    }

    public function init_settings() {
        register_setting('settings_group', 'settings_name');
        add_settings_section('settings_section', '', '__return_false', 'settings_name');

        $fields = [
            'contactli' => '联系人',
            'phoneli'   => '联系电话',
            'emailli'   => '联系邮箱',
            'facebookli'=> 'Facebook',
            'instagramli'=> 'Instagram',
        ];

        foreach ($fields as $id => $label) {
            add_settings_field($id, $label, [$this, 'render_text_field'], 'settings_name', 'settings_section', ['id' => $id]);
        }
    }

    public function render_text_field($args) {
        $options = get_option('settings_name');
        $id = $args['id'];
        $value = $options[$id] ?? '';
        echo '<input type="text" class="regular-text" name="settings_name[' . esc_attr($id) . ']" value="' . esc_attr($value) . '">';
    }

    public function page_layout() {
        echo '<div class="wrap"><h1>Page Settings</h1><form method="post" action="options.php">';
        settings_fields('settings_group');
        do_settings_sections('settings_name');
        submit_button();
        echo '</form></div>';
    }
}
new My_Page_Settings();
```

前台调用示例：

```php
$options = get_option('settings_name');
echo esc_html($options['phoneli'] ?? '');
echo esc_html($options['emailli'] ?? '');
```

### 12. WordPress 头部清理代码

适用场景：企业站或外贸站想减少无关头部标签、隐藏版本信息、去掉 emoji、feed、短链接等。

```php
remove_action('wp_head', 'wp_shortlink_wp_head');
remove_action('wp_head', 'wp_generator');
remove_action('wp_head', 'feed_links', 2);
remove_action('wp_head', 'feed_links_extra', 3);
remove_action('wp_head', 'rsd_link');
remove_action('wp_head', 'wlwmanifest_link');
remove_action('wp_head', 'print_emoji_detection_script', 7);
remove_action('wp_print_styles', 'print_emoji_styles');
remove_action('wp_head', 'rest_output_link_wp_head', 10);
remove_action('wp_head', 'wp_resource_hints', 2, 99);

add_filter('get_the_archive_title_prefix', '__return_false');
```

注意：如果网站依赖 RSS、REST API、外部编辑器或某些 SEO 插件功能，不要盲目全部删除。

## 三、v1.0.2 建议沉淀的“长期复用模块”

| 模块 | 推荐保存位置 | 复用价值 | 风险 |
|---|---|---:|---:|
| 后台缩略图列 | `functions.php` / 小插件 | 高 | 低 |
| 相关帖子字段 | `functions.php` / 小插件 | 中 | 低 |
| 自定义文章类型与分类法 | 独立插件更佳 | 高 | 中 |
| 分类 SEO 标题和页面描述 | `functions.php` / 小插件 | 高 | 中 |
| 产品自定义字段 Metabox | 独立插件更佳 | 高 | 中 |
| 多图图库 Metabox | 独立插件更佳 | 高 | 中 |
| Ajax 表单邮件 | 独立插件更佳 | 高 | 中 |
| SMTP 配置 | 邮件插件 / 环境变量 | 高 | 高 |
| Page Settings 后台配置 | 小插件 | 高 | 中 |
| WordPress 头部清理 | `functions.php` | 中 | 中 |

## 四、维护建议

1. **能做成插件的功能，尽量不要全部塞进主题**。例如 CPT、全站设置、表单处理、下载资料、经销商数据等，未来换主题时仍可保留。
2. **主题更适合放展示层**，例如 `header.php`、`footer.php`、页面模板、分类模板、详情模板、CSS/JS。
3. **表单和邮件逻辑需要单独测试**，尤其是 Ajax、SMTP、Reply-To、验证码、防垃圾提交和邮件送达率。
4. **真实账号信息不要进入 GitHub**，SMTP 授权码、邮箱、统计 ID、客户资料都应脱敏。
5. **自定义字段保存时必须注意权限与 nonce**，避免后台字段被恶意提交。
6. **经销商地图、Instagram 图库、VR 视频等模块适合独立整理为插件**，这样未来多个站点可复用。

## 五、v1.0.2 首页新增知识卡片

本版本已同步在 `index.html` 中新增普通 WordPress 主题 / 插件相关知识卡片，便于在线搜索和复制。主要包括：

- 普通 WordPress 主题文件地图
- 后台 Page Settings 小插件
- 自定义文章类型 + 分类法模板
- 分类页 SEO 标题和页面说明
- 自定义字段 Metabox + 媒体上传
- 多图上传 + 拖拽排序图库字段
- Ajax 表单邮件处理模板
- 统一分页数量设置
- WordPress 头部清理代码
