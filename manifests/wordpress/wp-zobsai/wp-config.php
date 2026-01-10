<?php
/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the website, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * ABSPATH
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'bitnami_wordpress' );

/** Database username */
define( 'DB_USER', 'bn_wordpress' );

/** Database password */
define( 'DB_PASSWORD', 'admin1234!' );

/** Database hostname */
define( 'DB_HOST', 'wp-zobsai-mariadb:3306' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',         '0mf{Sb:Q@_ZNr?p2cjwzsP]o]/Jda:,=LmfQTlc[g_dyv#HY=u!/h^<E>S150y(h' );
define( 'SECURE_AUTH_KEY',  'ZIwjD4*8]qq33irH`fJoUd$Vu*5cBIR[G-Qvv}/8WRP@sDEs`aa6N#e88JUG85<K' );
define( 'LOGGED_IN_KEY',    '3^A>JdKO&e-irAaPzY-B)OKa*Yu|L/zQHJ}+[DnI~|A?wIlt2{A%SE5h<.haUP/g' );
define( 'NONCE_KEY',        '-+Nu(FcufFZGPxi*jSlS;hE&G>m%saQwGSHmTK.*KpVg@y6Z?uL,vp]uI>3+Ggld' );
define( 'AUTH_SALT',        '<g~4A^zQv6@Tvu=% uXndYN`RD~B81~K/<J$4]^MH!cJ#]4cAs .x~?=$WkAJ8wj' );
define( 'SECURE_AUTH_SALT', 'WBm`NIClFe/(.dP)hLb}!(z=lN)K+fqQYi9fjm$WIF6W8O=^PS5P3Qy2pgj|G=j@' );
define( 'LOGGED_IN_SALT',   'tO,(nC>6Xq9f_(ZgAtm&2c7i6*LxqVfCB-mf<odsn{!(.XMT},:,<Qd?U|6L]EIt' );
define( 'NONCE_SALT',       'F# E+o[ma<vpJk$qR?p47B.}bh|m^2_YlUtiS<F5be[mL4j7N[dN4g_7,H;w@$3u' );

/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 *
 * At the installation time, database tables are created with the specified prefix.
 * Changing this value after WordPress is installed will make your site think
 * it has not been installed.
 *
 * @link https://developer.wordpress.org/advanced-administration/wordpress/wp-config/#table-prefix
 */
$table_prefix = 'wp_';

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/
 */
define( 'WP_DEBUG', false );

/* Add any custom values between this line and the "stop editing" line. */



define( 'FS_METHOD', 'direct' );
/**
 * The WP_SITEURL and WP_HOME options are configured to access from any hostname or IP address.
 * If you want to access only from an specific domain, you can modify them. For example:
 *  define('WP_HOME','http://example.com');
 *  define('WP_SITEURL','http://example.com');
 *
 */
if ( defined( 'WP_CLI' ) ) {
	$_SERVER['HTTP_HOST'] = '127.0.0.1';
}

// Detect HTTPS when behind a proxy (Traefik) using X-Forwarded-Proto
if ( isset( $_SERVER['HTTP_X_FORWARDED_PROTO'] ) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https' ) {
	$_SERVER['HTTPS'] = 'on';
}

// Force front-end and site URLs to the public resources path
$host = isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : 'zobsai.com';
if ( $host === 'blog.zobsai.com' ) {
	define( 'WP_HOME', 'https://blog.zobsai.com/resources' );
	define( 'WP_SITEURL', 'https://blog.zobsai.com/resources' );
} else {
	define( 'WP_HOME', 'https://zobsai.com/resources' );
	define( 'WP_SITEURL', 'https://zobsai.com/resources' );
}

// Ensure admin uses SSL
define( 'FORCE_SSL_ADMIN', true );

define( 'WP_AUTO_UPDATE_CORE', false );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';

/**
 * Disable pingback.ping xmlrpc method to prevent WordPress from participating in DDoS attacks
 * More info at: https://docs.bitnami.com/general/apps/wordpress/troubleshooting/xmlrpc-and-pingback/
 */
if ( !defined( 'WP_CLI' ) ) {
	// remove x-pingback HTTP header
	add_filter("wp_headers", function($headers) {
		unset($headers["X-Pingback"]);
		return $headers;
	});
	// disable pingbacks
	add_filter( "xmlrpc_methods", function( $methods ) {
		unset( $methods["pingback.ping"] );
		return $methods;
	});
}
