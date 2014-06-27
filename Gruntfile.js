var files = [
	'./src/BOF.js',
	'./src/DateUtil.js',
	'./src/TagTranslator.js',
	'./src/Template.js',
	'./src/EventDispatcher.js', 
	'./src/CSS3Calibrator.js',
	'./src/StyleSession.js',
	'./src/Selector.js',
	'./src/Animator.js',
	'./src/EOF.js'
];

module.exports = function(grunt) {
	var pkg = grunt.file.readJSON('package.json');
	
	grunt.initConfig({
		pkg: pkg,
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
		        'build/dom.alien.js': files			
		      }
		    }
		},
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			dist: {
				files: {
					'build/dom.alien.min.js': ['build/dom.alien.js']
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
			tasks: ['concat'],
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');

	grunt.registerTask('test', ['concat', 'uglify', 'jshint', 'qunit']);
	grunt.registerTask('lint', ['concat', 'uglify', 'jshint']);
	grunt.registerTask('default', ['concat', 'uglify']);
};