/*
 * Device : Evalutate platform informations & stylesheet validation
 *
 * <pre>
 *	- Chrome
 *	Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1547.62 Safari/537.36 
 *
 *	- iPhone user agent
 *	Mozilla/5.0 (iPhone; U; CPU like Mac OS X; en) AppleWebKit/420+ (KHTML, like Gecko) Version/3.0 Mobile/1A543a Safari/419.3
 *
 *	- iPod Touch user agent
 *	Mozilla/5.0 (iPod; U; CPU like Mac OS X; en) AppleWebKit/420.1 (KHTML, like Gecko) Version/3.0 Mobile/3A101a Safari/419.3
 *
 *	- iPad user agent
 *	Mozilla/5.0 (iPad; U; CPU OS 3_2 like Mac OS X; en-us) AppleWebKit/531.21.10 (KHTML, like Gecko) Version/4.0.4 Mobile/7B334b Safari/531.21.10
 *
 *	- Android user agent
 *	Mozilla/5.0 (Linux; U; Android 1.1; en-gb; dream) AppleWebKit/525.10+ (KHTML, like Gecko) Version/3.0.4 Mobile Safari/523.12.2
 *	Mozilla/5.0 (Linux; U; Android 2.1; en-us; Nexus One Build/ERD62) AppleWebKit/530.17 (KHTML, like Gecko) Version/4.0 Mobile Safari/530.17
 *	
 *	- NetFront
 *	SAMSUNG-C5212/C5212XDIK1 NetFront/3.4 Profile/MIDP-2.0 Configuration/CLDC-1.1
 *	MozillaMozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.5 (screen 824x1200;rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.5 (screen 824x1200;rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.5 (screen 824x1200; rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.5 (screen 600x800; rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.5 (screen 1200x824; rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.3 (screen 600x800; rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.3 (screen 1200x824; rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.1 (screen 824x1200; rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.0 (screen 824x1200; rotate)
 *	Mozilla/4.0 (compatible; Linux 2.6.22) NetFront/3.4 Kindle/2.0 (screen 600x800)
 *	Mozilla/4.0 (compatible; Linux 2.6.10) NetFront/3.4 Kindle/1.0 (screen 600x800)
 *	NetFront 3.3
 *	SonyEricssonK800c/R8BF Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1
 *	SonyEricssonK530i/R6BA Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1
 *	SonyEricssonK530c/R8BA Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1
 *	SonyEricssonK510c/R4EA Browser/NetFront/3.3 Profile/MIDP-2.0 Configuration/CLDC-1.1
 *	Mozilla/4.0 (compatible; Linux 2.6.10) NetFront/3.3 Kindle/1.0 (screen 600x800)
 *	
 *	- BlackBerry user agent
 *	BlackBerry9000/4.6.0.266 Profile/MIDP-2.0 Configuration/CLDC-1.1 VendorID/120
 * </pre>
 *
 * @author: joje(joje.attrs@gmail.com)
*/

