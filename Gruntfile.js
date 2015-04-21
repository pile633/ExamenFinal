var fs = require('node-fs-extra');

module.exports = function(grunt) {

	grunt.initConfig({
		jshint: {
			server: {
				src: ['Gruntfile.js', 
							'server/features/**/*.js',
							'server/server.js',
							'server/routes/**/*.js',
							'server/manager/**/*.js',
							'server/dao/**/*.js',
							'server/util/**/*.js',
							'server/middleware/**/*.js',
							'server/config/**/*.js'
						]
			},
			client: {
				options: {
					extract: 'auto'
				},
				src: ['server/public/*.html', 'server/public/elements/**/*.html', 'server/public/elements/**/*.js', 'server/public/util/**/*.js']
			}
		},
		cucumberjs: {
			options: {
				format: 'pretty'
			},
			features : ['server/features/*']
		},
		vulcanize: {
			default: {
				options: {
					csp: true,
					excludes: {
						imports: [
							"polymer.html"
						]
					}
				},
				files: {
					'server/public/dist/index.html': 'server/public/index.html'
				},
			}
		},
		'dist-client': {
			default: {}
		},
		shell: {
			runLocalServer: {
				command: 'DEBUG=social-scoreboard* node server/server'
			},
			runLocalServerWin32: {
				command: [
					'set DEBUG=social-scoreboard*',
					'node server/server'
				].join('&&')
			},
			apiaryCompile: {
				command: 'node ./server/api/apiary/apiary.preprocesor.js'
			},
			dredd: {
				command: 'CONFIG=dredd dredd ./server/api/apiary/apiary.apib http://localhost:8000 --hookfiles=./server/api/apiary/hooks.js'
			}
		},
		env: {
      cucumber : {
        CONFIG : "cucumber"
      }
    }
	});
	
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-cucumberjs');
	grunt.loadNpmTasks('grunt-vulcanize');
	grunt.loadNpmTasks('grunt-env');
	grunt.loadNpmTasks('grunt-shell');
	
	
	grunt.registerMultiTask('dist-client', 'Prepare client files to distribution', function() {
		var inDir = './server/public/';
		var outDir = inDir + 'dist/';
		grunt.log.writeln('Removing client/dist directory...');
		var done = this.async();
		fs.remove(outDir, function(err, result) {
			if (err) {
				grunt.log.error(err);
				done(err);
			} else {
				fs.mkdirsSync(outDir);
				grunt.task.run('vulcanize');
				fs.copySync(inDir + 'font', outDir + 'font');
				fs.copySync(inDir + 'img', outDir + 'img');
				fs.copySync(inDir + 'bower_components', outDir + 'bower_components');
				fs.copySync(inDir + 'css', outDir + 'css');
				fs.copySync(inDir + 'elements/point-setter/presenter.js', outDir  + 'elements/point-setter/presenter.js'); //TODO Minify this- Vulvanize can't do it
				done();
			}
		});
	});
	
	grunt.registerTask('server-test', ['env:cucumber', 'jshint:server', 'cucumberjs']);
	
	grunt.registerTask('apiary', ['shell:apiaryCompile']);
	grunt.registerTask('dredd', ['shell:apiaryCompile', 'shell:dredd']);
	
	grunt.registerTask('default', ['jshint:client', 'jshint:server', 'shell:runLocalServer']);
	
	grunt.registerTask('set-debug-and-run', 'Set DEBUG env var', function() {
		if (process.platform === "win32") {
		    grunt.task.run('shell:runLocalServerWin32');
		} else {
		    grunt.task.run('shell:runLocalServer');
		}
	});
	
	grunt.registerTask('default', ['jshint:client', 'jshint:server', 'set-debug-and-run']);

};
