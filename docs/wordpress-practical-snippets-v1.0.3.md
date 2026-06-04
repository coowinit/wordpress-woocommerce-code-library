# WordPress 高频救急代码与模板标签速查 v1.0.3

本文件作为仓库 v1.0.3 的补充文档，重点整理日常 WordPress 维护、主题开发、模板查询、分页、面包屑、自定义内容类型、Ajax 表单和插件开发中最常用、后期可重复使用的代码片段。

> 维护原则：能用插件稳定解决的需求，优先用插件；需要长期复用、结构清晰、不会频繁变动的功能，可以沉淀为 `functions.php` 或小插件代码。涉及账号、数据库、邮件、权限、Ajax 的代码，必须先在测试环境验证。

---

## 1. 忘记管理员密码：通过 FTP 临时新增管理员账号

### 适用场景

当你确认网站属于自己或公司，并且无法通过邮箱找回管理员密码时，可以通过 FTP / 文件管理器临时修改主题的 `functions.php`，创建一个临时管理员账号。

### 重要安全规则

1. 只允许用于自己有权限维护的网站。
2. 不要把真实账号、真实邮箱、真实密码写入公开仓库。
3. 登录成功后，必须立刻删除这段代码。
4. 之后应修改管理员密码，并检查是否存在异常管理员账号。
5. 建议优先通过数据库、WP-CLI、后台邮箱重置等正规方式找回，`functions.php` 方式只作为救急方法。

### 推荐代码

```php
/**
 * 临时新增管理员账号：仅限自有网站救急使用。
 * 用完后必须从 functions.php 中删除。
 */
function coowin_create_temp_admin_account() {
    $user  = 'temp_recovery_admin';
    $pass  = 'CHANGE_THIS_TO_A_STRONG_PASSWORD';
    $email = 'temp-admin@example.com';

    if ( username_exists( $user ) || email_exists( $email ) ) {
        return;
    }

    $user_id = wp_create_user( $user, $pass, $email );

    if ( is_wp_error( $user_id ) ) {
        return;
    }

    $wp_user = new WP_User( $user_id );
    $wp_user->set_role( 'administrator' );
}
add_action( 'init', 'coowin_create_temp_admin_account' );
```

### 使用步骤

1. 通过 FTP 打开当前主题或子主题的 `functions.php`。
2. 把上面代码临时放到文件末尾。
3. 访问网站任意页面，让 `init` 钩子执行。
4. 使用临时账号登录后台。
5. 登录成功后，立即删除这段代码。
6. 到“用户”中删除临时管理员账号，或修改为正式安全账号。

---

## 2. 禁用 WordPress 自动生成的图片尺寸

### 使用场景

部分企业站、产品站上传大量高清图片时，WordPress 会自动生成多种缩略图。如果你确认网站只使用原图或少数指定尺寸，可以关闭不需要的尺寸，减少服务器空间占用。

### 修正版代码

用户提供的原始示例里有一个常见问题：`return $sizes;` 被写在注释后面，实际会导致返回值丢失。正确写法如下：

```php
/**
 * 禁用 WordPress 默认生成的部分图片尺寸。
 * 注意：只影响之后上传的新图片，不会自动删除历史图片。
 */
function coowin_disable_default_image_sizes( $sizes ) {
    unset( $sizes['thumbnail'] );
    unset( $sizes['medium'] );
    unset( $sizes['large'] );
    unset( $sizes['medium_large'] );
    unset( $sizes['1536x1536'] );
    unset( $sizes['2048x2048'] );

    return $sizes;
}
add_filter( 'intermediate_image_sizes_advanced', 'coowin_disable_default_image_sizes' );

/**
 * 禁用大图自动缩放。
 */
add_filter( 'big_image_size_threshold', '__return_false' );

/**
 * 移除主题或插件额外注册的图片尺寸。
 * 这里的名称需要根据当前主题或插件实际注册的尺寸修改。
 */
function coowin_remove_custom_image_sizes() {
    remove_image_size( 'post-thumbnail' );
    remove_image_size( 'another-size' );
}
add_action( 'init', 'coowin_remove_custom_image_sizes', 99 );
```

### 注意事项

- 这类代码主要影响“后续上传”的图片。
- 已经生成的历史缩略图不会自动删除。
- 如果主题、WooCommerce、Elementor 或插件依赖某些缩略图尺寸，不要全部禁用。
- `remove_image_size()` 更适合移除主题或插件额外注册的尺寸；部分 WordPress 保留尺寸需要通过过滤器或后台媒体设置处理。

