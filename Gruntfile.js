'use strict';
module.exports = function(grunt) {

    // Load grunt tasks automatically, when needed
    require('jit-grunt')(grunt, {
        connect: 'grunt-contrib-connect',
        useminPrepare: 'grunt-usemin',
        ngtemplates: 'grunt-angular-templates',
        protractor: 'grunt-protractor-runner',
        injector: 'grunt-injector',
        configureProxies: 'grunt-connect-proxy',
        cachebreaker: 'grunt-cache-breaker',
        express: 'grunt-express-server'
    });

    // Time how long tasks take. Can help when optimizing build times
    require('time-grunt')(grunt);

    // Define the configuration for all the tasks
    grunt.initConfig({

        // Project settings
        pkg: grunt.file.readJSON('package.json'),

        /**********************
         * Build Targets ******
         *********************/

        // Empties folders to start fresh
        clean: {
            build: './target/build',
            dist: './target/dist'
        },
        // Copies remaining files to places other tasks can use
        copy: {
            build: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: './src/main/javascript',
                        dest: './target/build',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            'vendor/**/*',
                            'codemirror/**/*',
                            'editor/**/*',
                            'index.html',
                            '!**/*.spec.js',
                            '!**/*.mock.js',
                            '!**/*.less'
                        ]
                    }
                ]
            },
            dist: {
                files: [
                    {
                        expand: true,
                        dot: true,
                        cwd: './target/build',
                        dest: './target/dist',
                        src: [
                            '*.{ico,png,txt}',
                            '.htaccess',
                            'vendor/**/*',
                            'codemirror/**/*',
                            'locale/**/*',
                            'index.html'
                        ]
                    }
                ]
            }
        },

        // Package all the html partials into a single javascript payload
        ngtemplates: {
            'app': {
                cwd: './target/build/',
                src: ['editor/**/*.tpl.html'],
                dest: './target/build/editor/editor.templates.js',
                options: {
                    module: 'atlas.query.editor.templates',
                    standalone: true,
                    htmlmin: {
                        collapseBooleanAttributes: true,
                        collapseWhitespace: true,
                        removeAttributeQuotes: true,
                        removeComments: true,
                        removeEmptyAttributes: true,
                        removeRedundantAttributes: true,
                        removeScriptTypeAttributes: true,
                        removeStyleLinkTypeAttributes: true
                    },
                    bootstrap: function(module, script, options) {
                        var license = '/**\n' +
                            ' * @license Atlas Query Editor\n' +
                            ' *\n' +
                            ' * Copyright (C) 2016 Upwork.com\n' +
                            ' *\n' +
                            ' * This file is licensed under the Apache license, Version 2.0 (the "License").\n' +
                            ' * See the LICENSE file for details.\n' +
                            ' *\n' +
                            ' * Unless required by applicable law or agreed to in writing, software\n' +
                            ' * distributed under the License is distributed on an "AS IS" BASIS,\n' +
                            ' * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n' +
                            ' * See the License for the specific language governing permissions and\n' +
                            ' * limitations under the License.\n' +
                            ' **/\n' +
                            '\n';
                        return license +
                            options.angular + ".module('" + module + "'" + (options.standalone ? ', []' : '') + ").run(['$templateCache', function($templateCache) {\n" + script + "\n}]);\n";
                    }
                }
            }
        },

        // Automatically inject Bower components into the app
        wiredep: {
            build: {
                src: './target/build/index.html',
                cwd: '.',
                ignorePath: '../../src/main/javascript/', // This is to create the proper path in the html file
                exclude: [
                    /angular-mocks.js/
                ],
                'overrides': {
                    'bootstrap': {
                        'main': [
                            'dist/js/bootstrap.js',
                            'dist/css/bootstrap.css'
                        ]
                    },
                    'jquery-ui': {
                        'main': [
                            'jquery-ui.js',
                            'themes/base/jquery-ui.css'
                        ]
                    },
                    'font-awesome': {
                        'main': [
                            'css/font-awesome.css'
                        ]
                    },
                    'codemirror': {
                        'main': [
                            'lib/codemirror.js',
                            'lib/codemirror.css',
                            'addon/mode/simple.js',
                            'addon/hint/show-hint.js',
                            'addon/hint/show-hint.css',
                            'theme/seti.css'
                        ]
                    }
                }
            }
        },

        injector: {
            options: {
                addRootSlash: false
            },
            // Inject application script files into index.html (doesn't include bower)
            build_scripts: {
                options: {
                    transform: function(filePath) {
                        filePath = filePath.replace('./', '');
                        filePath = filePath.replace('target/build/', '');
                        return '<script src="' + filePath + '"></script>';
                    },
                    starttag: '<!-- injector:js -->',
                    endtag: '<!-- endinjector -->'
                },
                files: {
                    './target/build/index.html': [
                        [
                            // Order matters
                            './target/build/codemirror/**/*.js',
                            './target/build/editor/**/*.js'
                        ]
                    ]
                }
            },

            dist_scripts: {
                options: {
                    transform: function(filePath) {
                        filePath = filePath.replace('./', '');
                        filePath = filePath.replace('target/dist/', '');
                        return '<script src="' + filePath + '"></script>';
                    },
                    starttag: '<!-- injector:js -->',
                    endtag: '<!-- endinjector -->'
                },
                files: {
                    './target/dist/index.html': [
                        [
                            // Order matters
                            './target/dist/codemirror/**/*.js',
                            './target/dist/editor/status.js'
                        ]
                    ]
                }
            }
        },

        /*********************
         ** Dist targets *****
         *********************/

        // Allow the use of non-minsafe AngularJS files. Automatically makes it
        // minsafe compatible so Uglify does not destroy the ng references
        ngAnnotate: {
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: './target/build/',
                        src: [
                            'editor/**/*.js'
                        ],
                        dest: './target/build/'
                    }
                ]
            }
        },

        concat: {
            options: {
                separator: ';'
            },
            dist: {
                files: {
                    './target/dist/editor/editor.js': ['./target/build/editor/**/*.js']
                }
            }
        },

        uglify: {
            options: {
                compress: {
                    global_defs: {
                        'DEBUG': false
                    },
                    dead_code: true
                },
                preserveComments: true,
                screwIE8: true,
                quoteStyle: 1 // Use single quotes everywhere
            },
            dist: {
                files: [
                    {
                        expand: true,
                        cwd: './target/dist/editor/',
                        src: '**/*.js',
                        dest: './target/dist/editor/'
                    },
                    {
                        expand: true,
                        cwd: './target/dist/codemirror/',
                        src: '**/*.js',
                        dest: './target/dist/codemirror/'
                    }
                ]
            }
        },

        cachebreaker: {
            dist: {
                options: {
                    match: [
                        {
                            'editor.js': './target/dist/editor/editor.js'
                        }
                    ],
                    replacement: 'md5'
                },
                files: {
                    src: ['./target/dist/index.html']
                }
            }
        },

        /********************
         ** Server targets **
         ********************/
        express: {
            options: {
                // Override defaults here
            },
            dev: {
                options: {
                    script: 'server.js'
                }
            }
        },

        watch: {
            rebuild: {
                files: [
                    './src/main/javascript/*',
                    './src/main/javascript/**/*'
                ],
                options: {
                    livereload: false
                },
                tasks: ['build']
            }
        }

    });

    /*****************
     ** Run Targets **
     *****************/

    grunt.registerTask('build', [
        // Copies all files from ./src/main/javascript (html, css, assets) to ./target/build/, except .less and
        'copy:build',
        // Convert tpl.html to .templates.js files
        'ngtemplates',
        // Injectors for ./target/build/index.html)
        // 1. Injects bower scripts in ./target/build/index.html
        'wiredep:build',
        // 2. Injects scripts in ./target/build/index.html
        'injector:build_scripts'
    ]);

    grunt.registerTask('build-clean', [
        'clean',
        'build'
    ]);

    grunt.registerTask('build-watch', function(target) {
        grunt.task.run([
            'build-clean',
            'watch'
        ]);
    });

    grunt.registerTask('dist', [
        'clean',
        'build',
        // Copy files, except our scripts to dist folder (html, assets, bower, vendor)
        'copy:dist',
        // Annotate, concat and uglify our scripts
        'ngAnnotate',
        'concat',
        'uglify',
        'cssmin',
        // Inject the minified files in index.html
        'injector:dist_scripts',
        'injector:dist_css',
        //Rename files
        'cachebreaker'
    ]);

    grunt.registerTask('serve', function(target) {
        grunt.task.run([
            'build-clean',
            // 'configureProxies:connect',
            // 'connect',
            'express',
            'watch'
        ]);
    });

    // Used for delaying livereload until after server has restarted
    grunt.registerTask('wait', function() {
        grunt.log.ok('Waiting for server reload...');

        var done = this.async();

        setTimeout(function() {
            grunt.log.writeln('Done waiting!');
            done();
        }, 1500);
    });
};