var Device = (function() {
	"use strict"

	// class device
	function Device() {
		var nav = window.navigator;
		var _platform = nav.platform;
		var agent = nav.userAgent;
		
		var platform = {
			name: '',
			version: '',
			codename: '',
			type: ''
		};
		var device = 'desktop';
		var engine = '';
		var browser = '';
		var version = '';
		var retina = ('devicePixelRatio' in window && window.devicePixelRatio > 1);
		var touchable = 'ontouchstart' in window;
		var prefix = '';
		var hasTransform = false;
		var has3d = false;
		var resolution = {
			width: screen.width,
			height: screen.height 
		};
		
		if( ~agent.indexOf('Seamonkey/') ) engine = 'gecko', browser = 'seamonkey', prefix = '-moz-';
		else if( ~agent.indexOf('Firefox/') ) engine = 'gecko', browser = 'firefox', prefix = '-moz-';
		else if( ~agent.indexOf('Opera/') ) engine = 'presto', browser = 'opera', prefix = '-o-';
		else if( ~agent.indexOf('MSIE ') ) engine = 'trident', browser = 'msie', prefix = '-ms-';
		else if( ~agent.indexOf('webOS/') ) engine = 'webkit', browser = 'webos', prefix = '-webkit-';
		else if( ~agent.indexOf('Chromium/') ) engine = 'webkit', browser = 'chromium', prefix = '-webkit-';
		else if( ~agent.indexOf('Chrome/') ) engine = 'webkit', browser = 'chrome', prefix = '-webkit-';
		else if( ~agent.indexOf('Android') ) engine = 'webkit', browser = 'android', prefix = '-webkit-';
		else if( ~agent.indexOf('Safari/') ) engine = 'webkit', browser = 'safari', prefix = '-webkit-';
		else if( ~agent.indexOf('Kindle/')) engine = 'netfront', browser = 'kindle', prefix = '', platform = {name: 'kindle', type: 'tablet'};
		else if( ~agent.indexOf('NetFront/')) engine = 'netfront', browser = 'netfront', prefix = '';
		else if( ~agent.indexOf('BlackBerry')) engine = 'webkit', browser = 'blackberry', prefix = '', platform = {name: 'kindle', type: 'tablet'};
		else if( ~agent.indexOf('AppleWebKit/') ) engine = 'webkit', browser = 'webkit', prefix = '-webkit-';
		else if( ~agent.indexOf('Gecko/') ) engine = 'gecko', browser = 'gecko', prefix = '-moz-';
				
		if( !platform.name ) {
			if( ~agent.indexOf('(iPhone;') ) device = 'iphone', platform = {name: 'ios', type: 'mobile'};
			else if( ~agent.indexOf('(iPad;') ) device = 'ipad', platform = {name: 'ios', type: 'tablet'};
			else if( ~agent.indexOf('(iPod;') ) device = 'ipod', platform = {name: 'ios', type: 'mobile'};
			else if( ~agent.indexOf('Android') && ~agent.indexOf('Mobile') ) device = 'android', platform = {name: 'android', type: 'mobile'};
			else if( ~agent.indexOf('Android') ) device = 'android', platform = {name: 'android', type: 'tablet'};
		}

		if( !platform.type ) {
			if( (/ipad|android 3|xoom|sch-i800|playbook|tablet|kindle/i.test(agent.toLowerCase())) ) platform.type = 'tablet';
			else if( (/iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(agent.toLowerCase())) ) platform.type = 'mobile';
		}
		
		if( !platform.name ) {			
			if( ~agent.indexOf('Mac OS X;') ) platform = {name: 'osx', type: 'desktop'};
			else if( ~agent.indexOf('Mac OS') ) platform = {name: 'mac', type: 'desktop'};
			else if( ~agent.indexOf('Windows;') || _platform === 'Win32' ) platform = {name: 'windows', type: 'desktop'};
			else if( ~agent.indexOf('Linux;') ) platform = {name: 'linux', type: 'desktop'};
			else platform.name = _platform;
		}
		
		var style = document.documentElement.style;
		if( engine == 'webkit' ) hasTransform = ('webkitTransform' in style), has3d = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
		else if( engine == 'gecko' ) hasTransform = ('MozTransform' in style);
		else if( engine == 'presto' ) hasTransform = ('OTransform' in style);
		else if( engine == 'trident' ) hasTransform = ('MSTransform' in style);
		if( !hasTransform ) hasTransform = ('Transform' in style);
		
		var index;
		if( browser === 'android' && ~(index = agent.indexOf('Android')) ) version = platform.version = agent.substring(index + 7, agent.indexOf(' ', index + 1));
		else if( browser === 'msie' && ~(index = agent.indexOf('MSIE ')) ) version = agent.substring(index + 5, agent.indexOf(';', index + 1));
		else if( browser === 'chrome' && ~(index = agent.indexOf('Chrome/')) ) version = agent.substring(index + 7, agent.indexOf(' ', index + 1));
		else if( browser === 'safari' && ~(index = agent.indexOf('Version/')) ) version = agent.substring(index + 8, agent.indexOf(' ', index + 1));
		
		this.agent = agent;
		this.platform = platform;
		this.device = device;
		this.engine = engine;
		this.browser = browser;
		this.version = version;
		this.retina = retina;
		this.touchable = touchable;
		this.prefix = prefix;
		this.hasTransform = hasTransform;
		this.has3d = has3d;
		this.resolution = resolution;

		this.calibrator = new CSS3Calibrator(this);

		// gecko 의 경우 innerText 바인딩
		if( engine === 'gecko' && window.HTMLElement && window.HTMLElement.prototype.__defineGetter__ ) {
			HTMLElement.prototype.__defineGetter__("innerText",function() {
				if(this.textContent) {
					return(this.textContent)
				} 
				else {
					var r = this.ownerDocument.createRange();
					r.selectNodeContents(this);
					return r.toString();
				}
			});
			
			HTMLElement.prototype.__defineSetter__("innerText",function(sText) {
				this.innerHTML = sText
			});
		}

		//console.log('device', JSON.stringify(this, null, '\t'));
	}

	Device.prototype = {
		is: function(query) {
			// engine
			if( query === 'webkit' ) return (this.engine === 'webkit');
			if( query === 'gecko' ) return (this.engine === 'gecko');
			if( query === 'netfront' ) return (this.engine === 'netfront');
			if( query === 'presto' ) return (this.engine === 'presto');
			if( query === 'trident' ) return (this.engine === 'trident');

			// platform type
			if( query === 'phone' ) return (this.platform.type === 'phone');
			if( query === 'tablet' ) return (this.platform.type === 'tablet');
			if( query === 'dsektop' ) return (this.platform.type === 'dsektop');

			// platform name
			if( query === 'ios' ) return (this.platform.name === 'ios');
			if( query === 'iphone' ) return (this.device === 'iphone');
			if( query === 'ipad' ) return (this.device === 'ipad');
			if( query === 'ipod' ) return (this.device === 'ipod');			
			if( query === 'android' ) return (this.platform.name === 'android');
			if( query === 'mac' ) return (this.platform.type === 'osx' || this.platform.type === 'mac');
			if( query === 'osx' ) return (this.platform.name === 'osx');
			if( query === 'windows' ) return (this.platform.name === 'windows');
			if( query === 'linux' ) return (this.platform.name === 'linux');
			
			// features
			if( query === 'retina' ) return this.retina;
			if( query === 'touchable' ) return this.touchable;
			if( query === '3d' ) return this.has3d;
			if( query === 'transform' ) return this.hasTransform;
			
			// browser
			if( query === 'ie' || query === 'ms' || query === 'msie' ) return (this.browser === 'msie');
			if( query === 'firefox' ) return (this.browser === 'firefox');
			if( query === 'kindle' ) return (this.browser === 'kindle');
			if( query === 'opera' ) return (this.browser === 'opera');
			if( query === 'chrome' ) return (this.browser === 'chrome');
			if( query === 'chromium' ) return (this.browser === 'chromium');
			if( query === 'safari' ) return (this.browser === 'safari');
			if( query === 'blackberry' ) return (this.browser === 'blackberry');
			if( query === 'webkit browser' ) return (this.browser === 'webkit');
			if( query === 'android browser' ) return (this.browser === 'android');			

			return false;
		}
	};

	return new Device();
})();
