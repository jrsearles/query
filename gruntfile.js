module.exports = function(grunt) {

	var q = {
		src: [
			"src/query.js",
			"src/util.js",
			"src/filtering.js",
			"src/qualifiers.js",
			"src/projections.js",
			"src/aggregates.js",
			"src/grouping.js",
			"src/sorting.js",
			"src/joins.js",
			"src/partitioning.js",
			"src/set.js"
		]
	};

	grunt.initConfig({
		pkg: grunt.file.readJSON("package.json"),
		meta: {
			prefix: "(function(global) {\n\"use strict\";\n",
			postfix: "\nglobal.Query = Q;\n})(this);"
		},
		concat: {
			options: { 
				banner: "<%= meta.prefix %>",
				footer: "<%= meta.postfix %>",
				separator: "\n"
			},
			dist: {
				dest: "dist/query.js",
				src: q.src
			}
		},
		uglify: {
			options: {
				banner: "/* <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n"
			},
			build: {
				files: {
					"dist/query.min.js": "dist/query.js",
					"dist/legacy.min.js": "src/legacy.js"
				}
			}
		},
		jasmine: {
			pivotal: {
				src: q.src,
				options: {
					specs: "tests/*.js"
				}
			}
		},
		jshint: {
			files: ["dist/query.js"],
			options: {
				eqnull: true,
				curly: true,
				forin: true,
				newcap: true,
				noempty: false,
				plusplus: false,
				quotmark: "double",
				nonew: false,
				unused: true,
				globals: ["Query"]
			}
		}
	});

	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-contrib-jasmine");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-concat");

	// todo: would prefer not to concat files to run jshint
	grunt.registerTask("tests", ["jasmine","concat","jshint"]);
	grunt.registerTask("default", ["jasmine","concat","jshint","uglify"]);
};