/*eslint-env node*/
/*global module:false*/
module.exports = function(grunt) {

    grunt.initConfig({

        dir: {
            webapp: "src",
            tests: "test",
            dist: "dist",
            bower_components: "bower_components",
            localServerTestUrl: "http://localhost:8080/test-resources"
        },

        tests: {
            opaTimeout: 900000
        },

        connect: {
            options: {
                port: 8080,
                hostname: "*"
            },

            serve: {
                options: {
                    open: {
                        target: "http://localhost:8080/index.html"
                    }
                }
            },

            src: {},

            dist: {
                options: {
                    open: {
                        target: "http://localhost:8080/build.html"
                    }
                }
            }
        },

        openui5_connect: {
            options: {
                resources: [
                    "<%= dir.bower_components %>/openui5-sap.ui.core/resources",
                    "<%= dir.bower_components %>/openui5-sap.m/resources",
                    "<%= dir.bower_components %>/openui5-sap.ui.layout/resources",
                    "<%= dir.bower_components %>/openui5-themelib_sap_bluecrystal/resources"
                ]
            },

            serve: {
                options: {
                    appresources: ["."],
                    testresources: ["<%= dir.tests %>"]
                }
            },

            src: {
                options: {
                    appresources: ["."],
                    testresources: ["<%= dir.tests %>"]
                }
            },
            dist: {
                options: {
                    appresources: ".",
                    testresources: ["<%= dir.tests %>"]
                }
            }
        },

        openui5_preload: {
            component: {
                options: {
                    resources: {
                        cwd: "<%= dir.webapp %>",
                        prefix: "sap/ui/demo/masterdetail"
                    },
                    dest: "<%= dir.dist %>"
                },
                components: true,
                compress: true
            }
        },

        clean: {
            dist: "<%= dir.dist %>/"
        },

        copy: {
            dist: {
                files: [{
                    expand: true,
                    cwd: "<%= dir.webapp %>",
                    src: [
                        "**",
                        "!test/**"
                    ],
                    dest: "<%= dir.dist %>"
                }]
            }
        },

        eslint: {
            options: {
                quiet: true
            },

            all: ["<%= dir.tests %>", "<%= dir.webapp %>"],
            webapp: ["<%= dir.webapp %>"]
        },

        qunit: {
            options: {
                /* for debugging*/
                "--remote-debugger-autorun": "yes",
                "--remote-debugger-port": 8000
            },

            unit: {
                options: {
                    urls: [
                        "<%= dir.localServerTestUrl %>/unit/unitTests.qunit.html"
                    ]
                }

            },
            opa: {
                options: {
                    urls: [
                        "<%= dir.localServerTestUrl %>/integration/opaTests.qunit.html"
                    ],
                    // same as qunits timeout 90 seconds since opa test might take a while
                    timeout: "<%= tests.opaTimeout %>"
                }
            },
            opaPhone: {
                options: {
                    urls: [
                        "<%= dir.localServerTestUrl %>/integration/opaTestsPhone.qunit.html"
                    ],
                    // same as qunits timeout 90 seconds since opa test might take a while
                    timeout: "<%= tests.opaTimeout %>"
                },

                page: {
                    settings: {
                        userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 5_0_1 like Mac OS X) AppleWebKit/534.48 (KHTML, like Gecko) Version/5.1 Mobile/9A406 Safari/7534.48.3" // iOS userAgent string
                    }
                }
            }
        },

        replace: {
            example: {
                src: ["<%= dir.dist %>/*.js"],
                overwrite: true,
                replacements: [{
                    from: /(?:\$\{copyright\}|@copyright@)/g,
                    to: "Copyright 2015 c/o SAPTech15 demo"
                }]
            }
        }

    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-text-replace");
    grunt.loadNpmTasks("grunt-openui5");
    grunt.loadNpmTasks("grunt-eslint");
    grunt.loadNpmTasks("grunt-contrib-qunit");

    // Server task
    grunt.registerTask("serve", function() {
        grunt.task.run("openui5_connect:serve" + ":keepalive");
    });

    // Linting task
    grunt.registerTask("lint", ["eslint:all"]);

    // Build task
    grunt.registerTask("build", ["clean", "openui5_preload", "copy", "replace"]);
    grunt.registerTask("buildRun", ["build", "serve:dist"]);

    // Test task
    grunt.registerTask("test", ["openui5_connect:src", "qunit:unit", "qunit:opa"]);
    grunt.registerTask("unitTest", ["openui5_connect:src", "qunit:unit"]);
    grunt.registerTask("opaTest", ["openui5_connect:src", "qunit:opa"]);

    // Default task
    grunt.registerTask("default", [
        "lint:all",
        "test"
    ]);
};