---

## 3. 面包屑导航

### 3.1 插件 / WordPress 7.0 后更推荐的做法

如果项目已经使用 SEO 插件、面包屑插件或块主题模板，建议优先使用插件输出函数或模板部件，不要在每个模板文件里重复硬编码。

常见兼容写法：

```php
<div class="site-breadcrumbs" aria-label="Breadcrumb">
    <?php
    if ( function_exists( 'rank_math_the_breadcrumbs' ) ) {
        rank_math_the_breadcrumbs();
    } elseif ( function_exists( 'yoast_breadcrumb' ) ) {
        yoast_breadcrumb( '<p id="breadcrumbs">', '</p>' );
    } elseif ( function_exists( 'bcn_display' ) ) {
        echo '<nav class="breadcrumbs">';
        bcn_display();
        echo '</nav>';
    }
    ?>
</div>
```

使用建议：

- 如果网站使用块主题，可以把面包屑放在 Header、模板部件或单独的 Pattern 中。
- 如果网站使用传统 PHP 主题，可以放在 `header.php`、`single.php`、`archive.php` 或自定义模板中。
- 插件输出更适合长期维护；自定义代码更适合轻量企业站。

### 3.2 自定义面包屑核心逻辑

```php
function coowin_breadcrumbs() {
    if ( is_front_page() ) {
        return;
    }

    echo '<nav class="breadcrumbs" aria-label="Breadcrumb">';
    echo '<a href="' . esc_url( home_url( '/' ) ) . '">Home</a>';

    if ( is_category() || is_single() ) {
        $categories = get_the_category();

        if ( ! empty( $categories ) ) {
            echo ' <span>/</span> ';
            echo '<a href="' . esc_url( get_category_link( $categories[0]->term_id ) ) . '">';
            echo esc_html( $categories[0]->name );
            echo '</a>';
        }

        if ( is_single() ) {
            echo ' <span>/</span> ';
            echo '<span>' . esc_html( get_the_title() ) . '</span>';
        }
    } elseif ( is_page() ) {
        echo ' <span>/</span> ';
        echo '<span>' . esc_html( get_the_title() ) . '</span>';
    } elseif ( is_search() ) {
        echo ' <span>/</span> ';
        echo '<span>Search: ' . esc_html( get_search_query() ) . '</span>';
    } elseif ( is_404() ) {
        echo ' <span>/</span> ';
        echo '<span>404</span>';
    }

    echo '</nav>';
}
```

模板中调用：

```php
<?php coowin_breadcrumbs(); ?>
```

---

## 4. 分页代码实现

### 4.1 WordPress 内置函数

归档页、分类页、标签页、搜索页等主查询场景，优先使用：

```php
<?php
the_posts_pagination( array(
    'mid_size'  => 2,
    'prev_text' => '上一页',
    'next_text' => '下一页',
) );
?>
```

### 4.2 自定义 WP_Query 分页核心写法

当你自己写 `WP_Query` 时，要同时处理 `paged`、`max_num_pages` 和 `wp_reset_postdata()`。

```php
<?php
$paged = max( 1, get_query_var( 'paged' ), get_query_var( 'page' ) );

$query = new WP_Query( array(
    'post_type'      => 'post',
    'posts_per_page' => 9,
    'paged'          => $paged,
) );

if ( $query->have_posts() ) :
    while ( $query->have_posts() ) :
        $query->the_post();
        get_template_part( 'template-parts/content', get_post_type() );
    endwhile;

    echo paginate_links( array(
        'total'   => $query->max_num_pages,
        'current' => $paged,
        'prev_text' => '上一页',
        'next_text' => '下一页',
    ) );

    wp_reset_postdata();
endif;
?>
```

---

## 5. 自定义内容类型和分类法

### 5.1 插件方式

适合不想写代码、需要后台可视化管理的项目。

常见做法：

1. 使用 CPT / 字段管理类插件创建内容类型。
2. 后台创建内容类型，例如：产品案例、下载资料、FAQ、项目案例。
3. 需要分类时，再创建对应 Taxonomy。
4. 模板中仍然通过 `WP_Query` 或归档模板输出。

插件方式优点：

- 快速；
- 后台可视化；
- 适合非开发人员维护。

插件方式缺点：

