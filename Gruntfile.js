var files = [
	'./src/attrs.module.js',
	'./src/BOF.js',
	'./src/DateUtil.js',
	'./src/Template.js',
	'./src/EventDispatcher.js', 
	'./src/CSS3Calibrator.js',
	'./src/Device.js',
	'./src/StyleSession.js',
	'./src/Animator.js',
	'./src/Scroller.js',
	'./src/Selector.js',
	'./src/Extentions.js',
	'./src/Importer.js',
	'./src/EOF.js'
];

var files_light = [
	'./src/BOF.js',
	'./src/DateUtil.js',
	'./src/Template.js',
	'./src/EventDispatcher.js', 
	'./src/CSS3Calibrator.js',
	'./src/Device.js',
	'./src/StyleSession.js',
	'./src/Animator.js',
	'./src/Scroller.js',
	'./src/Selector.js',
	'./src/Extentions.js',
	'./src/EOF.js'
];

var files_tiny = [
	'./src/BOF.js',
	'./src/CSS3Calibrator.js',
	'./src/Device.js',
	'./src/StyleSession.js',
	'./src/Selector.js',
	'./src/EOF.js'
];

module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');
	
	grunt.initConfig({
		pkg: pkg,
		http: {
			'attrs.module': {
				options: {
					url: 'https://raw.githubusercontent.com/attrs/attrs.module/master/build/attrs.module.js',
				},
				dest: './src/attrs.module.js'
			}
		},
		concat: {
			options: {
				separator: '\n\n',
				stripBanners: true,
				banner: '/*!\n' + 
					' * <%= pkg.name %> - <%= pkg.description %> (MIT License)\n' +
					' * \n' +
					' * @author: <%= pkg.author.name %> (<%= pkg.author.url %>)\n' + 
					' * @version: <%= pkg.version %>\n' + 
					' * @date: <%= grunt.template.today("yyyy-mm-dd H:M:s") %>\n' + 
					'*/\n\n',
				process: function(src, filepath) {
					return src
						.replace('{pkg.bundleId}', pkg.bundleId || '')
						.replace('{pkg.name}', pkg.name || '')
						.replace('{pkg.description}', pkg.description || '')
						.replace('{pkg.version}', pkg.version || '')
						.replace('{pkg.author}', JSON.stringify(pkg.author) || '{}')
						.replace('{pkg.repository}', JSON.stringify(pkg.repository) || '{}')
						.replace('{pkg.licenses}', JSON.stringify(pkg.licenses) || '{}')
						.replace('{pkg.dependencies}', JSON.stringify(pkg.dependencies) || '{}')
						.replace('{pkg.keywords}', JSON.stringify(pkg.keywords) || '{}')
						.replace('{pkg.bugs}', JSON.stringify(pkg.bugs) || '{}')
		        }
			},
			basic_and_extras: {
		      files: {
		        'build/attrs.dom.js': files,
		        'build/attrs.dom.light.js': files_light,
				'build/attrs.dom.tiny.js': files_tiny,
				
		        'build/attrs.dom-<%= pkg.version %>.js': files,
		        'build/attrs.dom.light-<%= pkg.version %>.js': files_light,
				'build/attrs.dom.tiny-<%= pkg.version %>.js': files_tiny
		      }
		    }
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dist: {
				files: {
					'build/attrs.dom.min.js': ['build/attrs.dom.js'],
					'build/attrs.dom.light.min.js': ['build/attrs.dom.light.js'],
					'build/attrs.dom.tiny.min.js': ['build/attrs.dom.tiny.js'],
					
					'build/attrs.dom.min-<%= pkg.version %>.js': ['build/attrs.dom.js'],
					'build/attrs.dom.light.min-<%= pkg.version %>.js': ['build/attrs.dom.light.js'],
					'build/attrs.dom.tiny.min-<%= pkg.version %>.js': ['build/attrs.dom.tiny.js']
				}
			}
		},
		qunit: {
			files: ['test/**/*.html']
		},
		jshint: {
			files: ['Gruntfile.js', 'src/**/*.js', 'test/**/*.js'],
			options: {
				// options here to override JSHint defaults
				globals: {
					console: true,
					module: true,
					document: true
				}
			}
		},
		watch: {
			files: ['Gruntfile.js', 'src/**/*'],
			tasks: ['concat', 'uglify'],
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-http');

	grunt.registerTask('refresh', ['http', 'concat', 'uglify']);
	grunt.registerTask('default', ['concat', 'uglify']);
	grunt.registerTask('lint', ['http', 'concat', 'uglify', 'jshint']);
	grunt.registerTask('test', ['http', 'concat', 'uglify', 'jshint', 'qunit']);
};