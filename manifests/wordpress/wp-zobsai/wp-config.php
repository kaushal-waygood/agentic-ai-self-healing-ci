<?php
/**
 * WordPress base configuration for Zobsai
 */

/** Database settings */
define( 'DB_NAME', 'bitnami_wordpress' );
define( 'DB_USER', 'bn_wordpress' );
define( 'DB_PASSWORD', 'admin1234!' );
define( 'DB_HOST', 'wp-zobsai-mariadb:3306' );
define( 'DB_CHARSET', 'utf8' );
define( 'DB_COLLATE', '' );

/** Authentication Unique Keys and Salts */
define( 'AUTH_KEY',         '{5RBP2CQ,.]bpoK/xKN;3hcc%, $/w|SmItGgc^LV%dTH#q2X]y5yiDo7<y?(#1e' );
define( 'SECURE_AUTH_KEY',  '?H<RVvd,J]E9ItH2Gmhd,+vyzLVEe2/o>!{Jx!7~2yzxZxV}}%OcYa`(ciwt_:9[' );
define( 'LOGGED_IN_KEY',    'evPu$}|GpP{<W=7i~}?4o7,4,FF3^29.=y!4BNl;@Zi&~M+;_N0_f9OFXaCm;uMC' );
define( 'NONCE_KEY',        '6uR-^;mT0V~>(Q-74`%}rChnc(mDMAQdnw*y=RD)f^$AI@!4e2ItV$iS<&3@wSVu' );
define( 'AUTH_SALT',        'd}.1J,}rkr9N@+Z_&l{3XU]WP25@?WO}Uy8r~TE@<6GuIAK/hM<^L8]ml{VBC 54' );
define( 'SECURE_AUTH_SALT', 'Cmz00MHFA>4ZaoT(c^90d.>9IYnle0%I#j~f=~O,JaeR8v-0z^x)n?Alr8?;9A>X' );
define( 'LOGGED_IN_SALT',   'Tha:=DTWE{M-AChVyiX[cDk8SU/rG CKb2s3{5x1 >Xn3)kj*lK5>5{5pG$8BWmV' );
define( 'NONCE_SALT',       ']Kgw!^j--^rngCIY_Z[=dTE=AmW+l#0xd|KbF.$ 1elp:v-~T9o|1Y2,{:!<.<_y' );

/** Database table prefix */
$table_prefix = 'wp_';

/** Debug mode */
define( 'WP_DEBUG', false );

/**
 * Traefik / Kubernetes prefix support
 * Ensures WordPress works under /resources
 */
$blog_prefix = '/resources';
if (isset($_SERVER['HTTP_X_FORWARDED_PREFIX'])) {
    $prefix = rtrim($_SERVER['HTTP_X_FORWARDED_PREFIX'], '/');
    if (!empty($prefix)) {
        if (isset($_SERVER['REQUEST_URI']) && strpos($_SERVER['REQUEST_URI'], $prefix) !== 0) {
            $_SERVER['REQUEST_URI'] = $prefix . $_SERVER['REQUEST_URI'];
        }
        if (isset($_SERVER['PHP_SELF']) && strpos($_SERVER['PHP_SELF'], $prefix) !== 0) {
            $_SERVER['PHP_SELF'] = $prefix . $_SERVER['PHP_SELF'];
        }
    }
}

/** WP URLs */
define('WP_HOME', 'https://zobsai.com/resources');
define('WP_SITEURL', 'https://zobsai.com/resources');

/** Cookie settings */
define('COOKIE_DOMAIN', 'zobsai.com');
define('COOKIEPATH', $blog_prefix . '/');
define('SITECOOKIEPATH', $blog_prefix . '/');

/** File system method */
define( 'FS_METHOD', 'direct' );

/** Absolute path */
if ( ! defined( 'ABSPATH' ) ) {
    define( 'ABSPATH', __DIR__ . '/' );
}

/** Load WordPress vars and files */
require_once ABSPATH . 'wp-settings.php';

/** Disable pingbacks for security */
if ( !defined( 'WP_CLI' ) ) {
    add_filter("wp_headers", function($headers) {
        unset($headers["X-Pingback"]);
        return $headers;
    });
    add_filter("xmlrpc_methods", function($methods) {
        unset($methods["pingback.ping"]);
        return $methods;
    });
}