- 依赖插件；
- 迁移项目时要注意插件配置；
- 对长期标准化项目来说，代码方式更可控。

### 5.2 functions.php 自定义代码方式

```php
function coowin_register_project_post_type() {
    register_post_type( 'project', array(
        'labels' => array(
            'name'          => 'Projects',
            'singular_name' => 'Project',
        ),
        'public'       => true,
        'has_archive'  => true,
        'rewrite'      => array( 'slug' => 'projects' ),
        'menu_icon'    => 'dashicons-portfolio',
        'supports'     => array( 'title', 'editor', 'thumbnail', 'excerpt' ),
        'show_in_rest' => true,
    ) );

    register_taxonomy( 'project_category', 'project', array(
        'labels' => array(
            'name'          => 'Project Categories',
            'singular_name' => 'Project Category',
        ),
        'public'       => true,
        'hierarchical' => true,
        'rewrite'      => array( 'slug' => 'project-category' ),
        'show_in_rest' => true,
    ) );
}
add_action( 'init', 'coowin_register_project_post_type' );
```

添加后建议：

1. 进入后台“设置 → 固定链接”。
2. 不必修改内容，直接保存一次。
3. 让 WordPress 刷新 rewrite 规则。

---

## 6. 必须牢记的常用模板标签

### 6.1 get_template_part()

用于拆分模板，避免重复代码。

```php
get_template_part( 'template-parts/content', get_post_type() );
```

常见文件匹配：

```text
template-parts/content-post.php
template-parts/content-product.php
template-parts/content.php
```

---

### 6.2 single_cat_title()

分类页输出当前分类名称。

```php
<h1><?php single_cat_title(); ?></h1>
```

---

### 6.3 get_queried_object()

获取当前查询对象，常用于分类页、标签页、自定义分类页。

```php
<?php
$term = get_queried_object();

if ( $term && ! is_wp_error( $term ) ) {
    echo esc_html( $term->name );
    echo esc_html( $term->description );
}
?>
```

---

### 6.4 WP_Query 与 tax_query 常见写法

查询指定分类下文章：

```php
$query = new WP_Query( array(
    'post_type'      => 'post',
    'posts_per_page' => 6,
    'tax_query'      => array(
        array(
            'taxonomy' => 'category',
            'field'    => 'slug',
            'terms'    => array( 'news' ),
        ),
    ),
) );
```

查询自定义内容类型 + 自定义分类：

```php
$query = new WP_Query( array(
    'post_type'      => 'project',
    'posts_per_page' => 9,
    'tax_query'      => array(
        array(
            'taxonomy' => 'project_category',
            'field'    => 'slug',
            'terms'    => array( 'decking' ),
        ),
    ),
) );
```

---

### 6.5 wp_tag_cloud()

输出标签云。

```php
wp_tag_cloud( array(
    'smallest' => 12,
    'largest'  => 18,
    'unit'     => 'px',
    'number'   => 20,
) );
```

---

### 6.6 get_theme_file_uri()

获取当前主题文件路径，适合引用 CSS、JS、图片。

```php
<img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/logo.png' ) ); ?>" alt="Logo">
```

---

### 6.7 $.ajax() 表单提交

前台 JS：

```javascript
jQuery(function($) {
    $('#contactForm').on('submit', function(e) {
        e.preventDefault();

        $.ajax({
            url: ajax_object.ajax_url,
            type: 'POST',
            dataType: 'json',
            data: {
                action: 'coowin_submit_form',
                nonce: ajax_object.nonce,
                name: $('#name').val(),
                email: $('#email').val(),
                message: $('#message').val()
            },
            success: function(response) {
                if (response.success) {
                    alert('提交成功');
                } else {
                    alert(response.data || '提交失败');
                }
            }
        });
    });
});
```

functions.php：

