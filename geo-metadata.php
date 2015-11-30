<?php
/*
Plugin Name: Geo-Meta
Plugin URI: http://www.bloom.li
Description: Adds ability to geotag a post using metadata.
Version: 1.0
Author: Bloom
Author URI: http://www.bloom.li
License: GPL2
*/

//Adds a location input to post editor
function blm_location_custom_meta(){
	add_meta_box('blm_location_meta', __('Location of this post', 'location-textdomain'), 'blm_location_callback', 'post');
}
add_action('add_meta_boxes', 'blm_location_custom_meta');

//Displays the location input in editor
function blm_location_callback($post) {

	//Secures the function (see https://codex.wordpress.org/WordPress_Nonces)
	wp_nonce_field(basename( __FILE__ ), 'blm_location_nonce');

	//Fetch currently-saved post location data
	$blm_formatted_address = get_post_meta($post->ID, 'blm_formatted_address', true);
	$blm_address_components = get_post_meta($post->ID, 'blm_address_components', true);
	$blm_latitude = get_post_meta($post->ID, 'blm_latitude', true);
	$blm_longitude = get_post_meta($post->ID, 'blm_longitude', true);

	?>

	<div id="blm_meta_intro">The location selected here should define the location discussed in this post, if applicable.  By saving the location, the post is <a href="http://www.bloom.li/advocacy/metadata" title="Bloom" target="_blank">geotagged</a> by inserting the address and coordinates into the webpage metadata.</div>

	<div id="blm_location_selection_tool">
		<div id="blm_location_search">
			<div class="blm_search_title">Location Search</div>
			<div class="blm_search_body">
				<input type="text" id="blm_location_input" />
				<button type="button" id="blm_location_request" onClick="blm_geocode();">Search</button>
				<div id="blm_location_results"></div>
			</div>
		</div>

		<div id="blm_location_choice" data-display="<?=($blm_formatted_address)?1:0; ?>">
			<div class="blm_search_title">Location Selected<button type="button" id="blm_location_clear" onClick="blm_clear_location();">Clear</button><button type="button" id="blm_location_details" onClick="blm_location_details_change(true);">Show Details</button></div>

			<div class="blm_search_body">
				<div id="blm_location_choice_value"><?=$blm_formatted_address; ?></div>
				<div id="blm_location_choice_components">
					<ul>
						<?
						$comp = json_decode(base64_decode($blm_address_components));
						foreach($comp as $k => $c){
							if(!$c){$c='<em>N/A</em>';}
							echo '<li><strong>'.ucfirst(str_replace('_', ' ', $k)).':</strong> '.$c.'</li>';
						}
						?>
					</ul>
				</div>
				<input type="hidden" name="blm_formatted_address" id="blm_formatted_address" value="<?=$blm_formatted_address; ?>" />
				<input type="hidden" name="blm_address_components" id="blm_address_components" value="<?=$blm_address_components; ?>" />
				<input type="hidden" name="blm_latitude" id="blm_latitude" value="<?=$blm_latitude; ?>" />
				<input type="hidden" name="blm_longitude" id="blm_longitude" value="<?=$blm_longitude; ?>" />
			</div>
		</div>
	</div>

<?php
}

//Save the location input value inputted
function blm_location_meta_save($post_id) {

	//Checks save status
	$is_autosave = wp_is_post_autosave($post_id);
	$is_revision = wp_is_post_revision($post_id);
	$is_valid_nonce = (isset($_POST['blm_location_nonce']) && wp_verify_nonce($_POST[ 'blm_location_nonce'], basename( __FILE__ )))?'true':'false';

	//Exits script depending on save status
	if($is_autosave || $is_revision || !$is_valid_nonce){return;}

	//Checks for input and sanitizes/saves if needed
	if(isset($_POST['blm_formatted_address'])){update_post_meta($post_id, 'blm_formatted_address', sanitize_text_field(urldecode($_POST['blm_formatted_address'])));}
	if(isset($_POST['blm_address_components'])){update_post_meta($post_id, 'blm_address_components', sanitize_text_field($_POST['blm_address_components']));}
	if(isset($_POST['blm_formatted_address'])){update_post_meta($post_id, 'blm_latitude', sanitize_text_field($_POST['blm_latitude']));}
	if(isset($_POST['blm_formatted_address'])){update_post_meta($post_id, 'blm_longitude', sanitize_text_field($_POST['blm_longitude']));}

}
add_action('save_post', 'blm_location_meta_save' );

//Add post's metadata to head section
function blm_head() {

	//Retrieves the stored value from the database
	$blm_formatted_address = get_post_meta(get_the_ID(), 'blm_formatted_address', true);
	$blm_longitude = get_post_meta(get_the_ID(), 'blm_longitude', true);
	$blm_latitude = get_post_meta(get_the_ID(), 'blm_latitude', true);

	//only show tags if inside post
	if(is_single() && $blm_formatted_address && $blm_latitude && $blm_longitude){

		//Checks and displays the retrieved value
		echo '<meta property="geo:formatted_address" content="'.htmlentities($blm_formatted_address, ENT_QUOTES).'" />'."\n";
		echo '<meta property="geo:latitude" content="'.$blm_latitude.'" />'."\n";
		echo '<meta property="geo:longitude" content="'.$blm_longitude.'" />'."\n";

	}
}
add_action('wp_head', 'blm_head');

//CSS and JS
function blm_meta_scripts($hook){
	if('post.php' != $hook && 'post-new.php' != $hook){return;}
	wp_enqueue_script('blm_meta_js_geo', 'https://maps.googleapis.com/maps/api/js?sensor=true');
	wp_enqueue_script('blm_meta_js_init', plugin_dir_url(__FILE__).'js/meta.js', null, "1.0");
        wp_enqueue_style('blm_meta_css_main', plugin_dir_url(__FILE__).'css/meta.css', null, "1.0");
}
add_action('admin_enqueue_scripts', 'blm_meta_scripts');
?>