```php
function coowin_enqueue_ajax_script() {
    wp_enqueue_script(
        'coowin-form',
        get_theme_file_uri( 'assets/js/form.js' ),
        array( 'jquery' ),
        '1.0.0',
        true
    );

    wp_localize_script( 'coowin-form', 'ajax_object', array(
        'ajax_url' => admin_url( 'admin-ajax.php' ),
        'nonce'    => wp_create_nonce( 'coowin_form_nonce' ),
    ) );
}
add_action( 'wp_enqueue_scripts', 'coowin_enqueue_ajax_script' );

function coowin_submit_form() {
    check_ajax_referer( 'coowin_form_nonce', 'nonce' );

    $name    = sanitize_text_field( $_POST['name'] ?? '' );
    $email   = sanitize_email( $_POST['email'] ?? '' );
    $message = sanitize_textarea_field( $_POST['message'] ?? '' );

    if ( empty( $name ) || empty( $email ) ) {
        wp_send_json_error( '请填写姓名和邮箱。' );
    }

    wp_mail(
        get_option( 'admin_email' ),
        'New Form Submission',
        "Name: {$name}\nEmail: {$email}\nMessage: {$message}"
    );

    wp_send_json_success( '提交成功。' );
}
add_action( 'wp_ajax_coowin_submit_form', 'coowin_submit_form' );
add_action( 'wp_ajax_nopriv_coowin_submit_form', 'coowin_submit_form' );
```

---

### 6.8 `<script data-nowprocket>`

如果网站使用 Rocket / 缓存 / 性能优化类插件，部分脚本可能因为延迟加载、合并、压缩而出错。可以给关键脚本加自定义属性，让优化插件跳过这类脚本。

```html
<script data-nowprocket src="/wp-content/themes/mytheme/assets/js/important.js"></script>
```

WordPress 入队脚本时添加属性：

```php
function coowin_add_data_nowprocket_attribute( $tag, $handle, $src ) {
    if ( 'coowin-important-script' === $handle ) {
        return '<script data-nowprocket src="' . esc_url( $src ) . '"></script>';
    }

    return $tag;
}
add_filter( 'script_loader_tag', 'coowin_add_data_nowprocket_attribute', 10, 3 );
```

---

### 6.9 缩略图相关函数

获取特色图 URL：

```php
$image_url = get_the_post_thumbnail_url( get_the_ID(), 'large' );
```

直接输出特色图 URL：

```php
the_post_thumbnail_url( 'large' );
```

直接输出完整图片标签：

```php
the_post_thumbnail( 'large', array( 'class' => 'post-thumb' ) );
```

---

### 6.10 标签、分类和分页相关函数

```php
// 文章分页导航
the_posts_pagination();

// 获取当前文章标签数组
$tags = wp_get_post_tags( get_the_ID() );

// 标签页输出当前标签名称
single_tag_title();

// 分类页输出当前分类名称
single_cat_title();
```

---

## 7. 插件开发必须牢记的 4 类代码

### 7.1 add_action()

在某个时机执行函数。

```php
add_action( 'init', 'coowin_plugin_init' );

function coowin_plugin_init() {
    // 插件初始化代码
}
```

### 7.2 add_filter()

修改 WordPress 原本要输出或处理的数据。

```php
add_filter( 'the_title', 'coowin_modify_title' );

function coowin_modify_title( $title ) {
    return $title;
}
```

### 7.3 register_activation_hook()

插件启用时执行，常用于创建数据库表、初始化默认设置。

```php
register_activation_hook( __FILE__, 'coowin_plugin_activate' );

function coowin_plugin_activate() {
    // 插件启用时执行
}
```

### 7.4 add_shortcode()

注册短代码，方便在页面内容中调用插件功能。

```php
add_shortcode( 'coowin_demo', 'coowin_demo_shortcode' );

function coowin_demo_shortcode( $atts ) {
    return '<div class="coowin-demo">Hello WordPress</div>';
}
```

---

## 8. v1.0.3 维护建议

这一版建议作为“WordPress 高频记忆卡片”长期保留。后续你再遇到新的常用函数，可以继续追加到本文件，不一定每段都写很长，重点是保留：

- 函数名称；
- 使用场景；
- 最小可复用代码；
- 风险提醒；
- 放在哪个文件中。

---

## 9. 参考文档

- WordPress Developer Resources: `wp_create_user()`  
  https://developer.wordpress.org/reference/functions/wp_create_user/
- WordPress Developer Resources: `big_image_size_threshold`  
  https://developer.wordpress.org/reference/hooks/big_image_size_threshold/
- WordPress Developer Resources: `remove_image_size()`  
  https://developer.wordpress.org/reference/functions/remove_image_size/
- WordPress Developer Resources: `the_posts_pagination()`  
  https://developer.wordpress.org/reference/functions/the_posts_pagination/
- WordPress Developer Resources: `register_post_type()`  
  https://developer.wordpress.org/reference/functions/register_post_type/
- WordPress Developer Resources: `WP_Query`  
  https://developer.wordpress.org/reference/classes/wp_query/
